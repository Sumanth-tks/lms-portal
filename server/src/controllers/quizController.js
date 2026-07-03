const prisma = require('../config/db');
const { success, error } = require('../utils/apiResponse');
const { executeCode } = require('../utils/mockJudge');

async function createQuiz(req, res) {
  try {
    const { moduleId, title, type, timeLimitMinutes, maxRetakes, scorePolicy, maxScore, weekNumber, questions } = req.validated;

    const quiz = await prisma.quiz.create({
      data: {
        moduleId: moduleId || null,
        title,
        type,
        timeLimitMinutes: timeLimitMinutes || null,
        maxRetakes: maxRetakes || 0,
        scorePolicy: scorePolicy || 'BEST',
        maxScore,
        weekNumber: weekNumber || null,
        createdBy: req.user.id,
        questions: questions ? {
          create: questions.map((q, i) => ({
            questionType: q.questionType,
            question: q.question,
            optionsJson: q.optionsJson || null,
            correctAnswer: q.correctAnswer || null,
            testCasesJson: q.testCasesJson || null,
            points: q.points,
            order: i,
          })),
        } : undefined,
      },
      include: { questions: { orderBy: { order: 'asc' } } },
    });

    return success(res, quiz, 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function listQuizzes(req, res) {
  try {
    const { moduleId, weekNumber } = req.query;
    const where = {};
    if (moduleId) where.moduleId = moduleId;
    if (weekNumber) where.weekNumber = Number(weekNumber);
    if (req.user.role === 'INTERN') where.isPublished = true;

    const quizzes = await prisma.quiz.findMany({
      where,
      include: {
        module: { select: { id: true, title: true, course: { select: { title: true, weekNumber: true } } } },
        _count: { select: { questions: true, attempts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return success(res, quizzes);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function getQuiz(req, res) {
  try {
    const { id } = req.params;

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { order: 'asc' } },
        module: { select: { id: true, title: true, course: { select: { title: true, weekNumber: true } } } },
      },
    });

    if (!quiz) return error(res, 'Quiz not found', 404);

    if (req.user.role === 'INTERN') {
      quiz.questions = quiz.questions.map((q) => ({
        ...q,
        correctAnswer: undefined,
        testCasesJson: q.questionType.startsWith('CODE_') ? { count: (q.testCasesJson || []).length } : undefined,
      }));
    }

    return success(res, quiz);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function updateQuiz(req, res) {
  try {
    const { id } = req.params;
    const data = {};
    const fields = ['title', 'type', 'timeLimitMinutes', 'maxRetakes', 'scorePolicy', 'maxScore', 'weekNumber', 'isPublished'];
    fields.forEach((f) => {
      if (req.validated[f] !== undefined) data[f] = req.validated[f];
    });

    const quiz = await prisma.quiz.update({ where: { id }, data });
    return success(res, quiz);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function deleteQuiz(req, res) {
  try {
    await prisma.quiz.delete({ where: { id: req.params.id } });
    return success(res, { message: 'Quiz deleted' });
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function addQuestion(req, res) {
  try {
    const { quizId } = req.params;
    const { questionType, question, optionsJson, correctAnswer, testCasesJson, points } = req.validated;

    const count = await prisma.quizQuestion.count({ where: { quizId } });

    const q = await prisma.quizQuestion.create({
      data: {
        quizId,
        questionType,
        question,
        optionsJson: optionsJson || null,
        correctAnswer: correctAnswer || null,
        testCasesJson: testCasesJson || null,
        points,
        order: count,
      },
    });

    return success(res, q, 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function deleteQuestion(req, res) {
  try {
    await prisma.quizQuestion.delete({ where: { id: req.params.questionId } });
    return success(res, { message: 'Question deleted' });
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function submitAttempt(req, res) {
  try {
    const { quizId } = req.params;
    const { answers } = req.validated;
    const internId = req.user.id;

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: { orderBy: { order: 'asc' } } },
    });
    if (!quiz) return error(res, 'Quiz not found', 404);
    if (!quiz.isPublished) return error(res, 'Quiz not published', 400);

    const existingAttempts = await prisma.quizAttempt.count({
      where: { quizId, internId },
    });
    if (existingAttempts > quiz.maxRetakes) {
      return error(res, `Max attempts (${quiz.maxRetakes + 1}) reached`, 400);
    }

    let totalScore = 0;
    const gradedAnswers = [];

    for (const q of quiz.questions) {
      const answer = answers.find((a) => a.questionId === q.id);
      const studentAnswer = answer?.answer || '';
      let earned = 0;
      let autoGraded = true;

      if (q.questionType === 'MCQ_SINGLE' || q.questionType === 'MCQ_MULTI') {
        if (studentAnswer === q.correctAnswer) {
          earned = q.points;
        }
      } else if (q.questionType === 'CODE_PYTHON' || q.questionType === 'CODE_SQL') {
        const lang = q.questionType === 'CODE_PYTHON' ? 'python' : 'sql';
        const result = await executeCode(studentAnswer, lang, q.testCasesJson || []);
        if (result.allPassed) {
          earned = q.points;
        } else {
          earned = Math.round((result.passedTests / result.totalTests) * q.points);
        }
      } else {
        autoGraded = false;
      }

      totalScore += earned;
      gradedAnswers.push({
        questionId: q.id,
        answer: studentAnswer,
        earned,
        maxPoints: q.points,
        autoGraded,
      });
    }

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        internId,
        answersJson: gradedAnswers,
        score: totalScore,
        maxScore: quiz.maxScore,
        attemptNumber: existingAttempts + 1,
        submittedAt: new Date(),
      },
    });

    return success(res, attempt, 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function getAttempts(req, res) {
  try {
    const { quizId } = req.params;
    const where = { quizId };

    if (req.user.role === 'INTERN') {
      where.internId = req.user.id;
    }

    const attempts = await prisma.quizAttempt.findMany({
      where,
      include: {
        intern: { select: { id: true, name: true, email: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return success(res, attempts);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

module.exports = {
  createQuiz, listQuizzes, getQuiz, updateQuiz, deleteQuiz,
  addQuestion, deleteQuestion, submitAttempt, getAttempts,
};

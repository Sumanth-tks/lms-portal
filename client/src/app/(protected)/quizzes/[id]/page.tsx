'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { Quiz, QuizAttempt, QuizQuestion } from '@/types';
import { ArrowLeft, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';
import Link from 'next/link';

export default function QuizDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const isIntern = user?.role === 'INTERN';

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [taking, setTaking] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Question form for mentor
  const [showQForm, setShowQForm] = useState(false);
  const [qForm, setQForm] = useState({
    questionType: 'MCQ_SINGLE' as string,
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 10,
  });

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t && t <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return t ? t - 1 : 0;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  async function loadData() {
    const [quizRes, attemptsRes] = await Promise.all([
      api.get(`/quizzes/${id}`),
      api.get(`/quizzes/${id}/attempts`),
    ]);
    setQuiz(quizRes.data.data);
    setAttempts(attemptsRes.data.data);
    setLoading(false);
  }

  function startQuiz() {
    setTaking(true);
    setAnswers({});
    if (quiz?.timeLimitMinutes) {
      setTimeLeft(quiz.timeLimitMinutes * 60);
    }
  }

  async function handleSubmitQuiz() {
    if (!quiz) return;
    setSubmitting(true);
    try {
      const answerArray = (quiz.questions || []).map((q) => ({
        questionId: q.id,
        answer: answers[q.id] || '',
      }));
      await api.post(`/quizzes/${id}/submit`, { answers: answerArray });
      setTaking(false);
      setTimeLeft(null);
      await loadData();
    } catch {
      // handled
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post(`/quizzes/${id}/questions`, {
        questionType: qForm.questionType,
        question: qForm.question,
        optionsJson: qForm.questionType.startsWith('MCQ') ? qForm.options.filter(Boolean) : undefined,
        correctAnswer: qForm.correctAnswer || undefined,
        points: qForm.points,
      });
      setShowQForm(false);
      setQForm({ questionType: 'MCQ_SINGLE', question: '', options: ['', '', '', ''], correctAnswer: '', points: 10 });
      await loadData();
    } catch {
      // handled
    }
  }

  if (loading || !quiz) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary-400)] border-t-transparent" />
      </div>
    );
  }

  const canTake = isIntern && quiz.isPublished && !taking;
  const attemptsUsed = attempts.filter((a) => a.internId === user?.id).length;
  const hasAttemptsLeft = attemptsUsed <= quiz.maxRetakes;

  // Taking quiz view
  if (taking && quiz.questions) {
    const mins = timeLeft ? Math.floor(timeLeft / 60) : 0;
    const secs = timeLeft ? timeLeft % 60 : 0;

    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[var(--slate-800)]">{quiz.title}</h1>
          {timeLeft !== null && (
            <div className="flex items-center gap-2 rounded-lg bg-[var(--rose-50)] px-4 py-2 text-sm font-mono font-bold text-[var(--rose-500)]">
              <Clock className="h-4 w-4" />
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {quiz.questions.map((q, i) => (
            <div key={q.id} className="glass-card p-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--slate-300)]">Question {i + 1}</span>
                <span className="text-xs text-[var(--slate-300)]">{q.points} pts</span>
              </div>
              <p className="mb-4 text-sm font-medium text-[var(--slate-800)]">{q.question}</p>

              {(q.questionType === 'MCQ_SINGLE' || q.questionType === 'MCQ_MULTI') && q.optionsJson && (
                <div className="space-y-2">
                  {(q.optionsJson as string[]).map((opt, j) => (
                    <label
                      key={j}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition ${
                        answers[q.id] === opt
                          ? 'border-[var(--primary-400)] bg-[var(--primary-50)] text-[var(--primary-600)]'
                          : 'border-[var(--card-border)] text-[var(--slate-600)] hover:bg-[var(--slate-50)]'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        checked={answers[q.id] === opt}
                        onChange={() => setAnswers({ ...answers, [q.id]: opt })}
                        className="hidden"
                      />
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        answers[q.id] === opt ? 'border-[var(--primary-400)] bg-[var(--primary-400)]' : 'border-[var(--slate-200)]'
                      }`}>
                        {answers[q.id] === opt && <span className="h-2 w-2 rounded-full bg-[var(--card-bg)]" />}
                      </span>
                      {opt}
                    </label>
                  ))}
                </div>
              )}

              {(q.questionType === 'CODE_PYTHON' || q.questionType === 'CODE_SQL' || q.questionType === 'FREE_TEXT') && (
                <textarea
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                  className="w-full rounded-lg border border-[var(--slate-200)] px-4 py-3 font-mono text-sm outline-none focus:border-[var(--primary-400)]"
                  rows={6}
                  placeholder={q.questionType === 'FREE_TEXT' ? 'Type your answer...' : 'Write your code here...'}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmitQuiz}
            disabled={submitting}
            className="rounded-lg bg-[var(--primary-400)] px-8 py-3 text-sm font-semibold text-white hover:bg-[var(--primary-600)] disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      </div>
    );
  }

  // Detail view
  return (
    <div>
      <Link href="/quizzes" className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--slate-400)] hover:text-[var(--slate-600)]">
        <ArrowLeft className="h-4 w-4" /> Back to Quizzes
      </Link>

      <div className="mb-6 glass-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-[var(--slate-800)]">{quiz.title}</h1>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-[var(--slate-400)]">
              <span>Type: {quiz.type}</span>
              <span>Max: {quiz.maxScore} pts</span>
              {quiz.timeLimitMinutes && <span>{quiz.timeLimitMinutes} min</span>}
              <span>Retakes: {quiz.maxRetakes}</span>
              <span>Policy: {quiz.scorePolicy}</span>
              <span>{quiz.questions?.length || 0} questions</span>
            </div>
          </div>
          {canTake && hasAttemptsLeft && (
            <button
              onClick={startQuiz}
              className="rounded-lg bg-[var(--primary-400)] px-6 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-600)]"
            >
              {attemptsUsed > 0 ? 'Retake Quiz' : 'Start Quiz'}
            </button>
          )}
        </div>
      </div>

      {/* Mentor: questions + add form */}
      {!isIntern && (
        <div className="mb-6 glass-card">
          <div className="flex items-center justify-between border-b border-[var(--card-border)] px-6 py-4">
            <h2 className="text-lg font-semibold text-[var(--slate-700)]">Questions ({quiz.questions?.length || 0})</h2>
            <button
              onClick={() => setShowQForm(!showQForm)}
              className="flex items-center gap-1 text-sm text-[var(--primary-400)] hover:text-[var(--primary-600)]"
            >
              <Plus className="h-4 w-4" /> Add Question
            </button>
          </div>

          {showQForm && (
            <form onSubmit={handleAddQuestion} className="border-b border-[var(--card-border)] p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <select
                  value={qForm.questionType}
                  onChange={(e) => setQForm({ ...qForm, questionType: e.target.value })}
                  className="rounded-lg border border-[var(--slate-200)] px-4 py-2 text-sm"
                >
                  <option value="MCQ_SINGLE">MCQ Single</option>
                  <option value="MCQ_MULTI">MCQ Multi</option>
                  <option value="CODE_PYTHON">Code (Python)</option>
                  <option value="CODE_SQL">Code (SQL)</option>
                  <option value="FREE_TEXT">Free Text</option>
                </select>
                <input
                  type="number"
                  placeholder="Points"
                  value={qForm.points}
                  onChange={(e) => setQForm({ ...qForm, points: Number(e.target.value) })}
                  className="rounded-lg border border-[var(--slate-200)] px-4 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Correct answer"
                  value={qForm.correctAnswer}
                  onChange={(e) => setQForm({ ...qForm, correctAnswer: e.target.value })}
                  className="rounded-lg border border-[var(--slate-200)] px-4 py-2 text-sm"
                />
              </div>
              <textarea
                placeholder="Question text"
                value={qForm.question}
                onChange={(e) => setQForm({ ...qForm, question: e.target.value })}
                className="mt-4 w-full rounded-lg border border-[var(--slate-200)] px-4 py-2 text-sm"
                rows={2}
                required
              />
              {qForm.questionType.startsWith('MCQ') && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {qForm.options.map((opt, i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const opts = [...qForm.options];
                        opts[i] = e.target.value;
                        setQForm({ ...qForm, options: opts });
                      }}
                      className="rounded-lg border border-[var(--slate-200)] px-3 py-2 text-sm"
                    />
                  ))}
                </div>
              )}
              <button type="submit" className="mt-4 rounded-lg bg-[var(--primary-400)] px-6 py-2 text-sm font-medium text-white hover:bg-[var(--primary-600)]">
                Add
              </button>
            </form>
          )}

          <div className="divide-y divide-gray-100">
            {(quiz.questions || []).map((q: QuizQuestion, i: number) => (
              <div key={q.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--slate-300)]">Q{i + 1} &middot; {q.questionType} &middot; {q.points} pts</span>
                </div>
                <p className="mt-1 text-sm text-[var(--slate-800)]">{q.question}</p>
                {q.optionsJson && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(q.optionsJson as string[]).map((opt, j) => (
                      <span
                        key={j}
                        className={`rounded-full px-2.5 py-0.5 text-xs ${
                          opt === q.correctAnswer ? 'bg-[var(--sage-50)] font-medium text-[var(--sage-500)]' : 'bg-[var(--slate-50)] text-[var(--slate-500)]'
                        }`}
                      >
                        {opt}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attempts */}
      <div className="glass-card">
        <h2 className="border-b border-[var(--card-border)] px-6 py-4 text-lg font-semibold text-[var(--slate-700)]">
          Attempts ({attempts.length})
        </h2>
        <div className="divide-y divide-gray-100">
          {attempts.map((attempt) => (
            <div key={attempt.id} className="flex items-center justify-between px-6 py-4">
              <div>
                {attempt.intern && <p className="text-sm font-medium text-[var(--slate-800)]">{attempt.intern.name}</p>}
                <p className="text-xs text-[var(--slate-400)]">
                  Attempt #{attempt.attemptNumber} &middot; {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString('en-IN') : 'In progress'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {attempt.score !== null && (
                  <span className="text-lg font-bold text-[var(--slate-800)]">
                    {attempt.score}/{attempt.maxScore}
                  </span>
                )}
                {attempt.score !== null && attempt.maxScore && (
                  attempt.score / attempt.maxScore >= 0.6
                    ? <CheckCircle className="h-5 w-5 text-[var(--sage-500)]" />
                    : <XCircle className="h-5 w-5 text-[var(--rose-500)]" />
                )}
              </div>
            </div>
          ))}
          {attempts.length === 0 && (
            <p className="px-6 py-8 text-center text-sm text-[var(--slate-300)]">No attempts yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

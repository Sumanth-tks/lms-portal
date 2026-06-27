const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ─── GitHub Links ────────────────────────────────────

async function linkRepo(req, res) {
  try {
    const { repoUrl, repoName } = req.body;
    const internId = req.user.role === 'INTERN' ? req.user.id : (req.body.internId || req.user.id);

    const link = await prisma.gitHubLink.create({
      data: { internId, repoUrl, repoName },
    });
    res.status(201).json({ success: true, data: link });
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ success: false, error: 'Repo already linked' });
    res.status(500).json({ success: false, error: err.message });
  }
}

async function listLinks(req, res) {
  try {
    const where = {};
    if (req.user.role === 'INTERN') where.internId = req.user.id;
    else if (req.query.internId) where.internId = req.query.internId;

    const links = await prisma.gitHubLink.findMany({
      where,
      include: {
        intern: { select: { id: true, name: true, email: true } },
        _count: { select: { commits: true } },
      },
      orderBy: { linkedAt: 'desc' },
    });
    res.json({ success: true, data: links });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function unlinkRepo(req, res) {
  try {
    const link = await prisma.gitHubLink.findUnique({ where: { id: req.params.id } });
    if (!link) return res.status(404).json({ success: false, error: 'Link not found' });
    if (req.user.role === 'INTERN' && link.internId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not your repo' });
    }
    await prisma.gitHubLink.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { deleted: true } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ─── Commits ─────────────────────────────────────────

async function addCommit(req, res) {
  try {
    const { githubLinkId, commitHash, message, filesChanged, additions, deletions, date } = req.body;

    const link = await prisma.gitHubLink.findUnique({ where: { id: githubLinkId } });
    if (!link) return res.status(404).json({ success: false, error: 'Link not found' });

    const commit = await prisma.commitLog.create({
      data: {
        internId: link.internId,
        githubLinkId,
        commitHash,
        message,
        filesChanged: filesChanged || 0,
        additions: additions || 0,
        deletions: deletions || 0,
        date: new Date(date),
      },
    });
    res.status(201).json({ success: true, data: commit });
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ success: false, error: 'Commit already logged' });
    res.status(500).json({ success: false, error: err.message });
  }
}

async function listCommits(req, res) {
  try {
    const where = {};
    if (req.query.githubLinkId) where.githubLinkId = req.query.githubLinkId;
    if (req.query.internId) where.internId = req.query.internId;
    if (req.user.role === 'INTERN') where.internId = req.user.id;

    const commits = await prisma.commitLog.findMany({
      where,
      include: {
        intern: { select: { id: true, name: true } },
        githubLink: { select: { id: true, repoName: true, repoUrl: true } },
        _count: { select: { reviews: true } },
      },
      orderBy: { date: 'desc' },
      take: Number(req.query.limit) || 50,
    });
    res.json({ success: true, data: commits });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ─── Code Reviews ────────────────────────────────────

async function createReview(req, res) {
  try {
    const { commitLogId, commentsJson } = req.body;

    const review = await prisma.codeReview.create({
      data: {
        commitLogId,
        reviewerId: req.user.id,
        commentsJson: commentsJson || [],
        status: 'REVIEWED',
        reviewedAt: new Date(),
      },
    });

    const commit = await prisma.commitLog.findUnique({
      where: { id: commitLogId },
      select: { internId: true, message: true },
    });
    if (commit) {
      await prisma.notification.create({
        data: {
          userId: commit.internId,
          type: 'CODE_REVIEW',
          title: 'Code Review',
          message: `Your commit "${commit.message.substring(0, 50)}" has been reviewed`,
          link: '/github',
        },
      });
    }

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function listReviews(req, res) {
  try {
    const where = {};
    if (req.query.commitLogId) where.commitLogId = req.query.commitLogId;

    const reviews = await prisma.codeReview.findMany({
      where,
      include: {
        reviewer: { select: { id: true, name: true } },
        commitLog: {
          select: { id: true, commitHash: true, message: true, intern: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ─── Code Playground ─────────────────────────────────

async function executeCode(req, res) {
  try {
    const { language, code } = req.body;
    const { executeCode: runCode } = require('../utils/mockJudge');
    const result = await runCode(code, language, []);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ─── Portfolio ───────────────────────────────────────

async function getPortfolio(req, res) {
  try {
    const internId = req.params.internId || req.user.id;

    const [user, links, submissions, quizAttempts] = await Promise.all([
      prisma.user.findUnique({
        where: { id: internId },
        select: { id: true, name: true, email: true, avatarUrl: true, status: true, createdAt: true },
      }),
      prisma.gitHubLink.findMany({
        where: { internId },
        include: { _count: { select: { commits: true } } },
      }),
      prisma.submission.findMany({
        where: { internId, status: 'GRADED' },
        include: { assignment: { select: { title: true, isMiniProject: true, maxScore: true } } },
        orderBy: { submittedAt: 'desc' },
        take: 20,
      }),
      prisma.quizAttempt.findMany({
        where: { internId, submittedAt: { not: null } },
        include: { quiz: { select: { title: true, type: true, maxScore: true } } },
        orderBy: { submittedAt: 'desc' },
        take: 20,
      }),
    ]);

    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    res.json({
      success: true,
      data: { user, repos: links, submissions, quizAttempts },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  linkRepo, listLinks, unlinkRepo,
  addCommit, listCommits,
  createReview, listReviews,
  executeCode, getPortfolio,
};

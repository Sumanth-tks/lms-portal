const prisma = require('../config/db');

// POST /api/peer-reviews/assign — Admin/Mentor assigns a peer reviewer to a commit
async function assignPeerReviewer(req, res) {
  try {
    const { commitLogId, reviewerInternId } = req.body;

    // Verify the commit exists and the reviewer is an intern
    const [commit, reviewer] = await Promise.all([
      prisma.commitLog.findUnique({ where: { id: commitLogId }, include: { intern: true } }),
      prisma.user.findUnique({ where: { id: reviewerInternId } }),
    ]);

    if (!commit) return res.status(404).json({ success: false, error: 'Commit not found' });
    if (!reviewer || reviewer.role !== 'INTERN') return res.status(400).json({ success: false, error: 'Reviewer must be an intern' });
    if (commit.internId === reviewerInternId) return res.status(400).json({ success: false, error: 'Cannot assign self-review' });

    const review = await prisma.codeReview.create({
      data: {
        commitLogId,
        reviewerId: reviewerInternId,
        status: 'PENDING',
        commentsJson: [],
      },
      include: {
        reviewer: { select: { id: true, name: true, email: true } },
        commitLog: { select: { id: true, commitHash: true, message: true, intern: { select: { id: true, name: true } } } },
      },
    });

    // Notify the reviewer
    await prisma.notification.create({
      data: {
        userId: reviewerInternId,
        type: 'PEER_REVIEW_ASSIGNED',
        title: 'Peer Review Assigned',
        message: `You've been assigned to review ${commit.intern.name}'s commit: ${commit.message.substring(0, 60)}`,
        link: '/peer-reviews',
      },
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    console.error('ASSIGN_PEER_REVIEWER_ERROR:', err);
    res.status(500).json({ success: false, error: 'Failed to assign peer reviewer' });
  }
}

// POST /api/peer-reviews/auto-assign — Auto-assign peer reviewers for recent commits
async function autoAssignPeerReviewers(req, res) {
  try {
    const { batchId } = req.body;

    // Get all active interns (optionally from a specific batch)
    const where = { role: 'INTERN', status: 'ACTIVE' };
    if (batchId) where.batchId = batchId;
    const interns = await prisma.user.findMany({ where, select: { id: true, name: true } });

    if (interns.length < 2) return res.status(400).json({ success: false, error: 'Need at least 2 interns for peer review' });

    // Get recent unreviewed commits (last 7 days) that don't have peer reviews
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const commits = await prisma.commitLog.findMany({
      where: {
        date: { gte: sevenDaysAgo },
        intern: { role: 'INTERN', status: 'ACTIVE', ...(batchId ? { batchId } : {}) },
        reviews: { none: { reviewer: { role: 'INTERN' } } },
      },
      include: { intern: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
      take: 50,
    });

    const assignments = [];
    for (const commit of commits) {
      // Pick a random intern that isn't the commit author
      const eligible = interns.filter((i) => i.id !== commit.internId);
      if (eligible.length === 0) continue;
      const reviewer = eligible[Math.floor(Math.random() * eligible.length)];

      try {
        const review = await prisma.codeReview.create({
          data: {
            commitLogId: commit.id,
            reviewerId: reviewer.id,
            status: 'PENDING',
            commentsJson: [],
          },
        });

        await prisma.notification.create({
          data: {
            userId: reviewer.id,
            type: 'PEER_REVIEW_ASSIGNED',
            title: 'Peer Review Assigned',
            message: `Review ${commit.intern.name}'s commit: ${commit.message.substring(0, 60)}`,
            link: '/peer-reviews',
          },
        });

        assignments.push({ commitId: commit.id, reviewerId: reviewer.id, reviewId: review.id });
      } catch (e) {
        // Skip duplicates
      }
    }

    res.json({ success: true, data: { assigned: assignments.length, assignments } });
  } catch (err) {
    console.error('AUTO_ASSIGN_ERROR:', err);
    res.status(500).json({ success: false, error: 'Failed to auto-assign peer reviewers' });
  }
}

// GET /api/peer-reviews/my — Get reviews assigned to the current intern
async function getMyPeerReviews(req, res) {
  try {
    const reviews = await prisma.codeReview.findMany({
      where: { reviewerId: req.user.id },
      include: {
        commitLog: {
          select: {
            id: true, commitHash: true, message: true, filesChanged: true,
            additions: true, deletions: true, date: true,
            intern: { select: { id: true, name: true } },
            githubLink: { select: { repoName: true, repoUrl: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: reviews });
  } catch (err) {
    console.error('GET_MY_REVIEWS_ERROR:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch peer reviews' });
  }
}

// GET /api/peer-reviews/on-my-code — Get peer reviews on the current intern's commits
async function getReviewsOnMyCode(req, res) {
  try {
    const reviews = await prisma.codeReview.findMany({
      where: {
        commitLog: { internId: req.user.id },
        reviewer: { role: 'INTERN' },
      },
      include: {
        reviewer: { select: { id: true, name: true } },
        commitLog: {
          select: {
            id: true, commitHash: true, message: true, date: true,
            githubLink: { select: { repoName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: reviews });
  } catch (err) {
    console.error('GET_REVIEWS_ON_MY_CODE_ERROR:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
  }
}

// PUT /api/peer-reviews/:id/submit — Intern submits their peer review
async function submitPeerReview(req, res) {
  try {
    const { id } = req.params;
    const { commentsJson } = req.body;

    const review = await prisma.codeReview.findUnique({ where: { id } });
    if (!review) return res.status(404).json({ success: false, error: 'Review not found' });
    if (review.reviewerId !== req.user.id) return res.status(403).json({ success: false, error: 'Not your review' });

    const updated = await prisma.codeReview.update({
      where: { id },
      data: {
        commentsJson: commentsJson || [],
        status: 'REVIEWED',
        reviewedAt: new Date(),
      },
      include: {
        commitLog: { select: { internId: true, message: true } },
        reviewer: { select: { name: true } },
      },
    });

    // Notify the commit author
    await prisma.notification.create({
      data: {
        userId: updated.commitLog.internId,
        type: 'PEER_REVIEW_COMPLETED',
        title: 'Peer Review Received',
        message: `${updated.reviewer.name} reviewed your commit: ${updated.commitLog.message.substring(0, 60)}`,
        link: '/peer-reviews',
      },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('SUBMIT_PEER_REVIEW_ERROR:', err);
    res.status(500).json({ success: false, error: 'Failed to submit review' });
  }
}

// GET /api/peer-reviews/stats — Get peer review stats for admin/mentor
async function getPeerReviewStats(req, res) {
  try {
    const [total, pending, completed] = await Promise.all([
      prisma.codeReview.count({ where: { reviewer: { role: 'INTERN' } } }),
      prisma.codeReview.count({ where: { reviewer: { role: 'INTERN' }, status: 'PENDING' } }),
      prisma.codeReview.count({ where: { reviewer: { role: 'INTERN' }, status: 'REVIEWED' } }),
    ]);

    res.json({ success: true, data: { total, pending, completed, completionRate: total > 0 ? Math.round((completed / total) * 100) : 0 } });
  } catch (err) {
    console.error('PEER_REVIEW_STATS_ERROR:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
}

module.exports = {
  assignPeerReviewer,
  autoAssignPeerReviewers,
  getMyPeerReviews,
  getReviewsOnMyCode,
  submitPeerReview,
  getPeerReviewStats,
};

const prisma = require('../config/db');

// ─── Badge Definitions (seed on first call) ─────────

const DEFAULT_BADGES = [
  { name: 'First Commit', description: 'Push your first commit', category: 'code', criteria: 'commits >= 1', xpReward: 50 },
  { name: 'Code Machine', description: 'Push 50 commits', category: 'code', criteria: 'commits >= 50', xpReward: 200 },
  { name: 'Perfect Week', description: '100% attendance for a week', category: 'attendance', criteria: 'weekly_attendance = 100', xpReward: 100 },
  { name: 'Streak Master', description: '7-day attendance streak', category: 'attendance', criteria: 'attendance_streak >= 7', xpReward: 150 },
  { name: 'Quiz Ace', description: 'Score 100% on a quiz', category: 'quiz', criteria: 'quiz_perfect = 1', xpReward: 100 },
  { name: 'Task Crusher', description: 'Complete 50 daily tasks', category: 'tasks', criteria: 'tasks_completed >= 50', xpReward: 200 },
  { name: 'Early Bird', description: 'Submit standup before 9:30 AM for 5 days', category: 'standup', criteria: 'early_standups >= 5', xpReward: 75 },
  { name: 'Peer Helper', description: 'Give 5 peer reviews', category: 'social', criteria: 'peer_reviews_given >= 5', xpReward: 100 },
  { name: 'Hackathon Hero', description: 'Win a hackathon (rank #1)', category: 'hackathon', criteria: 'hackathon_wins >= 1', xpReward: 300 },
  { name: 'Full Stack', description: 'Complete all capstone phases', category: 'capstone', criteria: 'capstone_phase = EVALUATION', xpReward: 500 },
];

async function seedBadges() {
  const count = await prisma.badge.count();
  if (count === 0) {
    await prisma.badge.createMany({ data: DEFAULT_BADGES });
  }
}

// ─── Badges ──────────────────────────────────────────

async function getBadges(req, res) {
  try {
    await seedBadges();
    const badges = await prisma.badge.findMany({ orderBy: { category: 'asc' } });
    const internId = req.query.internId || (req.user.role === 'INTERN' ? req.user.id : undefined);
    let earned = [];
    if (internId) {
      earned = await prisma.earnedBadge.findMany({
        where: { internId },
        include: { badge: true },
      });
    }
    res.json({ success: true, data: { badges, earned } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

async function awardBadge(req, res) {
  try {
    const { internId, badgeId } = req.body;
    const earned = await prisma.earnedBadge.upsert({
      where: { internId_badgeId: { internId, badgeId } },
      update: {},
      create: { internId, badgeId },
      include: { badge: true },
    });
    if (earned.badge.xpReward > 0) {
      await prisma.xpLog.create({
        data: { internId, amount: earned.badge.xpReward, reason: `Badge: ${earned.badge.name}`, sourceType: 'BADGE', sourceId: badgeId },
      });
    }
    await prisma.notification.create({
      data: { userId: internId, type: 'BADGE', title: 'Badge Earned!', message: `You earned the "${earned.badge.name}" badge! +${earned.badge.xpReward} XP`, link: '/gamification' },
    });
    res.json({ success: true, data: earned });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

// ─── XP ──────────────────────────────────────────────

async function addXp(req, res) {
  try {
    const { internId, amount, reason, sourceType, sourceId } = req.body;
    const log = await prisma.xpLog.create({
      data: { internId, amount, reason, sourceType: sourceType || 'MANUAL', sourceId: sourceId || null },
    });
    res.json({ success: true, data: log });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

async function getXpLogs(req, res) {
  try {
    const internId = req.query.internId || (req.user.role === 'INTERN' ? req.user.id : undefined);
    const where = internId ? { internId } : {};
    const logs = await prisma.xpLog.findMany({
      where,
      include: { intern: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const totalXp = await prisma.xpLog.aggregate({ where, _sum: { amount: true } });
    res.json({ success: true, data: { logs, totalXp: totalXp._sum.amount || 0 } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

// ─── Leaderboard ─────────────────────────────────────

async function getLeaderboard(req, res) {
  try {
    const xpByIntern = await prisma.xpLog.groupBy({
      by: ['internId'],
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 50,
    });

    const internIds = xpByIntern.map((x) => x.internId);
    const users = await prisma.user.findMany({
      where: { id: { in: internIds } },
      select: { id: true, name: true, email: true, avatarUrl: true },
    });
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

    const badgeCounts = await prisma.earnedBadge.groupBy({
      by: ['internId'],
      _count: true,
      where: { internId: { in: internIds } },
    });
    const badgeMap = Object.fromEntries(badgeCounts.map((b) => [b.internId, b._count]));

    const streakData = await prisma.streak.findMany({
      where: { internId: { in: internIds }, type: 'attendance' },
    });
    const streakMap = Object.fromEntries(streakData.map((s) => [s.internId, s.currentCount]));

    const leaderboard = xpByIntern.map((x, i) => ({
      rank: i + 1,
      intern: userMap[x.internId] || { id: x.internId, name: 'Unknown' },
      totalXp: x._sum.amount || 0,
      badgeCount: badgeMap[x.internId] || 0,
      streak: streakMap[x.internId] || 0,
    }));

    res.json({ success: true, data: leaderboard });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

// ─── Streaks ─────────────────────────────────────────

async function getStreaks(req, res) {
  try {
    const internId = req.query.internId || (req.user.role === 'INTERN' ? req.user.id : undefined);
    const where = internId ? { internId } : {};
    const streaks = await prisma.streak.findMany({
      where,
      include: { intern: { select: { id: true, name: true } } },
    });
    res.json({ success: true, data: streaks });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

async function updateStreak(req, res) {
  try {
    const { internId, type } = req.body;
    const streak = await prisma.streak.upsert({
      where: { internId_type: { internId, type } },
      update: {
        currentCount: { increment: 1 },
        lastActivityAt: new Date(),
      },
      create: { internId, type, currentCount: 1, longestCount: 1 },
    });
    if (streak.currentCount > streak.longestCount) {
      await prisma.streak.update({
        where: { id: streak.id },
        data: { longestCount: streak.currentCount },
      });
    }
    res.json({ success: true, data: streak });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

module.exports = {
  getBadges,
  awardBadge,
  addXp,
  getXpLogs,
  getLeaderboard,
  getStreaks,
  updateStreak,
};

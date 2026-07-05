const prisma = require('../config/db');
const { success, error } = require('../utils/apiResponse');

async function submitStandup(req, res) {
  try {
    const internId = req.user.id;
    const { yesterday, today, blockers } = req.validated;
    const now = new Date();
    const todayDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const standup = await prisma.dailyStandup.upsert({
      where: { internId_date: { internId, date: todayDate } },
      update: { yesterday, today, blockers },
      create: { internId, date: todayDate, yesterday, today, blockers },
    });

    return success(res, standup, 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function getMyStandups(req, res) {
  try {
    const standups = await prisma.dailyStandup.findMany({
      where: { internId: req.user.id },
      orderBy: { date: 'desc' },
      take: 30,
    });
    return success(res, standups);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function getTodayStandups(req, res) {
  try {
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const standups = await prisma.dailyStandup.findMany({
      where: { date: today },
      include: {
        intern: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return success(res, standups);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function getStandupsByIntern(req, res) {
  try {
    const { internId } = req.params;
    const standups = await prisma.dailyStandup.findMany({
      where: { internId },
      orderBy: { date: 'desc' },
      take: 30,
    });
    return success(res, standups);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function getStandupsByDate(req, res) {
  try {
    const dateStr = req.query.date;
    let targetDate;
    if (dateStr) {
      const [y, m, d] = dateStr.split('-').map(Number);
      targetDate = new Date(Date.UTC(y, m - 1, d));
    } else {
      const now = new Date();
      targetDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    }

    const standups = await prisma.dailyStandup.findMany({
      where: { date: targetDate },
      include: {
        intern: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return success(res, standups);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function getWeekSummary(req, res) {
  try {
    const dateStr = req.query.date;
    let refDate;
    if (dateStr) {
      const [y, m, d] = dateStr.split('-').map(Number);
      refDate = new Date(Date.UTC(y, m - 1, d));
    } else {
      const now = new Date();
      refDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    }

    // Build array of 7 days: 6 days before refDate through refDate
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(refDate);
      d.setUTCDate(d.getUTCDate() - i);
      days.push(d);
    }

    const startDate = days[0];
    const endDate = new Date(days[6]);
    endDate.setUTCDate(endDate.getUTCDate() + 1);

    // Get all interns
    const allInterns = await prisma.user.findMany({
      where: { role: 'INTERN', status: 'ACTIVE' },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    // Get all standups in the date range
    const standups = await prisma.dailyStandup.findMany({
      where: { date: { gte: startDate, lt: endDate } },
      select: { internId: true, date: true },
    });

    // Build a map: dateStr -> Set of internIds who submitted
    const submissionMap = {};
    for (const s of standups) {
      const key = s.date.toISOString().split('T')[0];
      if (!submissionMap[key]) submissionMap[key] = new Set();
      submissionMap[key].add(s.internId);
    }

    const result = days.map((d) => {
      const key = d.toISOString().split('T')[0];
      const submittedIds = submissionMap[key] || new Set();
      const submitted = allInterns.filter((i) => submittedIds.has(i.id));
      const missed = allInterns.filter((i) => !submittedIds.has(i.id));
      return { date: key, submitted, missed };
    });

    return success(res, { days: result });
  } catch (err) {
    return error(res, err.message, 500);
  }
}

module.exports = { submitStandup, getMyStandups, getTodayStandups, getStandupsByIntern, getStandupsByDate, getWeekSummary };

const prisma = require('../config/db');
const { success, error } = require('../utils/apiResponse');

function parseDateOnly(value) {
  const [datePart] = String(value).split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  if (!year || !month || !day) {
    throw new Error('Invalid date');
  }
  return new Date(Date.UTC(year, month - 1, day));
}

function monthRange(month, year) {
  const monthNumber = Number(month);
  const yearNumber = Number(year);
  if (!monthNumber || !yearNumber) return null;
  return {
    gte: new Date(Date.UTC(yearNumber, monthNumber - 1, 1)),
    lt: new Date(Date.UTC(yearNumber, monthNumber, 1)),
  };
}

async function getCalendarEvents(req, res) {
  try {
    const { month, year, date } = req.query;
    const where = {};
    const range = monthRange(month, year);

    if (range) {
      where.date = range;
    } else if (date) {
      where.date = parseDateOnly(date);
    }

    const events = await prisma.calendarEvent.findMany({
      where,
      include: {
        creator: { select: { id: true, name: true, role: true } },
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return success(res, events);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function createCalendarEvent(req, res) {
  try {
    const { title, description, date, startTime, endTime, type } = req.validated;
    const event = await prisma.calendarEvent.create({
      data: {
        title,
        description: description || null,
        date: parseDateOnly(date),
        startTime: startTime || null,
        endTime: endTime || null,
        type: type || 'GENERAL',
        createdBy: req.user.id,
      },
      include: {
        creator: { select: { id: true, name: true, role: true } },
      },
    });

    return success(res, event, 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

module.exports = { getCalendarEvents, createCalendarEvent };

const prisma = require('../config/db');

async function createHackathon(req, res) {
  try {
    const hackathon = await prisma.hackathon.create({
      data: { ...req.body, createdBy: req.user.id, startTime: new Date(req.body.startTime), endTime: new Date(req.body.endTime) },
    });
    res.status(201).json({ success: true, data: hackathon });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function listHackathons(req, res) {
  try {
    const hackathons = await prisma.hackathon.findMany({
      include: {
        _count: { select: { submissions: true } },
        batch: { select: { id: true, name: true } },
      },
      orderBy: { dayNumber: 'asc' },
    });
    res.json({ success: true, data: hackathons });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getHackathon(req, res) {
  try {
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: req.params.id },
      include: {
        submissions: {
          include: {
            intern: { select: { id: true, name: true, email: true } },
            judge: { select: { id: true, name: true } },
          },
          orderBy: { score: 'desc' },
        },
      },
    });
    if (!hackathon) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: hackathon });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function updateHackathon(req, res) {
  try {
    const data = { ...req.body };
    if (data.startTime) data.startTime = new Date(data.startTime);
    if (data.endTime) data.endTime = new Date(data.endTime);
    const hackathon = await prisma.hackathon.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ success: true, data: hackathon });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function deleteHackathon(req, res) {
  try {
    await prisma.hackathon.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { deleted: true } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function submitHackathon(req, res) {
  try {
    const hackathon = await prisma.hackathon.findUnique({ where: { id: req.params.id } });
    if (!hackathon) return res.status(404).json({ success: false, error: 'Not found' });

    const now = new Date();
    if (now > hackathon.endTime) {
      return res.status(400).json({ success: false, error: 'Submission window closed' });
    }

    const submission = await prisma.hackathonSubmission.upsert({
      where: { hackathonId_internId: { hackathonId: req.params.id, internId: req.user.id } },
      create: {
        hackathonId: req.params.id,
        internId: req.user.id,
        repoUrl: req.body.repoUrl,
        demoUrl: req.body.demoUrl,
      },
      update: {
        repoUrl: req.body.repoUrl,
        demoUrl: req.body.demoUrl,
        submittedAt: new Date(),
      },
    });
    res.status(201).json({ success: true, data: submission });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function judgeSubmission(req, res) {
  try {
    const submission = await prisma.hackathonSubmission.update({
      where: { id: req.params.submissionId },
      data: {
        score: req.body.score,
        feedback: req.body.feedback,
        judgedBy: req.user.id,
      },
    });
    res.json({ success: true, data: submission });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getLeaderboard(req, res) {
  try {
    const submissions = await prisma.hackathonSubmission.findMany({
      where: { hackathonId: req.params.id, score: { not: null } },
      include: { intern: { select: { id: true, name: true, email: true } } },
      orderBy: { score: 'desc' },
    });
    res.json({ success: true, data: submissions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  createHackathon, listHackathons, getHackathon, updateHackathon, deleteHackathon,
  submitHackathon, judgeSubmission, getLeaderboard,
};

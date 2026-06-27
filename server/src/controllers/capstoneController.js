const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createCapstone(req, res) {
  try {
    const internId = req.body.internId || req.user.id;
    const project = await prisma.capstoneProject.create({
      data: {
        internId,
        mentorId: req.body.mentorId || null,
        problemStatement: req.body.problemStatement || null,
        repoUrl: req.body.repoUrl || null,
      },
    });
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ success: false, error: 'Capstone already exists' });
    res.status(500).json({ success: false, error: err.message });
  }
}

async function listCapstones(req, res) {
  try {
    const where = {};
    if (req.user.role === 'INTERN') where.internId = req.user.id;
    if (req.query.internId) where.internId = req.query.internId;

    const projects = await prisma.capstoneProject.findMany({
      where,
      include: {
        intern: { select: { id: true, name: true, email: true } },
        mentor: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getCapstone(req, res) {
  try {
    const project = await prisma.capstoneProject.findUnique({
      where: { id: req.params.id },
      include: {
        intern: { select: { id: true, name: true, email: true } },
        mentor: { select: { id: true, name: true } },
      },
    });
    if (!project) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function updateCapstone(req, res) {
  try {
    const project = await prisma.capstoneProject.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ success: false, error: 'Not found' });
    if (req.user.role === 'INTERN' && project.internId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not your project' });
    }

    const updated = await prisma.capstoneProject.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function evaluateCapstone(req, res) {
  try {
    const updated = await prisma.capstoneProject.update({
      where: { id: req.params.id },
      data: {
        phase: 'EVALUATION',
        finalScore: req.body.finalScore,
        feedbackJson: req.body.feedbackJson,
      },
    });

    const project = await prisma.capstoneProject.findUnique({ where: { id: req.params.id } });
    if (project) {
      await prisma.notification.create({
        data: {
          userId: project.internId,
          type: 'CAPSTONE_EVALUATED',
          title: 'Capstone Evaluated',
          message: `Your capstone project has been evaluated. Score: ${req.body.finalScore}`,
          link: '/capstone',
        },
      });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { createCapstone, listCapstones, getCapstone, updateCapstone, evaluateCapstone };

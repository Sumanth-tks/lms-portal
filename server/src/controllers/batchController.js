const prisma = require('../config/db');
const { success, error } = require('../utils/apiResponse');

async function createBatch(req, res) {
  try {
    const { name, startDate, endDate } = req.validated;
    const batch = await prisma.batch.create({
      data: { name, startDate: new Date(startDate), endDate: new Date(endDate) },
    });
    return success(res, batch, 201);
  } catch (err) {
    return error(res, 'Failed to create batch', 500);
  }
}

async function listBatches(req, res) {
  try {
    const batches = await prisma.batch.findMany({
      include: { _count: { select: { users: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return success(res, batches);
  } catch (err) {
    return error(res, 'Failed to list batches', 500);
  }
}

async function getBatch(req, res) {
  try {
    const batch = await prisma.batch.findUnique({
      where: { id: req.params.id },
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true, status: true },
        },
      },
    });
    if (!batch) return error(res, 'Batch not found', 404);
    return success(res, batch);
  } catch (err) {
    return error(res, 'Failed to get batch', 500);
  }
}

async function updateBatch(req, res) {
  try {
    const { name, startDate, endDate, status } = req.validated;
    const batch = await prisma.batch.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(status && { status }),
      },
    });
    return success(res, batch);
  } catch (err) {
    return error(res, 'Failed to update batch', 500);
  }
}

module.exports = { createBatch, listBatches, getBatch, updateBatch };

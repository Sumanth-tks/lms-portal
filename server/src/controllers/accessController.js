const prisma = require('../config/db');
const { success, error } = require('../utils/apiResponse');

async function toggleAccess(req, res) {
  try {
    const { internId, entityType, entityId, locked } = req.validated;

    const access = await prisma.internAccess.upsert({
      where: {
        internId_entityType_entityId: { internId, entityType, entityId },
      },
      update: {
        locked,
        unlockedById: locked ? null : req.user.id,
        unlockedAt: locked ? null : new Date(),
      },
      create: {
        internId,
        entityType,
        entityId,
        locked,
        unlockedById: locked ? null : req.user.id,
        unlockedAt: locked ? null : new Date(),
      },
    });

    return success(res, access);
  } catch (err) {
    return error(res, 'Failed to toggle access', 500);
  }
}

async function bulkToggleAccess(req, res) {
  try {
    const { internIds, entityType, entityId, locked } = req.validated;

    const results = await Promise.all(
      internIds.map((internId) =>
        prisma.internAccess.upsert({
          where: {
            internId_entityType_entityId: { internId, entityType, entityId },
          },
          update: {
            locked,
            unlockedById: locked ? null : req.user.id,
            unlockedAt: locked ? null : new Date(),
          },
          create: {
            internId,
            entityType,
            entityId,
            locked,
            unlockedById: locked ? null : req.user.id,
            unlockedAt: locked ? null : new Date(),
          },
        })
      )
    );

    return success(res, { updated: results.length });
  } catch (err) {
    return error(res, 'Failed to bulk toggle access', 500);
  }
}

async function getInternAccess(req, res) {
  try {
    const { internId } = req.params;

    if (req.user.role === 'INTERN' && req.user.id !== internId) {
      return error(res, 'Cannot view other intern access', 403);
    }

    const access = await prisma.internAccess.findMany({
      where: { internId },
      orderBy: { unlockedAt: 'desc' },
    });

    return success(res, access);
  } catch (err) {
    return error(res, 'Failed to get access', 500);
  }
}

module.exports = { toggleAccess, bulkToggleAccess, getInternAccess };

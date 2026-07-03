const prisma = require('../config/db');
const { success, error } = require('../utils/apiResponse');

async function createModule(req, res) {
  try {
    const { courseId, title, description, order, estimatedDuration, prerequisiteModuleId } = req.validated;
    const module = await prisma.module.create({
      data: {
        courseId,
        title,
        description,
        order: order || 0,
        estimatedDuration,
        prerequisiteModuleId,
        createdBy: req.user.id,
      },
    });
    return success(res, module, 201);
  } catch (err) {
    return error(res, 'Failed to create module', 500);
  }
}

async function listModules(req, res) {
  try {
    const { courseId } = req.query;
    const where = courseId ? { courseId } : {};
    const modules = await prisma.module.findMany({
      where,
      include: {
        _count: { select: { lessons: true } },
        course: { select: { id: true, title: true, weekNumber: true } },
      },
      orderBy: { order: 'asc' },
    });
    return success(res, modules);
  } catch (err) {
    return error(res, 'Failed to list modules', 500);
  }
}

async function getModule(req, res) {
  try {
    const mod = await prisma.module.findUnique({
      where: { id: req.params.id },
      include: {
        lessons: { orderBy: { order: 'asc' } },
        course: { select: { id: true, title: true, weekNumber: true } },
        prerequisite: { select: { id: true, title: true } },
        resources: true,
        datasets: true,
      },
    });
    if (!mod) return error(res, 'Module not found', 404);
    return success(res, mod);
  } catch (err) {
    return error(res, 'Failed to get module', 500);
  }
}

async function updateModule(req, res) {
  try {
    const { title, description, order, estimatedDuration, prerequisiteModuleId } = req.validated;
    const mod = await prisma.module.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(order !== undefined && { order }),
        ...(estimatedDuration !== undefined && { estimatedDuration }),
        ...(prerequisiteModuleId !== undefined && { prerequisiteModuleId }),
      },
    });
    return success(res, mod);
  } catch (err) {
    return error(res, 'Failed to update module', 500);
  }
}

async function deleteModule(req, res) {
  try {
    await prisma.module.delete({ where: { id: req.params.id } });
    return success(res, { message: 'Module deleted' });
  } catch (err) {
    return error(res, 'Failed to delete module', 500);
  }
}

module.exports = { createModule, listModules, getModule, updateModule, deleteModule };

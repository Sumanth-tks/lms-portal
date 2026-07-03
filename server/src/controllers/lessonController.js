const prisma = require('../config/db');
const { success, error } = require('../utils/apiResponse');

async function createLesson(req, res) {
  try {
    const { moduleId, title, contentType, content, fileUrl, duration, order } = req.validated;

    const lesson = await prisma.lesson.create({
      data: {
        moduleId,
        title,
        contentType,
        content,
        fileUrl,
        duration,
        order: order || 0,
        createdBy: req.user.id,
      },
    });
    return success(res, lesson, 201);
  } catch (err) {
    return error(res, 'Failed to create lesson', 500);
  }
}

async function getLesson(req, res) {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: req.params.id },
      include: {
        module: {
          select: { id: true, title: true, courseId: true },
        },
      },
    });
    if (!lesson) return error(res, 'Lesson not found', 404);

    if (req.user.role === 'INTERN') {
      const access = await prisma.internAccess.findFirst({
        where: {
          internId: req.user.id,
          OR: [
            { entityType: 'LESSON', entityId: lesson.id, locked: false },
            { entityType: 'MODULE', entityId: lesson.moduleId, locked: false },
          ],
        },
      });
      if (!access) return error(res, 'Content locked', 403);
    }

    return success(res, lesson);
  } catch (err) {
    return error(res, 'Failed to get lesson', 500);
  }
}

async function updateLesson(req, res) {
  try {
    const { title, contentType, content, fileUrl, duration, order } = req.validated;

    const existing = await prisma.lesson.findUnique({ where: { id: req.params.id } });
    if (!existing) return error(res, 'Lesson not found', 404);

    if (content && existing.content) {
      await prisma.contentVersion.create({
        data: {
          lessonId: existing.id,
          content: existing.content,
          editedBy: req.user.id,
        },
      });
    }

    const lesson = await prisma.lesson.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(contentType && { contentType }),
        ...(content !== undefined && { content }),
        ...(fileUrl !== undefined && { fileUrl }),
        ...(duration !== undefined && { duration }),
        ...(order !== undefined && { order }),
      },
    });
    return success(res, lesson);
  } catch (err) {
    return error(res, 'Failed to update lesson', 500);
  }
}

async function deleteLesson(req, res) {
  try {
    await prisma.lesson.delete({ where: { id: req.params.id } });
    return success(res, { message: 'Lesson deleted' });
  } catch (err) {
    return error(res, 'Failed to delete lesson', 500);
  }
}

module.exports = { createLesson, getLesson, updateLesson, deleteLesson };

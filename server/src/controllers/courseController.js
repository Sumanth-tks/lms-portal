const prisma = require('../config/db');
const { success, error } = require('../utils/apiResponse');

async function createCourse(req, res) {
  try {
    const { title, description, category, weekNumber, order } = req.validated;
    const course = await prisma.course.create({
      data: { title, description, category, weekNumber, order: order || 0, createdBy: req.user.id },
    });
    return success(res, course, 201);
  } catch (err) {
    return error(res, 'Failed to create course', 500);
  }
}

async function listCourses(req, res) {
  try {
    const courses = await prisma.course.findMany({
      include: {
        _count: { select: { modules: true } },
      },
      orderBy: [{ weekNumber: 'asc' }, { order: 'asc' }],
    });
    return success(res, courses);
  } catch (err) {
    return error(res, 'Failed to list courses', 500);
  }
}

async function getCourse(req, res) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        modules: {
          include: { _count: { select: { lessons: true } } },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!course) return error(res, 'Course not found', 404);
    return success(res, course);
  } catch (err) {
    return error(res, 'Failed to get course', 500);
  }
}

async function updateCourse(req, res) {
  try {
    const { title, description, category, weekNumber, order } = req.validated;
    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(weekNumber !== undefined && { weekNumber }),
        ...(order !== undefined && { order }),
      },
    });
    return success(res, course);
  } catch (err) {
    return error(res, 'Failed to update course', 500);
  }
}

async function deleteCourse(req, res) {
  try {
    await prisma.course.delete({ where: { id: req.params.id } });
    return success(res, { message: 'Course deleted' });
  } catch (err) {
    return error(res, 'Failed to delete course', 500);
  }
}

module.exports = { createCourse, listCourses, getCourse, updateCourse, deleteCourse };

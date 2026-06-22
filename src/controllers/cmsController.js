import prisma from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { logActivity } from './activityController.js';

// ==========================================
// NOTICES
// ==========================================
export const getAllNotices = async (req, res) => {
  try {
    const notices = await prisma.notice.findMany({ orderBy: { createdAt: 'desc' } });
    successResponse(res, 'Notices fetched', notices);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

export const createNotice = async (req, res) => {
  try {
    const notice = await prisma.notice.create({ data: req.body });
    await logActivity('content', 'New Notice Created', 'A new notice was added to the CMS.');
    successResponse(res, 'Notice created', notice, 201);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

export const updateNotice = async (req, res) => {
  try {
    const notice = await prisma.notice.update({
      where: { id: req.params.id },
      data: req.body
    });
    successResponse(res, 'Notice updated', notice);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

export const deleteNotice = async (req, res) => {
  try {
    await prisma.notice.delete({ where: { id: req.params.id } });
    await logActivity('content', 'Notice Deleted', 'A notice was removed from the CMS.');
    successResponse(res, 'Notice deleted', null);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

// ==========================================
// WEBSITE CONTENT
// ==========================================
export const getContent = async (req, res) => {
  try {
    const { page } = req.query;
    const filter = page ? { page } : {};
    const content = await prisma.siteContent.findMany({
      where: filter,
      orderBy: { createdAt: 'asc' }
    });
    
    // Transform into key-value map for easier frontend consumption
    const contentMap = {};
    content.forEach(item => {
      contentMap[item.key] = item.value;
    });

    successResponse(res, 'Content fetched successfully', contentMap);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export const createContent = async (req, res) => {
  try {
    const { page, section, key, value, type } = req.body;
    if (!page || !key || !value) {
      return errorResponse(res, 'Page, key, and value are required', [], 400);
    }
    const content = await prisma.siteContent.create({
      data: { page, section: section || 'general', key, value, type: type || 'text' }
    });
    await logActivity('content', 'New Content Created', `A new content block was added to the CMS: ${key}.`);
    successResponse(res, 'Content created successfully', content, 201);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export const updateContent = async (req, res) => {
  try {
    const { page, updates } = req.body; // Array of { key, value }
    
    if (!Array.isArray(updates)) {
      return errorResponse(res, 'Updates must be an array', [], 400);
    }

    if (page) {
      const updateKeys = updates.map(u => u.key);
      await prisma.siteContent.deleteMany({
        where: {
          page,
          key: { notIn: updateKeys }
        }
      });
    }

    // Prisma doesn't have a direct equivalent to bulkWrite for multiple different upserts, so we use transaction
    const updatePromises = updates.map(update => {
      return prisma.siteContent.upsert({
        where: { key: update.key },
        update: { value: update.value },
        create: {
          key: update.key,
          value: update.value,
          page: update.page || 'homepage',
          section: update.section || 'general',
          type: 'html'
        }
      });
    });

    if (updatePromises.length > 0) {
      await prisma.$transaction(updatePromises);
      await logActivity('content', 'Content Updated', 'Content blocks were updated in the CMS.');
    }

    successResponse(res, 'Content updated successfully', null);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

// ==========================================
// COURSES
// ==========================================
export const getCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({ orderBy: { createdAt: 'desc' } });
    successResponse(res, 'Courses fetched', courses);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

export const createCourse = async (req, res) => {
  try {
    const course = await prisma.course.create({ data: req.body });
    await logActivity('content', 'New Course Created', 'A new course was added to the CMS.');
    successResponse(res, 'Course created', course, 201);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

export const updateCourse = async (req, res) => {
  try {
    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: req.body
    });
    successResponse(res, 'Course updated', course);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

export const deleteCourse = async (req, res) => {
  try {
    await prisma.course.delete({ where: { id: req.params.id } });
    await logActivity('content', 'Course Deleted', 'A course was removed from the CMS.');
    successResponse(res, 'Course deleted', null);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

// ==========================================
// FACULTY
// ==========================================
export const getFaculty = async (req, res) => {
  try {
    const faculty = await prisma.faculty.findMany({ orderBy: { createdAt: 'desc' } });
    successResponse(res, 'Faculty fetched', faculty);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

export const createFaculty = async (req, res) => {
  try {
    const faculty = await prisma.faculty.create({ data: req.body });
    await logActivity('content', 'New Faculty Created', 'A new faculty member was added to the CMS.');
    successResponse(res, 'Faculty created', faculty, 201);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

export const updateFaculty = async (req, res) => {
  try {
    const dataToUpdate = { ...req.body };
    if (dataToUpdate.password && dataToUpdate.password.trim() === '') {
      delete dataToUpdate.password;
    }
    const faculty = await prisma.faculty.update({
      where: { id: req.params.id },
      data: dataToUpdate
    });
    successResponse(res, 'Faculty updated', faculty);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

export const deleteFaculty = async (req, res) => {
  try {
    await prisma.faculty.delete({ where: { id: req.params.id } });
    await logActivity('content', 'Faculty Deleted', 'A faculty member was removed from the CMS.');
    successResponse(res, 'Faculty deleted', null);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

// ==========================================
// STUDY MATERIALS
// ==========================================
export const getMaterials = async (req, res) => {
  try {
    const materials = await prisma.studyMaterial.findMany({ orderBy: { createdAt: 'desc' } });
    successResponse(res, 'Materials fetched', materials);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

export const createMaterial = async (req, res) => {
  try {
    const material = await prisma.studyMaterial.create({ data: req.body });
    await logActivity('content', 'New Material Created', 'A new study material was added to the CMS.');
    successResponse(res, 'Material created', material, 201);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

export const updateMaterial = async (req, res) => {
  try {
    const material = await prisma.studyMaterial.update({
      where: { id: req.params.id },
      data: req.body
    });
    successResponse(res, 'Material updated', material);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

export const deleteMaterial = async (req, res) => {
  try {
    await prisma.studyMaterial.delete({ where: { id: req.params.id } });
    await logActivity('content', 'Material Deleted', 'A study material was removed from the CMS.');
    successResponse(res, 'Material deleted', null);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

// ==========================================
// RESULTS
// ==========================================
export const getResults = async (req, res) => {
  try {
    const results = await prisma.result.findMany({ orderBy: { createdAt: 'desc' } });
    successResponse(res, 'Results fetched', results);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

export const createResult = async (req, res) => {
  try {
    const result = await prisma.result.create({ data: req.body });
    await logActivity('content', 'New Result Created', 'A new result was added to the CMS.');
    successResponse(res, 'Result created', result, 201);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

export const updateResult = async (req, res) => {
  try {
    const result = await prisma.result.update({
      where: { id: req.params.id },
      data: req.body
    });
    successResponse(res, 'Result updated', result);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

export const deleteResult = async (req, res) => {
  try {
    await prisma.result.delete({ where: { id: req.params.id } });
    successResponse(res, 'Result deleted', null);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

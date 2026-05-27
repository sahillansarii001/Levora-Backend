import Notice from '../models/Notice.js';
import SiteContent from '../models/SiteContent.js';
import Course from '../models/Course.js';
import Faculty from '../models/Faculty.js';
import StudyMaterial from '../models/StudyMaterial.js';
import Result from '../models/Result.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { logActivity } from './activityController.js';

// ==========================================
// NOTICES
// ==========================================
export const getAllNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    successResponse(res, 'Notices fetched', notices);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

export const createNotice = async (req, res) => {
  try {
    const notice = await Notice.create(req.body);
    await logActivity('content', 'New Notice Created', 'A new notice was added to the CMS.');
    successResponse(res, 'Notice created', notice, 201);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

export const updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    successResponse(res, 'Notice updated', notice);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

export const deleteNotice = async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    await logActivity('content', 'Notice Deleted', 'A notice was removed from the CMS.');
    successResponse(res, 'Notice deleted', null);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

// ==========================================
// WEBSITE CONTENT
// Get all content, optionally filtered by page
export const getContent = async (req, res) => {
  try {
    const { page } = req.query;
    const filter = page ? { page } : {};
    const content = await SiteContent.find(filter);
    
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

// Create a new content block
export const createContent = async (req, res) => {
  try {
    const { page, section, key, value, type } = req.body;
    if (!page || !key || !value) {
      return errorResponse(res, 'Page, key, and value are required', [], 400);
    }
    const content = await SiteContent.create({ page, section: section || 'general', key, value, type: type || 'text' });
    await logActivity('content', 'New Content Created', `A new content block was added to the CMS: ${key}.`);
    successResponse(res, 'Content created successfully', content, 201);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

// Update multiple content blocks at once
export const updateContent = async (req, res) => {
  try {
    const { page, updates } = req.body; // Array of { key, value }
    
    if (!Array.isArray(updates)) {
      return errorResponse(res, 'Updates must be an array', [], 400);
    }

    if (page) {
      const updateKeys = updates.map(u => u.key);
      await SiteContent.deleteMany({ page, key: { $nin: updateKeys } });
    }

    const bulkOps = updates.map(update => ({
      updateOne: {
        filter: { key: update.key },
        update: { 
          $set: { value: update.value },
          $setOnInsert: { page: update.page || 'homepage', section: update.section || 'general', type: 'html' }
        },
        upsert: true // Allow upserting
      }
    }));

    if (bulkOps.length > 0) {
      await SiteContent.bulkWrite(bulkOps);
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
    const courses = await Course.find().sort({ createdAt: -1 });
    successResponse(res, 'Courses fetched', courses);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

export const createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    await logActivity('content', 'New Course Created', 'A new course was added to the CMS.');
    successResponse(res, 'Course created', course, 201);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    successResponse(res, 'Course updated', course);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

export const deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    await logActivity('content', 'Course Deleted', 'A course was removed from the CMS.');
    successResponse(res, 'Course deleted', null);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

// ==========================================
// FACULTY
// ==========================================
export const getFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.find().sort({ createdAt: -1 });
    successResponse(res, 'Faculty fetched', faculty);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

export const createFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.create(req.body);
    await logActivity('content', 'New Faculty Created', 'A new faculty member was added to the CMS.');
    successResponse(res, 'Faculty created', faculty, 201);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

export const updateFaculty = async (req, res) => {
  try {
    if (req.body.password && req.body.password.trim() === '') {
      delete req.body.password; // Don't update password if empty
    }
    const faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, { new: true });
    successResponse(res, 'Faculty updated', faculty);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

export const deleteFaculty = async (req, res) => {
  try {
    await Faculty.findByIdAndDelete(req.params.id);
    await logActivity('content', 'Faculty Deleted', 'A faculty member was removed from the CMS.');
    successResponse(res, 'Faculty deleted', null);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

// ==========================================
// STUDY MATERIALS
// ==========================================
export const getMaterials = async (req, res) => {
  try {
    const materials = await StudyMaterial.find().sort({ createdAt: -1 });
    successResponse(res, 'Materials fetched', materials);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

export const createMaterial = async (req, res) => {
  try {
    const material = await StudyMaterial.create(req.body);
    await logActivity('content', 'New Material Created', 'A new study material was added to the CMS.');
    successResponse(res, 'Material created', material, 201);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

export const updateMaterial = async (req, res) => {
  try {
    const material = await StudyMaterial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    successResponse(res, 'Material updated', material);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

export const deleteMaterial = async (req, res) => {
  try {
    await StudyMaterial.findByIdAndDelete(req.params.id);
    await logActivity('content', 'Material Deleted', 'A study material was removed from the CMS.');
    successResponse(res, 'Material deleted', null);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

// ==========================================
// RESULTS
// ==========================================
export const getResults = async (req, res) => {
  try {
    const results = await Result.find().sort({ createdAt: -1 });
    successResponse(res, 'Results fetched', results);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

export const createResult = async (req, res) => {
  try {
    const result = await Result.create(req.body);
    await logActivity('content', 'New Result Created', 'A new result was added to the CMS.');
    successResponse(res, 'Result created', result, 201);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

export const updateResult = async (req, res) => {
  try {
    const result = await Result.findByIdAndUpdate(req.params.id, req.body, { new: true });
    successResponse(res, 'Result updated', result);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

export const deleteResult = async (req, res) => {
  try {
    await Result.findByIdAndDelete(req.params.id);
    successResponse(res, 'Result deleted', null);
  } catch (error) { errorResponse(res, error.message, [], 500); }
};

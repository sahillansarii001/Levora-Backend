import { SystemSetting } from '../models.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

export const getSettings = async (req, res) => {
  try {
    let settings = await SystemSetting.findOne();
    if (!settings) {
      // If no settings exist, create a default one
      settings = await SystemSetting.create({});
    }
    successResponse(res, 'Settings fetched successfully', settings);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export const getPublicSettings = async (req, res) => {
  try {
    const settings = await SystemSetting.findOne();
    if (!settings) {
      return successResponse(res, 'Public settings', { maintenanceMode: false, admissionsOpen: true });
    }
    successResponse(res, 'Public settings', { 
      maintenanceMode: settings.maintenanceMode, 
      admissionsOpen: settings.admissionsOpen,
      academyName: settings.academyName,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      address: settings.address,
      visitingHours: settings.visitingHours,
      facebookUrl: settings.facebookUrl,
      instagramUrl: settings.instagramUrl,
      youtubeUrl: settings.youtubeUrl,
      twitterUrl: settings.twitterUrl,
      trustBadge1: settings.trustBadge1,
      trustBadge2: settings.trustBadge2
    });
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export const updateSettings = async (req, res) => {
  try {
    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = new SystemSetting(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    successResponse(res, 'Settings updated successfully', settings);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

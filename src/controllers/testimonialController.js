import Testimonial from '../models/Testimonial.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    successResponse(res, 'Testimonials fetched successfully', testimonials);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export const createTestimonial = async (req, res) => {
  try {
    const testimonial = new Testimonial(req.body);
    await testimonial.save();
    successResponse(res, 'Testimonial created successfully', testimonial, 201);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findByIdAndUpdate(id, req.body, { new: true });
    if (!testimonial) return errorResponse(res, 'Testimonial not found', [], 404);
    successResponse(res, 'Testimonial updated successfully', testimonial);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findByIdAndDelete(id);
    if (!testimonial) return errorResponse(res, 'Testimonial not found', [], 404);
    successResponse(res, 'Testimonial deleted successfully');
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

import prisma from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' }
    });
    successResponse(res, 'Testimonials fetched successfully', testimonials);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export const createTestimonial = async (req, res) => {
  try {
    const testimonial = await prisma.testimonial.create({ data: req.body });
    successResponse(res, 'Testimonial created successfully', testimonial, 201);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: req.body
    });
    successResponse(res, 'Testimonial updated successfully', testimonial);
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 'Testimonial not found', [], 404);
    }
    errorResponse(res, error.message, [], 500);
  }
};

export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.testimonial.delete({ where: { id } });
    successResponse(res, 'Testimonial deleted successfully');
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 'Testimonial not found', [], 404);
    }
    errorResponse(res, error.message, [], 500);
  }
};

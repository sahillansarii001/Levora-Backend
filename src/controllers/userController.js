import prisma from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import bcrypt from 'bcryptjs';

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        isSubscribed: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || 'N/A',
      status: user.status,
      purchaseCount: 1,
      purchasedNotes: [user.subscriptionPlan ? `${user.subscriptionPlan.charAt(0).toUpperCase() + user.subscriptionPlan.slice(1)} Plan` : 'Premium Access'],
      createdAt: user.createdAt
    }));

    successResponse(res, 'Users fetched successfully', formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    errorResponse(res, error.message, [], 500);
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, phone, password, status, studyMaterialIds } = req.body;
    
    if (!name || !email || !password) {
      return errorResponse(res, 'Name, email, and password are required', [], 400);
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return errorResponse(res, 'A user with this email already exists', [], 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const purchaseData = Array.isArray(studyMaterialIds) ? studyMaterialIds.map(id => ({
      studyMaterialId: id,
      amount: 0,
      paymentStatus: 'granted_by_admin'
    })) : [];

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        status: status || 'active',
        purchases: {
          create: purchaseData
        }
      },
      include: {
        purchases: true
      }
    });

    successResponse(res, 'User created successfully', {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      status: newUser.status,
      purchases: newUser.purchases
    }, 201);
  } catch (error) {
    console.error('Error creating user:', error);
    errorResponse(res, error.message, [], 500);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    successResponse(res, 'User deleted successfully', null);
  } catch (error) {
    console.error('Error deleting user:', error);
    errorResponse(res, error.message, [], 500);
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      return errorResponse(res, 'User not found', [], 404);
    }
    
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status: newStatus }
    });
    
    successResponse(res, `User ${newStatus} successfully`, updatedUser);
  } catch (error) {
    console.error('Error toggling user status:', error);
    errorResponse(res, error.message, [], 500);
  }
};

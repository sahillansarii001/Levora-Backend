import prisma from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import bcrypt from 'bcryptjs';

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        purchases: {
          some: {}
        }
      },
      include: {
        purchases: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const materials = await prisma.studyMaterial.findMany({
      select: { id: true, title: true }
    });
    
    const materialMap = materials.reduce((acc, mat) => {
      acc[mat.id] = mat.title;
      return acc;
    }, {});

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      purchaseCount: user.purchases.length,
      purchasedNotes: user.purchases.map(p => materialMap[p.studyMaterialId] || 'Unknown Note'),
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

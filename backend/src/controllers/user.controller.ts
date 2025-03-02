import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient, UserRole } from '@prisma/client';
import { logger } from '../index';

const prisma = new PrismaClient();

/**
 * Get all users for a company
 * @route GET /api/users
 * @access Private (Admin, Operator)
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.query;

    // If user is not ADMIN, they can only see users from their company
    const queryCompanyId = req.user.role === 'ADMIN' && companyId ? companyId as string : req.user.role !== 'ADMIN' ? req.user.companyId : undefined;

    const users = await prisma.user.findMany({
      where: queryCompanyId ? { companyId: queryCompanyId } : {},
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
        maxDiscount: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json(users);
  } catch (error) {
    logger.error('Error in getUsers controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get user by ID
 * @route GET /api/users/:id
 * @access Private (Admin, Operator)
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
        maxDiscount: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has permission to view this user
    if (req.user.role !== 'ADMIN' && user.companyId !== req.user.companyId) {
      return res.status(403).json({ message: 'Not authorized to access this user' });
    }

    res.json(user);
  } catch (error) {
    logger.error('Error in getUserById controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new user
 * @route POST /api/users
 * @access Private (Admin)
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, companyId, maxDiscount } = req.body;

    // Check if user already exists
    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if company exists
    const companyExists = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!companyExists) {
      return res.status(400).json({ message: 'Company not found' });
    }

    // Check if user has permission to create user for this company
    if (req.user.role !== 'ADMIN' && companyId !== req.user.companyId) {
      return res.status(403).json({ message: 'Not authorized to create user for this company' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as UserRole,
        company: {
          connect: { id: companyId },
        },
        maxDiscount: maxDiscount || 0,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
        maxDiscount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    logger.error('Error in createUser controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update a user
 * @route PUT /api/users/:id
 * @access Private (Admin, Operator)
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role, companyId, maxDiscount, password } = req.body;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has permission to update this user
    if (req.user.role !== 'ADMIN' && user.companyId !== req.user.companyId) {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role && req.user.role === 'ADMIN') updateData.role = role as UserRole;
    if (companyId && req.user.role === 'ADMIN') {
      // Check if company exists
      const companyExists = await prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!companyExists) {
        return res.status(400).json({ message: 'Company not found' });
      }

      updateData.company = { connect: { id: companyId } };
    }
    if (maxDiscount !== undefined) updateData.maxDiscount = maxDiscount;

    // Hash password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
        maxDiscount: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            name: true,
          },
        },
      },
    });

    res.json(updatedUser);
  } catch (error) {
    logger.error('Error in updateUser controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete a user
 * @route DELETE /api/users/:id
 * @access Private (Admin)
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has permission to delete this user
    if (req.user.role !== 'ADMIN' && user.companyId !== req.user.companyId) {
      return res.status(403).json({ message: 'Not authorized to delete this user' });
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Error in deleteUser controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
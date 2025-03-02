import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../index';

const prisma = new PrismaClient();

/**
 * Get all companies
 * @route GET /api/companies
 * @access Private (Admin)
 */
export const getCompanies = async (req: Request, res: Response) => {
  try {
    // If user is not ADMIN, they can only see their own company
    const companies = req.user.role === 'ADMIN'
      ? await prisma.company.findMany({
          orderBy: { name: 'asc' },
        })
      : await prisma.company.findMany({
          where: { id: req.user.companyId },
          orderBy: { name: 'asc' },
        });

    res.json(companies);
  } catch (error) {
    logger.error('Error in getCompanies controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get company by ID
 * @route GET /api/companies/:id
 * @access Private (Admin, Operator)
 */
export const getCompanyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user has permission to view this company
    if (req.user.role !== 'ADMIN' && id !== req.user.companyId) {
      return res.status(403).json({ message: 'Not authorized to access this company' });
    }

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            products: true,
            customers: true,
            orders: true,
            docks: true,
          },
        },
      },
    });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json(company);
  } catch (error) {
    logger.error('Error in getCompanyById controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new company
 * @route POST /api/companies
 * @access Private (Admin)
 */
export const createCompany = async (req: Request, res: Response) => {
  try {
    const { name, cnpj, address, phone, email, maxDiscount } = req.body;

    // Check if company with CNPJ already exists
    const companyExists = await prisma.company.findUnique({
      where: { cnpj },
    });

    if (companyExists) {
      return res.status(400).json({ message: 'Company with this CNPJ already exists' });
    }

    // Create company
    const company = await prisma.company.create({
      data: {
        name,
        cnpj,
        address,
        phone,
        email,
        maxDiscount: maxDiscount || 0,
      },
    });

    res.status(201).json(company);
  } catch (error) {
    logger.error('Error in createCompany controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update a company
 * @route PUT /api/companies/:id
 * @access Private (Admin)
 */
export const updateCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, cnpj, address, phone, email, maxDiscount, active } = req.body;

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Check if user has permission to update this company
    if (req.user.role !== 'ADMIN' && id !== req.user.companyId) {
      return res.status(403).json({ message: 'Not authorized to update this company' });
    }

    // Check if CNPJ is already taken by another company
    if (cnpj && cnpj !== company.cnpj) {
      const cnpjExists = await prisma.company.findUnique({
        where: { cnpj },
      });

      if (cnpjExists) {
        return res.status(400).json({ message: 'CNPJ already in use by another company' });
      }
    }

    // Update company
    const updatedCompany = await prisma.company.update({
      where: { id },
      data: {
        name: name || company.name,
        cnpj: cnpj || company.cnpj,
        address: address || company.address,
        phone: phone || company.phone,
        email: email || company.email,
        maxDiscount: maxDiscount !== undefined ? maxDiscount : company.maxDiscount,
        active: active !== undefined ? active : company.active,
      },
    });

    res.json(updatedCompany);
  } catch (error) {
    logger.error('Error in updateCompany controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete a company
 * @route DELETE /api/companies/:id
 * @access Private (Admin)
 */
export const deleteCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            products: true,
            customers: true,
            orders: true,
          },
        },
      },
    });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Check if company has associated data
    if (
      company._count.users > 0 ||
      company._count.products > 0 ||
      company._count.customers > 0 ||
      company._count.orders > 0
    ) {
      return res.status(400).json({
        message: 'Cannot delete company with associated data. Deactivate it instead.',
        counts: company._count,
      });
    }

    // Delete company
    await prisma.company.delete({
      where: { id },
    });

    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    logger.error('Error in deleteCompany controller:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
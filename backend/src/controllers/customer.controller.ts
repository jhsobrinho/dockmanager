import { Request, Response } from 'express';
import { prisma } from '../index';

// Get all customers for a company
export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    
    const customers = await prisma.customer.findMany({
      where: {
        companyId,
        active: true,
      },
    });

    return res.status(200).json(customers);
  } catch (error) {
    console.error('Error getting customers:', error);
    return res.status(500).json({ message: 'Error getting customers', error });
  }
};

// Get a single customer by ID
export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    return res.status(200).json(customer);
  } catch (error) {
    console.error('Error getting customer:', error);
    return res.status(500).json({ message: 'Error getting customer', error });
  }
};

// Create a new customer
export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      cnpj, 
      address, 
      phone, 
      email, 
      companyId, 
      isFidelized, 
      quotaMinutes, 
      autoReserve, 
      preferredDays, 
      preferredTime 
    } = req.body;

    const customer = await prisma.customer.create({
      data: {
        name,
        cnpj,
        address,
        phone,
        email,
        companyId,
        isFidelized: isFidelized || false,
        quotaMinutes: quotaMinutes ? parseInt(quotaMinutes) : 0,
        autoReserve: autoReserve || false,
        preferredDays: preferredDays || [],
        preferredTime,
      },
    });

    return res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    return res.status(500).json({ message: 'Error creating customer', error });
  }
};

// Update a customer
export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      cnpj, 
      address, 
      phone, 
      email, 
      isFidelized, 
      quotaMinutes, 
      autoReserve, 
      preferredDays, 
      preferredTime,
      active 
    } = req.body;

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        cnpj,
        address,
        phone,
        email,
        isFidelized,
        quotaMinutes: quotaMinutes !== undefined ? parseInt(quotaMinutes) : undefined,
        autoReserve,
        preferredDays,
        preferredTime,
        active,
      },
    });

    return res.status(200).json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    return res.status(500).json({ message: 'Error updating customer', error });
  }
};

// Delete a customer (soft delete by setting active to false)
export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        active: false,
      },
    });

    return res.status(200).json(customer);
  } catch (error) {
    console.error('Error deleting customer:', error);
    return res.status(500).json({ message: 'Error deleting customer', error });
  }
};
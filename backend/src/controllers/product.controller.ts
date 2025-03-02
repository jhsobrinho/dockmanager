import { Request, Response } from 'express';
import { prisma } from '../index';

// Get all products for a company
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    
    const products = await prisma.product.findMany({
      where: {
        companyId,
        active: true,
      },
    });

    return res.status(200).json(products);
  } catch (error) {
    console.error('Error getting products:', error);
    return res.status(500).json({ message: 'Error getting products', error });
  }
};

// Get a single product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error('Error getting product:', error);
    return res.status(500).json({ message: 'Error getting product', error });
  }
};

// Create a new product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, sku, price, stock, loadTime, companyId } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        sku,
        price: parseFloat(price),
        stock: parseInt(stock),
        loadTime: parseInt(loadTime),
        companyId,
      },
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ message: 'Error creating product', error });
  }
};

// Update a product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, sku, price, stock, loadTime, active } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        sku,
        price: price ? parseFloat(price) : undefined,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        loadTime: loadTime ? parseInt(loadTime) : undefined,
        active,
      },
    });

    return res.status(200).json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ message: 'Error updating product', error });
  }
};

// Delete a product (soft delete by setting active to false)
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.update({
      where: { id },
      data: {
        active: false,
      },
    });

    return res.status(200).json(product);
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ message: 'Error deleting product', error });
  }
};
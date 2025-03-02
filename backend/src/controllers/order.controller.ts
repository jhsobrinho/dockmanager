import { Request, Response } from 'express';
import { prisma } from '../index';
import { OrderStatus } from '@prisma/client';

// Get all orders for a company
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    
    const orders = await prisma.order.findMany({
      where: {
        companyId,
      },
      include: {
        customer: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        dock: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json(orders);
  } catch (error) {
    console.error('Error getting orders:', error);
    return res.status(500).json({ message: 'Error getting orders', error });
  }
};

// Get a single order by ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        dock: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error('Error getting order:', error);
    return res.status(500).json({ message: 'Error getting order', error });
  }
};

// Create a new order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { 
      customerId, 
      items, 
      notes, 
      scheduledDate, 
      dockId 
    } = req.body;
    
    const userId = req.user.id;
    const companyId = req.user.companyId;

    // Generate order number (format: ORD-YYYYMMDD-XXXX)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.floor(1000 + Math.random() * 9000).toString();
    const orderNumber = `ORD-${dateStr}-${randomStr}`;

    // Calculate total amount and total discount
    let totalAmount = 0;
    let totalDiscount = 0;

    // Validate items and calculate totals
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must have at least one item' });
    }

    // Get user's max discount
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { maxDiscount: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate discounts against user's max discount
    for (const item of items) {
      if (item.discount > user.maxDiscount) {
        return res.status(400).json({ 
          message: `Discount exceeds your maximum allowed discount of ${user.maxDiscount}%` 
        });
      }
    }

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        userId,
        companyId,
        status: OrderStatus.PENDING,
        totalAmount: 0, // Will update after calculating
        totalDiscount: 0, // Will update after calculating
        notes,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        dockId,
        items: {
          create: items.map(item => {
            const itemTotal = item.quantity * item.unitPrice;
            const itemDiscount = (itemTotal * item.discount) / 100;
            
            totalAmount += itemTotal;
            totalDiscount += itemDiscount;
            
            return {
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount,
            };
          }),
        },
      },
    });

    // Update order with calculated totals
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        totalAmount,
        totalDiscount,
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return res.status(201).json(updatedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ message: 'Error creating order', error });
  }
};

// Update an order
export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      status, 
      notes, 
      scheduledDate, 
      dockId,
      startTime,
      endTime
    } = req.body;

    const order = await prisma.order.update({
      where: { id },
      data: {
        status: status ? status as OrderStatus : undefined,
        notes,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        dockId,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return res.status(200).json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return res.status(500).json({ message: 'Error updating order', error });
  }
};

// Cancel an order
export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.CANCELLED,
      },
    });

    return res.status(200).json(order);
  } catch (error) {
    console.error('Error cancelling order:', error);
    return res.status(500).json({ message: 'Error cancelling order', error });
  }
};
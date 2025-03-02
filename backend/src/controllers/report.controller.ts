import { Request, Response } from 'express';
import { prisma } from '../index';

// Get sales report by period
export const getSalesReport = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    
    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Get orders in the date range
    const orders = await prisma.order.findMany({
      where: {
        companyId,
        createdAt: {
          gte: start,
          lte: end,
        },
        status: {
          not: 'CANCELLED',
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
    });

    // Calculate total sales, discounts, and other metrics
    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalDiscounts = orders.reduce((sum, order) => sum + order.totalDiscount, 0);
    const netSales = totalSales - totalDiscounts;
    const orderCount = orders.length;
    
    // Group sales by product
    const productSales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product.id;
        if (!productSales[productId]) {
          productSales[productId] = {
            productId,
            productName: item.product.name,
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[productId].quantity += item.quantity;
        productSales[productId].revenue += (item.unitPrice * item.quantity) - ((item.unitPrice * item.quantity) * item.discount / 100);
      });
    });

    // Group sales by customer
    const customerSales = {};
    orders.forEach(order => {
      const customerId = order.customer.id;
      if (!customerSales[customerId]) {
        customerSales[customerId] = {
          customerId,
          customerName: order.customer.name,
          orderCount: 0,
          revenue: 0,
        };
      }
      customerSales[customerId].orderCount += 1;
      customerSales[customerId].revenue += order.totalAmount - order.totalDiscount;
    });

    // Group sales by day
    const dailySales = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!dailySales[date]) {
        dailySales[date] = {
          date,
          orderCount: 0,
          revenue: 0,
        };
      }
      dailySales[date].orderCount += 1;
      dailySales[date].revenue += order.totalAmount - order.totalDiscount;
    });

    return res.status(200).json({
      summary: {
        totalSales,
        totalDiscounts,
        netSales,
        orderCount,
        averageOrderValue: orderCount > 0 ? netSales / orderCount : 0,
      },
      productSales: Object.values(productSales),
      customerSales: Object.values(customerSales),
      dailySales: Object.values(dailySales),
    });
  } catch (error) {
    console.error('Error generating sales report:', error);
    return res.status(500).json({ message: 'Error generating sales report', error });
  }
};

// Get dock utilization report
export const getDockUtilizationReport = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    
    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Get docks
    const docks = await prisma.dock.findMany({
      where: {
        companyId,
        active: true,
      },
      include: {
        orders: {
          where: {
            scheduledDate: {
              gte: start,
              lte: end,
            },
            status: {
              not: 'CANCELLED',
            },
          },
        },
        maintenances: {
          where: {
            startDate: {
              lte: end,
            },
            endDate: {
              gte: start,
            },
          },
        },
      },
    });

    // Calculate utilization metrics for each dock
    const dockUtilization = docks.map(dock => {
      const totalOrders = dock.orders.length;
      
      // Calculate total maintenance hours in the period
      let maintenanceHours = 0;
      dock.maintenances.forEach(maintenance => {
        const maintenanceStart = new Date(Math.max(maintenance.startDate.getTime(), start.getTime()));
        const maintenanceEnd = new Date(Math.min(maintenance.endDate.getTime(), end.getTime()));
        const hours = (maintenanceEnd.getTime() - maintenanceStart.getTime()) / (1000 * 60 * 60);
        maintenanceHours += hours;
      });

      // Calculate total order hours
      let orderHours = 0;
      dock.orders.forEach(order => {
        if (order.startTime && order.endTime) {
          const hours = (order.endTime.getTime() - order.startTime.getTime()) / (1000 * 60 * 60);
          orderHours += hours;
        }
      });

      // Calculate total available hours in the period (excluding maintenance)
      const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const totalAvailableHours = totalDays * 24 - maintenanceHours;
      
      // Calculate utilization percentage
      const utilizationPercentage = totalAvailableHours > 0 
        ? (orderHours / totalAvailableHours) * 100 
        : 0;

      return {
        dockId: dock.id,
        dockName: dock.name,
        totalOrders,
        orderHours,
        maintenanceHours,
        totalAvailableHours,
        utilizationPercentage,
      };
    });

    return res.status(200).json(dockUtilization);
  } catch (error) {
    console.error('Error generating dock utilization report:', error);
    return res.status(500).json({ message: 'Error generating dock utilization report', error });
  }
};

// Get customer activity report
export const getCustomerActivityReport = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    
    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Get customers with their orders in the date range
    const customers = await prisma.customer.findMany({
      where: {
        companyId,
        active: true,
      },
      include: {
        orders: {
          where: {
            createdAt: {
              gte: start,
              lte: end,
            },
          },
          include: {
            items: true,
          },
        },
      },
    });

    // Calculate metrics for each customer
    const customerActivity = customers.map(customer => {
      const totalOrders = customer.orders.length;
      
      // Calculate total spent
      let totalSpent = 0;
      customer.orders.forEach(order => {
        totalSpent += order.totalAmount - order.totalDiscount;
      });

      // Calculate total items purchased
      let totalItems = 0;
      customer.orders.forEach(order => {
        order.items.forEach(item => {
          totalItems += item.quantity;
        });
      });

      return {
        customerId: customer.id,
        customerName: customer.name,
        isFidelized: customer.isFidelized,
        quotaMinutes: customer.quotaMinutes,
        totalOrders,
        totalSpent,
        totalItems,
        averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0,
      };
    });

    return res.status(200).json(customerActivity);
  } catch (error) {
    console.error('Error generating customer activity report:', error);
    return res.status(500).json({ message: 'Error generating customer activity report', error });
  }
};
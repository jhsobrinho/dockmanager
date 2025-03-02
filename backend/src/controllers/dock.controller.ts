import { Request, Response } from 'express';
import { prisma } from '../index';

// Get all docks for a company
export const getAllDocks = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    
    const docks = await prisma.dock.findMany({
      where: {
        companyId,
        active: true,
      },
      include: {
        schedules: true,
        maintenances: {
          where: {
            endDate: {
              gte: new Date(),
            },
          },
        },
        orders: {
          where: {
            scheduledDate: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
          include: {
            customer: true,
          },
        },
      },
    });

    return res.status(200).json(docks);
  } catch (error) {
    console.error('Error getting docks:', error);
    return res.status(500).json({ message: 'Error getting docks', error });
  }
};

// Get a single dock by ID
export const getDockById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const dock = await prisma.dock.findUnique({
      where: { id },
      include: {
        schedules: true,
        maintenances: true,
        orders: {
          include: {
            customer: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!dock) {
      return res.status(404).json({ message: 'Dock not found' });
    }

    return res.status(200).json(dock);
  } catch (error) {
    console.error('Error getting dock:', error);
    return res.status(500).json({ message: 'Error getting dock', error });
  }
};

// Create a new dock
export const createDock = async (req: Request, res: Response) => {
  try {
    const { name, description, companyId } = req.body;
    const creatorId = req.user.id;

    const dock = await prisma.dock.create({
      data: {
        name,
        description,
        companyId,
        creatorId,
      },
    });

    return res.status(201).json(dock);
  } catch (error) {
    console.error('Error creating dock:', error);
    return res.status(500).json({ message: 'Error creating dock', error });
  }
};

// Update a dock
export const updateDock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, active } = req.body;

    const dock = await prisma.dock.update({
      where: { id },
      data: {
        name,
        description,
        active,
      },
    });

    return res.status(200).json(dock);
  } catch (error) {
    console.error('Error updating dock:', error);
    return res.status(500).json({ message: 'Error updating dock', error });
  }
};

// Delete a dock (soft delete by setting active to false)
export const deleteDock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const dock = await prisma.dock.update({
      where: { id },
      data: {
        active: false,
      },
    });

    return res.status(200).json(dock);
  } catch (error) {
    console.error('Error deleting dock:', error);
    return res.status(500).json({ message: 'Error deleting dock', error });
  }
};

// Create a dock schedule
export const createDockSchedule = async (req: Request, res: Response) => {
  try {
    const { dockId, dayOfWeek, startTime, endTime } = req.body;

    const schedule = await prisma.dockSchedule.create({
      data: {
        dockId,
        dayOfWeek,
        startTime,
        endTime,
      },
    });

    return res.status(201).json(schedule);
  } catch (error) {
    console.error('Error creating dock schedule:', error);
    return res.status(500).json({ message: 'Error creating dock schedule', error });
  }
};

// Update a dock schedule
export const updateDockSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { dayOfWeek, startTime, endTime } = req.body;

    const schedule = await prisma.dockSchedule.update({
      where: { id },
      data: {
        dayOfWeek,
        startTime,
        endTime,
      },
    });

    return res.status(200).json(schedule);
  } catch (error) {
    console.error('Error updating dock schedule:', error);
    return res.status(500).json({ message: 'Error updating dock schedule', error });
  }
};

// Delete a dock schedule
export const deleteDockSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.dockSchedule.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting dock schedule:', error);
    return res.status(500).json({ message: 'Error deleting dock schedule', error });
  }
};

// Create a dock maintenance
export const createDockMaintenance = async (req: Request, res: Response) => {
  try {
    const { dockId, startDate, endDate, reason } = req.body;

    const maintenance = await prisma.dockMaintenance.create({
      data: {
        dockId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
      },
    });

    return res.status(201).json(maintenance);
  } catch (error) {
    console.error('Error creating dock maintenance:', error);
    return res.status(500).json({ message: 'Error creating dock maintenance', error });
  }
};

// Update a dock maintenance
export const updateDockMaintenance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, reason } = req.body;

    const maintenance = await prisma.dockMaintenance.update({
      where: { id },
      data: {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        reason,
      },
    });

    return res.status(200).json(maintenance);
  } catch (error) {
    console.error('Error updating dock maintenance:', error);
    return res.status(500).json({ message: 'Error updating dock maintenance', error });
  }
};

// Delete a dock maintenance
export const deleteDockMaintenance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.dockMaintenance.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting dock maintenance:', error);
    return res.status(500).json({ message: 'Error deleting dock maintenance', error });
  }
};
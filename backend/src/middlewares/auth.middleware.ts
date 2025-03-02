import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logger } from '../index';

const prisma = new PrismaClient();

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Middleware to protect routes that require authentication
 */
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as {
        id: string;
        email: string;
        role: string;
      };

      // Check if user still exists
      const userExists = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: {
          company: {
            select: {
              active: true,
            },
          },
        },
      });

      if (!userExists) {
        logger.warn(`User with ID ${decoded.id} not found during token verification`);
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Check if company is active
      if (!userExists.company.active) {
        logger.warn(`Company of user with ID ${decoded.id} is inactive`);
        return res.status(401).json({ message: 'Not authorized, company is inactive' });
      }

      // Set user in request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (error) {
      logger.error('Error verifying token:', error);
      res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

/**
 * Middleware to restrict access based on user role
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no user found' });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`User ${req.user.id} with role ${req.user.role} attempted to access a restricted route`);
      return res.status(403).json({
        message: `Not authorized, role ${req.user.role} not allowed to access this resource`,
      });
    }

    next();
  };
};
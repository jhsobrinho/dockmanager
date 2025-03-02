import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  cancelOrder,
} from '../controllers/order.controller';

const router = express.Router();

// Apply auth middleware to all order routes
router.use(authMiddleware);

// Order routes
router.get('/company/:companyId', getAllOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.put('/:id', updateOrder);
router.put('/:id/cancel', cancelOrder);

export default router;
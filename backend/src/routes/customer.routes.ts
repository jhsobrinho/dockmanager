import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customer.controller';

const router = express.Router();

// Apply auth middleware to all customer routes
router.use(authMiddleware);

// Customer routes
router.get('/company/:companyId', getAllCustomers);
router.get('/:id', getCustomerById);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

export default router;
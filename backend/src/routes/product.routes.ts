import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller';

const router = express.Router();

// Apply auth middleware to all product routes
router.use(authMiddleware);

// Product routes
router.get('/company/:companyId', getAllProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
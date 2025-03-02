import express from 'express';
import { getCompanies, getCompanyById, createCompany, updateCompany, deleteCompany } from '../controllers/company.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes accessible by Admin and Operator
router.get('/', getCompanies);
router.get('/:id', getCompanyById);

// Routes accessible only by Admin
router.post('/', authorize('ADMIN'), createCompany);
router.put('/:id', authorize('ADMIN'), updateCompany);
router.delete('/:id', authorize('ADMIN'), deleteCompany);

export default router;
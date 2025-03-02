import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  getSalesReport,
  getDockUtilizationReport,
  getCustomerActivityReport,
} from '../controllers/report.controller';

const router = express.Router();

// Apply auth middleware to all report routes
router.use(authMiddleware);

// Report routes
router.get('/sales/company/:companyId', getSalesReport);
router.get('/dock-utilization/company/:companyId', getDockUtilizationReport);
router.get('/customer-activity/company/:companyId', getCustomerActivityReport);

export default router;
import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  getAllDocks,
  getDockById,
  createDock,
  updateDock,
  deleteDock,
  createDockSchedule,
  updateDockSchedule,
  deleteDockSchedule,
  createDockMaintenance,
  updateDockMaintenance,
  deleteDockMaintenance,
} from '../controllers/dock.controller';

const router = express.Router();

// Apply auth middleware to all dock routes
router.use(authMiddleware);

// Dock routes
router.get('/company/:companyId', getAllDocks);
router.get('/:id', getDockById);
router.post('/', createDock);
router.put('/:id', updateDock);
router.delete('/:id', deleteDock);

// Dock schedule routes
router.post('/schedule', createDockSchedule);
router.put('/schedule/:id', updateDockSchedule);
router.delete('/schedule/:id', deleteDockSchedule);

// Dock maintenance routes
router.post('/maintenance', createDockMaintenance);
router.put('/maintenance/:id', updateDockMaintenance);
router.delete('/maintenance/:id', deleteDockMaintenance);

export default router;
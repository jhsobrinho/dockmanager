import express from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/user.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes accessible by Admin and Operator
router.get('/', authorize('ADMIN', 'OPERATOR'), getUsers);
router.get('/:id', authorize('ADMIN', 'OPERATOR'), getUserById);

// Routes accessible only by Admin
router.post('/', authorize('ADMIN'), createUser);
router.put('/:id', authorize('ADMIN', 'OPERATOR'), updateUser);
router.delete('/:id', authorize('ADMIN'), deleteUser);

export default router;
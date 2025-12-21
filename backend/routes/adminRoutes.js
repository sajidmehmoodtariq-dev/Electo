import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { getUsers, updateUserStatus, createUser, deleteUser } from '../controllers/adminController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.post('/users', createUser);
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

export default router;

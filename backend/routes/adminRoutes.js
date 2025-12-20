import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { getUsers, updateUserStatus } from '../controllers/adminController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);

export default router;

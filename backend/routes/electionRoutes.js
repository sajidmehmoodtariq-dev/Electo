import express from 'express';
import { createElection, getElections, addCandidate } from '../controllers/electionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, authorize('admin', 'official'), createElection) // Both admin and official can creating elections? Usually official.
    .get(protect, getElections);

router.route('/:id/candidates')
    .post(protect, authorize('admin', 'official'), upload.single('photo'), addCandidate);

export default router;

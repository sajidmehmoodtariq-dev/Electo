import express from 'express';
import { createElection, getElections, addCandidate, updateElection } from '../controllers/electionController.js';
import { castVote } from '../controllers/voteController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, authorize('admin', 'official'), createElection) // Both admin and official can creating elections? Usually official.
    .get(protect, getElections);

router.route('/:id')
    .put(protect, authorize('admin', 'official'), updateElection);

router.route('/:id/candidates')
    .post(protect, authorize('admin', 'official'), upload.single('photo'), addCandidate);

router.put('/:id/vote', protect, authorize('voter'), castVote);

export default router;

import express from 'express';
import passport from 'passport';
import { registerUser, loginUser, googleCallback, githubCallback, updateProfile, getMe, forgotPassword, resetPassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadAvatar } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);

router.put('/profile', protect, uploadAvatar.single('avatar'), updateProfile);

// Google OAuth Routes
router.get('/me', protect, getMe);

router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    googleCallback
);

// GitHub OAuth Routes
router.get(
    '/github',
    passport.authenticate('github', { scope: ['user:email'] })
);

router.get(
    '/github/callback',
    passport.authenticate('github', { failureRedirect: '/login', session: false }),
    githubCallback
);

export default router;

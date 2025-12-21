import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

// @desc    Register a new user
const registerUser = async (req, res) => {
    try {
        const { name, email, password, cnic } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        if (cnic) {
            const cnicExists = await User.findOne({ cnic });
            if (cnicExists) {
                return res.status(400).json({ message: 'CNIC already used' });
            }
        }

        const user = await User.create({
            name,
            email,
            password,
            cnic,
            role: 'voter',
            status: 'pending', // Default
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                cnic: user.cnic,
                token: generateToken(user._id, user.role, user.cnic, user.status, user.isApproved),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status || 'active', // Fallback for old records if any
                rejectionReason: user.rejectionReason,
                cnic: user.cnic,
                token: generateToken(user._id, user.role, user.cnic, user.status || 'active', user.isApproved),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const handleSocialLogin = (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication failed' });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Pass status and cnic status to frontend via query params
    // removed duplicate declaration of status
    const status = req.user.status || 'pending';
    const hasCnic = !!req.user.cnic;
    const rejectionReason = req.user.rejectionReason ? encodeURIComponent(req.user.rejectionReason) : '';

    const token = generateToken(req.user._id, req.user.role, req.user.cnic, status, req.user.isApproved);

    res.redirect(`${frontendUrl}/auth/success?token=${token}&role=${req.user.role}&status=${status}&hasCnic=${hasCnic}&reason=${rejectionReason}`);
};

const googleCallback = handleSocialLogin;
const githubCallback = handleSocialLogin;

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                rejectionReason: user.rejectionReason,
                cnic: user.cnic,
                token: generateToken(user._id, user.role, user.cnic, user.status, user.isApproved),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile (CNIC)
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            if (req.body.cnic) {
                const cnicExists = await User.findOne({ cnic: req.body.cnic });
                if (cnicExists && cnicExists._id.toString() !== user._id.toString()) {
                    return res.status(400).json({ message: 'CNIC already used' });
                }
                user.cnic = req.body.cnic;
            }
            if (req.body.role) {
                if (['voter', 'official'].includes(req.body.role)) {
                    user.role = req.body.role;
                }
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                status: updatedUser.status,
                cnic: updatedUser.cnic,
                token: generateToken(updatedUser._id, updatedUser.role, updatedUser.cnic, updatedUser.status, updatedUser.isApproved),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Forgot Password
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false }); // Skip validation for other fields

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password reset token',
                message,
            });

            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Password
const resetPassword = async (req, res) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resetToken)
        .digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid token or token expired' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(201).json({
            success: true,
            data: 'Password reset success',
            token: generateToken(user._id, user.role, user.cnic, user.status, user.isApproved),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { registerUser, loginUser, googleCallback, githubCallback, getMe, updateProfile, forgotPassword, resetPassword };

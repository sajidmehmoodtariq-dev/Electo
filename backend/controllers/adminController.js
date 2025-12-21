import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Get users by status (or all)
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        if (status) {
            query.status = status;
        } else {
            // Default to all or maybe excluding admin?
            // query.role = { $ne: 'admin' }; 
        }

        const users = await User.find(query).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;

        if (!['active', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.status = status;
        if (status === 'rejected' && rejectionReason) {
            user.rejectionReason = rejectionReason;
        } else if (status === 'active') {
            user.rejectionReason = undefined; // Clear reason if activated
        }

        const updatedUser = await user.save();

        if (status === 'active') {
            const message = `Dear ${updatedUser.name},\n\nYour account has been approved by the admin. You can now login to your account.\n\nRegards,\nTeam Electo`;

            try {
                await sendEmail({
                    email: updatedUser.email,
                    subject: 'Account Approved',
                    message,
                });
            } catch (error) {
                console.error('Email send failed:', error);
            }
        }

        res.json({
            _id: updatedUser._id,
            status: updatedUser.status,
            rejectionReason: updatedUser.rejectionReason
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new user
// @route   POST /api/admin/users
// @access  Private/Admin
const createUser = async (req, res) => {
    try {
        const { name, email, password, cnic, role } = req.body;

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
            cnic: cnic || undefined, // Ensure empty string doesn't cause duplicate key error
            role: role || 'voter',
            status: 'active', // Admin created users are auto-approved
        });

        if (user) {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const message = `Dear ${user.name},\n\nYour account has been created by the admin.\n\nLogin Credentials:\nEmail: ${user.email}\nPassword: ${password}\n\nPlease login at: ${frontendUrl}/login\n\nPlease change your password after logging in.\n\nRegards,\nTeam Electo`;

            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Account Created',
                    message,
                });
            } catch (error) {
                console.error('Email send failed:', error);
            }

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                cnic: user.cnic,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { getUsers, updateUserStatus, createUser, deleteUser };

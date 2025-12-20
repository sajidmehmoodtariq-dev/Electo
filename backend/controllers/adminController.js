import User from '../models/User.js';

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
        res.json({
            _id: updatedUser._id,
            status: updatedUser.status,
            rejectionReason: updatedUser.rejectionReason
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { getUsers, updateUserStatus };

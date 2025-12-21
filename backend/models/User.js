import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        // Password is required if googleId and githubId are not present
        required: function () { return !this.googleId && !this.githubId; },
        select: false, // Don't return password by default
    },
    role: {
        type: String,
        enum: ['admin', 'official', 'voter'],
        default: 'voter',
    },
    cnic: {
        type: String,
        unique: true,
        sparse: true, // Allows null/undefined to not clash for uniqueness
        validate: {
            validator: function(v) {
                // Allow null/undefined or must match XXXXX-XXXXXXX-X format
                return !v || /^\d{5}-\d{7}-\d$/.test(v);
            },
            message: props => `${props.value} is not a valid CNIC format! Use XXXXX-XXXXXXX-X`
        }
    },
    city: { type: String },
    province: { type: String },
    votedElections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Election'
    }],
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    githubId: {
        type: String,
        unique: true,
        sparse: true,
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'rejected'],
        default: 'pending',
    },
    rejectionReason: {
        type: String,
    },
    avatar: {
        type: String,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, {
    timestamps: true,
});

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) { // Added next and updated logic if needed, but wait, usually next is needed if not async or if calling it explicitly. Async function doesn't need next unless error. Mongoose 5/6+ creates promise.
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire (10 minutes)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const User = mongoose.model('User', userSchema);
export default User;

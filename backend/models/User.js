import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
        // Password is required if googleId is not present
        required: function () { return !this.googleId; },
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
    },
    isVoted: {
        type: Boolean,
        default: false,
    },
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
    isApproved: {
        type: Boolean,
        default: false,
    },
    avatar: {
        type: String,
    }
}, {
    timestamps: true,
});

// Pre-save middleware to hash password
userSchema.pre('save', async function () {
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

const User = mongoose.model('User', userSchema);
export default User;

/**
 * Admin Model
 * Cleanly separated administrative collection.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't return password in queries by default
    },
    avatar: {
        type: String,
        default: '' // Cloudinary URL or empty
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    wardNo: {
        type: Number,
        required: [true, 'Ward is required'],
        min: [1, 'Ward number must be at least 1'],
        max: [9999, 'Ward number cannot exceed 4 digits']
    }
}, {
    timestamps: true
});

// ====================
// HASH PASSWORD BEFORE SAVE
// ====================
adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ====================
// COMPARE PASSWORD METHOD
// ====================
adminSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// ====================
// GENERATE JWT
// ====================
adminSchema.methods.generateJWT = function () {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
        { id: this._id, accountType: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

module.exports = mongoose.model('Admin', adminSchema);

/**
 * User Model
 * Supports two roles: 'citizen' and 'admin'
 * Points system for gamification leaderboard
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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
  points: {
    type: Number,
    default: 0 // Gamification score
  },
  wardNo: {
    type: String,
    trim: true,
    default: ''
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  pincode: {
    type: String,
    trim: true,
    default: ''
  },
  complaintsCount: {
    type: Number,
    default: 0
  },
  resolvedCount: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// ====================
// HASH PASSWORD BEFORE SAVE
// ====================
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ====================
// COMPARE PASSWORD METHOD
// ====================
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ====================
// GENERATE JWT
// ====================
userSchema.methods.generateJWT = function () {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { id: this._id, accountType: 'citizen' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

module.exports = mongoose.model('User', userSchema);

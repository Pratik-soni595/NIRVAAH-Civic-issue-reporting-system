/**
 * Auth Controller
 * Handles user registration, login, and profile retrieval
 */
const User = require("../models/User");
const Admin = require("../models/Admin");
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");

// In-memory OTP storage (Map: sessionId -> { otp, userId, expiresAt, attempts })
const otpStore = new Map();

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP

const sendEmailOTP = async (email, otp) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`\n\n---------------------------------`);
      console.log(`[DEMO MODE] No SMTP credentials.`);
      console.log(`OTP for ${email} is: ${otp}`);
      console.log(`---------------------------------\n\n`);
      return true;
    }
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    await transporter.sendMail({
      from: `"Nirvaah" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Nirvaah - Your Login OTP',
      text: `Your OTP for Nirvaah login is: ${otp}. It is valid for 5 minutes.`
    });
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

// Clean up expired OTPs periodically
setInterval(() => {
  const now = new Date();
  for (const [sessionId, data] of otpStore.entries()) {
    if (data.expiresAt < now) {
      otpStore.delete(sessionId);
      console.log(`[OTP] Cleaned up expired OTP for session ${sessionId}`);
    }
  }
}, 60000); // Clean every minute

// Helper to send token response
const sendTokenResponse = (user, statusCode, res, message = "Success", accountType = "citizen") => {
  const token = user.generateJWT();

  res.status(statusCode).json({
    success: true,
    message,
    token,
    accountType,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: accountType, // Legacy UI transition
      avatar: user.avatar,
      points: user.points,
      complaintsCount: user.complaintsCount,
    },
  });
};

// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, role, wardNo, address, pincode } = req.body;

    // Prevent self-assigning admin role without a secret
    const reqAccountType =
      role === "admin" && req.body.adminSecret === process.env.ADMIN_SECRET
        ? "admin"
        : "citizen";

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    const existingAdmin = await Admin.findOne({ email });
    if (existingUser || existingAdmin) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    let user;
    if (reqAccountType === "admin") {
      user = await Admin.create({
        name,
        email,
        password,
        wardNo: Number(wardNo),
        isActive: true,
      });
    } else {
      user = await User.create({ 
        name, email, password, 
        wardNo: wardNo || '', address: address || '', pincode: pincode || '', isVerified: true 
      });
    }

    sendTokenResponse(user, 201, res, "Account created successfully", reqAccountType);
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    let user = await Admin.findOne({ email }).select("+password");
    let accountType = "admin";

    if (!user) {
      user = await User.findOne({ email }).select("+password");
      accountType = "citizen";
    }

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res, "Logged in successfully", accountType);
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOtp = async (req, res, next) => {
  try {
    console.log("[OTP] sendOtp endpoint called", {
      path: req.path,
      body: req.body,
    });
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("[OTP] Validation error", errors.array());
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;
    console.log("[OTP] sendOtp request for", email);

    let user = await Admin.findOne({ email }).select("+password");
    let accountType = "admin";
    if (!user) {
      user = await User.findOne({ email }).select("+password");
      accountType = "citizen";
    }

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Generate OTP and session
    const code = generateOTP();
    const sessionId = `otp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store in memory
    otpStore.set(sessionId, {
      otp: code,
      userId: user._id,
      accountType,
      expiresAt,
      attempts: 0,
    });

    // Send email using nodemailer logic if configured
    await sendEmailOTP(email, code);

    // Log OTP to console (for development)
    console.log(
      `[OTP] Generated for ${email}: ${code} (Session: ${sessionId}, Expires: ${expiresAt.toISOString()})`,
    );

    res.status(200).json({ success: true, message: "OTP sent", sessionId });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res, next) => {
  try {
    console.log("[OTP] verifyOtp endpoint called", {
      path: req.path,
      body: req.body,
    });
    const { sessionId, otp } = req.body;
    if (!sessionId || !otp) {
      console.log("[OTP] verifyOtp missing fields", { sessionId, otp });
      return res
        .status(400)
        .json({ success: false, message: "Session ID and OTP are required" });
    }

    const otpData = otpStore.get(sessionId);
    if (!otpData) {
      console.log(`[OTP] Invalid session: ${sessionId}`);
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired session" });
    }

    if (otpData.expiresAt < new Date()) {
      otpStore.delete(sessionId);
      console.log(`[OTP] Expired OTP for session: ${sessionId}`);
      return res
        .status(410)
        .json({ success: false, message: "OTP expired", expired: true });
    }

    if (otpData.attempts >= 5) {
      otpStore.delete(sessionId);
      console.log(`[OTP] Too many attempts for session: ${sessionId}`);
      return res.status(403).json({
        success: false,
        message: "Too many OTP attempts. Request a new code.",
      });
    }

    if (otpData.otp !== otp.trim()) {
      otpData.attempts += 1;
      console.log(
        `[OTP] Invalid OTP attempt for session: ${sessionId} (attempt ${otpData.attempts})`,
      );
      return res.status(401).json({ success: false, message: "Invalid OTP" });
    }

    // OTP verified successfully
    otpStore.delete(sessionId);
    console.log(`[OTP] Verified successfully for session: ${sessionId}`);

    let user;
    if (otpData.accountType === "admin") {
      user = await Admin.findById(otpData.userId);
    } else {
      user = await User.findById(otpData.userId);
    }
    
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Complete login
    sendTokenResponse(user, 200, res, "OTP verified, logged in successfully", otpData.accountType);
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOtp = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res
        .status(400)
        .json({ success: false, message: "Session ID required" });
    }

    const otpData = otpStore.get(sessionId);
    if (!otpData) {
      console.log(`[OTP] Resend failed - invalid session: ${sessionId}`);
      return res
        .status(404)
        .json({ success: false, message: "OTP session not found" });
    }

    // Generate new OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Update in memory
    otpData.otp = code;
    otpData.expiresAt = expiresAt;
    otpData.attempts = 0;

    let user;
    if (otpData.accountType === "admin") {
      user = await Admin.findById(otpData.userId);
    } else {
      user = await User.findById(otpData.userId);
    }
    if (user) {
      await sendEmailOTP(user.email, code);
    }

    console.log(
      `[OTP] Resent for session ${sessionId}: ${code} (Expires: ${expiresAt.toISOString()})`,
    );

    res.status(200).json({ success: true, message: "OTP resent", sessionId });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/auth/me
// @access  Protected
exports.getMe = async (req, res, next) => {
  try {
    let user;
    if (req.accountType === "admin") {
      user = await Admin.findById(req.user.id);
    } else {
      user = await User.findById(req.user.id);
    }
    res.json({ success: true, user, accountType: req.accountType });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/auth/profile
// @access  Protected
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    let user;
    if (req.accountType === "admin") {
      user = await Admin.findByIdAndUpdate(
        req.user.id,
        { name, avatar },
        { new: true, runValidators: true },
      );
    } else {
      user = await User.findByIdAndUpdate(
        req.user.id,
        { name, avatar },
        { new: true, runValidators: true },
      );
    }
    res.json({ success: true, user, accountType: req.accountType });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/logout
// @access  Protected
// Note: JWT is stateless; client should delete token. Server-side blacklisting can be added.
exports.logout = async (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully. Please clear your token.",
  });
};

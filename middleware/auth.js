/**
 * JWT Authentication Middleware
 * Protects routes by verifying Bearer token
 */
const passport = require('passport');

/**
 * Middleware to verify JWT token using Passport JWT strategy
 * Attaches decoded user to req.user
 */
const protect = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Authentication error' });
    }
    if (!user) {
      return res.status(401).json({
        success: false,
        message: info?.message || 'Not authorized. Please log in.'
      });
    }
    req.user = user;
    // Robustly determine role
    // First try the passport 'info' which might carry the token payload's accountType
    // Then check Mongoose model name, and fallback to user properties
    req.accountType = info?.accountType ||
      (user.constructor.modelName === 'Admin' ? 'admin' : null) ||
      user?.accountType ||
      user?.role ||
      'citizen';

    // Ensure req.user.role exists (using a plain property assignment)
    // We modify the internal doc to avoid Mongoose stripping it
    req.user.role = req.accountType;
    if (req.user._doc) req.user._doc.role = req.accountType;
    next();
  })(req, res, next);
};

module.exports = { protect };

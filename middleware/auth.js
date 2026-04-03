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
    next();
  })(req, res, next);
};

module.exports = { protect };

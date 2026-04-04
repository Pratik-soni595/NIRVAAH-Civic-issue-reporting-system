/**
 * Role-based Access Control Middleware
 * Restricts routes to specific user roles
 */

/**
 * Admin guard middleware — must be used AFTER protect middleware
 */
const adminOnly = (req, res, next) => {
  if (req.accountType === 'admin' || (req.user && req.user.role === 'admin')) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Admin privileges required.'
  });
};

/**
 * Authorize specific roles
 * Usage: authorize('admin', 'moderator')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Role '${userRole}' is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { adminOnly, authorize };

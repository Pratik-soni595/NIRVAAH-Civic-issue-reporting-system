/**
 * Passport.js JWT Strategy Configuration
 * Verifies JWT tokens sent in Authorization header
 */
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { getCommissionerById } = require('../utils/commissionerAuth');

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

module.exports = (passport) => {
  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        const accountType = jwt_payload.accountType || (jwt_payload.role === 'admin' ? 'admin' : 'citizen');
        let user;
        if (accountType === 'commissioner') {
          user = getCommissionerById(jwt_payload.id);
        } else if (accountType === 'admin') {
          user = await Admin.findById(jwt_payload.id).select('-password');
        } else {
          user = await User.findById(jwt_payload.id).select('-password');
        }

        if (user) {
          return done(null, user, { accountType }); // User found — attach to req.user with info
        }
        return done(null, false); // User not found
      } catch (error) {
        return done(error, false);
      }
    })
  );
};

/**
 * Passport.js JWT Strategy Configuration
 * Verifies JWT tokens sent in Authorization header
 */
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User');

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

module.exports = (passport) => {
  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        const user = await User.findById(jwt_payload.id).select('-password');
        if (user) {
          return done(null, user); // User found — attach to req.user
        }
        return done(null, false); // User not found
      } catch (error) {
        return done(error, false);
      }
    })
  );
};

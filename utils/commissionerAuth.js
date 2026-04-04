const bcrypt = require("bcryptjs");
const commissionerConfig = require("../config/commissioner.json");

/**
 * Validates commissioner credentials against the config JSON.
 * @param {string} email
 * @param {string} password
 * @returns {Object|null} Commissioner object without password if match, else null
 */
exports.validateCommissionerLogin = async (email, password) => {
  if (email.toLowerCase() !== commissionerConfig.email.toLowerCase()) {
    return null;
  }

  const isMatch = await bcrypt.compare(password, commissionerConfig.passwordHash);
  if (!isMatch) {
    return null;
  }

  // Return a safe user-like object
  const { passwordHash, ...safeCommissioner } = commissionerConfig;
  return {
    ...safeCommissioner,
    _id: safeCommissioner.id // Map to Mongo-like _id for compatibility
  };
};

/**
 * Returns the commissioner object without the password if the given email matches.
 * Useful for OTP flows where the email is already verified or being requested.
 */
exports.getCommissionerByEmail = (email) => {
  if (email.toLowerCase() !== commissionerConfig.email.toLowerCase()) {
    return null;
  }
  const { passwordHash, ...safeCommissioner } = commissionerConfig;
  return {
    ...safeCommissioner,
    _id: safeCommissioner.id
  };
};

/**
 * Returns the commissioner object by ID (useful for JWT payload resolution).
 */
exports.getCommissionerById = (id) => {
  if (id !== commissionerConfig.id) {
    return null;
  }
  const { passwordHash, ...safeCommissioner } = commissionerConfig;
  return {
    ...safeCommissioner,
    _id: safeCommissioner.id
  };
};

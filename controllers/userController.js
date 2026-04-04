/**
 * User Controller
 * Leaderboard and user profile management
 */
const User = require('../models/User');
const Complaint = require('../models/Complaint');

// @route   GET /api/users/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res, next) => {
  try {
    const leaderboard = await User.find({})
      .select('name avatar points complaintsCount resolvedCount createdAt')
      .sort({ points: -1 })
      .limit(20);

    res.json({
      success: true,
      leaderboard: leaderboard.map((user, index) => ({
        rank: index + 1,
        ...user.toObject()
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/users/profile/:id
// @access  Public
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const complaints = await Complaint.find({ user: req.params.id })
      .select('title category status createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({ success: true, user, recentComplaints: complaints });
  } catch (error) {
    next(error);
  }
};

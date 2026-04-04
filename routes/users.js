/**
 * User Routes
 * GET /api/users/leaderboard     - Public leaderboard
 * GET /api/users/profile/:id     - Public user profile
 */
const express = require('express');
const router = express.Router();
const { getLeaderboard, getProfile } = require('../controllers/userController');

router.get('/leaderboard', getLeaderboard);
router.get('/profile/:id', getProfile);

module.exports = router;

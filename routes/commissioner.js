const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { commissionerOnly } = require('../middleware/admin');
const Complaint = require('../models/Complaint');
const Admin = require('../models/Admin');

// Secure all endpoints beneath this route for commissioner only
router.use(protect);
router.use(commissionerOnly);

// @route   GET /api/commissioner/escalations
router.get('/escalations', async (req, res, next) => {
  try {
    const now = new Date();
    const escalations = await Complaint.find({
      status: { $in: ['pending', 'approved', 'in_progress'] },
      $or: [
        { level: { $gt: 1 } },
        { deadline: { $lte: now } }
      ]
    })
      .populate('user', 'name email address')
      .sort({ level: -1, deadline: 1 })
      .lean();

    res.json({ success: true, escalations });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/commissioner/admin-list
router.get('/admin-list', async (req, res, next) => {
  try {
    // In future this can enrich admin docs with performance metrics
    const admins = await Admin.find().select('-password').lean();
    
    // Add dummy or inferred stats for performance
    const enhancedAdmins = admins.map(a => ({
      ...a,
      tasksHandled: 0,
      activeTasks: 0,
    }));
    
    res.json({ success: true, admins: enhancedAdmins });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/commissioner/resolved-escalations
router.get('/resolved-escalations', async (req, res, next) => {
  try {
    const escalations = await Complaint.find({
      status: 'resolved',
      level: { $gt: 1 }
    })
      .populate('user', 'name email')
      .sort({ resolvedAt: -1 })
      .lean();

    res.json({ success: true, escalations });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

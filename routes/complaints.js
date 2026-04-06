/**
 * Complaint Routes
 * GET    /api/complaints           - List all complaints
 * POST   /api/complaints           - Create new complaint (protected)
 * GET    /api/complaints/map       - Get all complaints for map markers
 * GET    /api/complaints/my        - Get current user's complaints (protected)
 * GET    /api/complaints/:id       - Get single complaint
 * POST   /api/complaints/:id/vote  - Toggle vote (protected)
 * DELETE /api/complaints/:id       - Delete complaint (owner or admin)
 *
 * ── TRS (Transparent Resolution System) ──
 * POST   /api/complaints/:id/resolution          - Submit resolution evidence (admin, mobile)
 * PATCH  /api/complaints/:id/resolution/review   - Supervisor review (admin)
 * GET    /api/complaints/:id/resolution/public   - Public evidence read (no auth)
 */
const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getMapComplaints,
  getMyComplaints,
  getComplaintById,
  voteComplaint,
  deleteComplaint
} = require('../controllers/complaintController');
const {
  submitResolution,
  reviewResolution,
  getPublicResolution,
} = require('../controllers/resolutionController');
const { submitFeedback, getFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const upload = require('../middleware/upload');
const { uploadResolution } = require('../middleware/upload');

// ── Existing complaint routes ─────────────────────────────────────────────
router.get('/map', getMapComplaints);
router.get('/my', protect, getMyComplaints);
router.get('/', getComplaints);
router.post('/', protect, upload.array('images', 5), createComplaint);
router.get('/:id', getComplaintById);
router.post('/:id/vote', protect, voteComplaint);
router.delete('/:id', protect, deleteComplaint);

// ── Citizen feedback routes ───────────────────────────────────────────────
router.get('/:id/feedback', protect, getFeedback);
router.post('/:id/feedback', protect, submitFeedback);

// ── TRS routes ────────────────────────────────────────────────────────────
// Public: citizen reads published resolution evidence (no auth)
router.get('/:id/resolution/public', getPublicResolution);

// Admin: submit resolution evidence (camera + GPS, mobile only)
router.post(
  '/:id/resolution',
  protect,
  adminOnly,
  uploadResolution.single('image'),
  submitResolution,
);

// Admin: supervisor reviews a suspicious resolution
router.patch(
  '/:id/resolution/review',
  protect,
  adminOnly,
  reviewResolution,
);

module.exports = router;

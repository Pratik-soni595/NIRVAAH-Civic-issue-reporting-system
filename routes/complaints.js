/**
 * Complaint Routes
 * GET    /api/complaints           - List all complaints
 * POST   /api/complaints           - Create new complaint (protected)
 * GET    /api/complaints/map       - Get all complaints for map markers
 * GET    /api/complaints/my        - Get current user's complaints (protected)
 * GET    /api/complaints/:id       - Get single complaint
 * POST   /api/complaints/:id/vote  - Toggle vote (protected)
 * DELETE /api/complaints/:id       - Delete complaint (owner or admin)
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
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/map', getMapComplaints);
router.get('/my', protect, getMyComplaints);
router.get('/', getComplaints);
router.post('/', protect, upload.array('images', 5), createComplaint);
router.get('/:id', getComplaintById);
router.post('/:id/vote', protect, voteComplaint);
router.delete('/:id', protect, deleteComplaint);

module.exports = router;

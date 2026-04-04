/**
 * Notification Routes
 * GET   /api/notifications             - Get user notifications
 * PATCH /api/notifications/read-all   - Mark all as read
 * PATCH /api/notifications/:id/read   - Mark one as read
 */
const express = require('express');
const router = express.Router();
const { getNotifications, markRead, markAllRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect); // All notification routes require auth

router.get('/', getNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);

module.exports = router;

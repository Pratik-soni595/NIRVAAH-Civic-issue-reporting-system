/**
 * Notification Controller
 * Handles in-app notification retrieval and read status
 */
const Notification = require('../models/Notification');

// @route   GET /api/notifications
// @access  Protected
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .populate('complaint', 'title category status')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ user: req.user.id, read: false });

    res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/notifications/:id/read
// @access  Protected
exports.markRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/notifications/read-all
// @access  Protected
exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

/**
 * Utility: Create and emit a notification
 * Called internally from other controllers (not a route handler)
 */
exports.createNotification = async ({ userId, title, message, type, complaintId }) => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      complaint: complaintId || null
    });

    // Emit real-time notification via Socket.io if available
    if (global.io) {
      global.io.to(userId.toString()).emit('notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
  }
};

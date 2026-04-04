/**
 * Priority Service
 * Modular service for vote-based priority assignment and deadline management
 * Independent of main complaint logic
 */
const Complaint = require("../models/Complaint");
const { createNotification } = require("../controllers/notificationController");

class PriorityService {
  // Priority thresholds
  static PRIORITY_THRESHOLDS = {
    high: 10,
    medium: 5,
    low: 0,
  };

  // Time limits in days
  static TIME_LIMITS = {
    high: 2,
    medium: 5,
    low: 7,
  };

  // Status transition rules
  static VALID_TRANSITIONS = {
    pending: ["approved"],
    approved: ["in_progress"],
    in_progress: ["resolved"],
    resolved: [],
  };

  /**
   * Calculate priority based on vote count
   */
  static calculatePriority(voteCount) {
    if (voteCount >= this.PRIORITY_THRESHOLDS.high) return "high";
    if (voteCount >= this.PRIORITY_THRESHOLDS.medium) return "medium";
    return "low";
  }

  /**
   * Calculate deadline based on priority
   */
  static calculateDeadline(createdAt, priority) {
    const days = this.TIME_LIMITS[priority];
    const deadline = new Date(createdAt);
    deadline.setDate(deadline.getDate() + days);
    return deadline;
  }

  /**
   * Update priority and deadline for a complaint
   */
  static async updatePriorityAndDeadline(complaintId) {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return;

    const newPriority = this.calculatePriority(complaint.voteCount);
    const newDeadline = this.calculateDeadline(
      complaint.createdAt,
      newPriority,
    );

    // Only update if changed
    if (
      complaint.priority !== newPriority ||
      !complaint.deadline ||
      complaint.deadline.getTime() !== newDeadline.getTime()
    ) {
      complaint.priority = newPriority;
      complaint.deadline = newDeadline;
      await complaint.save();

      // Notify admin of priority change
      await this.notifyAdminPriorityChange(complaint);
    }
  }

  /**
   * Check for overdue complaints and escalate
   */
  static async checkAndEscalateOverdue() {
    const now = new Date();
    const overdueComplaints = await Complaint.find({
      status: { $in: ["approved", "in_progress"] },
      deadline: { $lt: now },
    });

    for (const complaint of overdueComplaints) {
      await this.escalateComplaint(complaint);
    }
  }

  /**
   * Escalate complaint to next level
   */
  static async escalateComplaint(complaint) {
    if (complaint.level >= 3) return; // Max level

    complaint.level += 1;
    await complaint.save();

    // Notify admin of escalation
    await this.notifyAdminEscalation(complaint);
  }

  /**
   * Update status with validation
   */
  static async updateStatus(complaintId, newStatus, adminId, note = "") {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      throw new Error("Complaint not found");
    }

    // Validate transition
    if (!this.VALID_TRANSITIONS[complaint.status].includes(newStatus)) {
      throw new Error(
        `Invalid status transition from ${complaint.status} to ${newStatus}`,
      );
    }

    const oldStatus = complaint.status;
    complaint.status = newStatus;

    // Set timestamps
    const now = new Date();
    if (newStatus === "approved") complaint.approvedAt = now;
    else if (newStatus === "in_progress") complaint.inProgressAt = now;
    else if (newStatus === "resolved") complaint.resolvedAt = now;

    // Add to status history
    complaint.statusHistory.push({
      status: newStatus,
      changedBy: adminId,
      note,
      timestamp: now,
    });

    await complaint.save();

    // Notify relevant parties
    await this.notifyStatusChange(complaint, oldStatus, newStatus);

    return complaint;
  }

  /**
   * Get complaints for priority dashboard
   */
  static async getPriorityDashboard(filters = {}) {
    const query = {};

    if (filters.priority) query.priority = filters.priority;
    if (filters.status) query.status = filters.status;
    if (filters.overdue) {
      query.deadline = { $lt: new Date() };
      query.status = { $in: ["approved", "in_progress"] };
    }

    const complaints = await Complaint.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .lean();

    // Add computed fields
    const now = new Date();
    complaints.forEach((complaint) => {
      if (complaint.deadline) {
        const timeLeft = complaint.deadline - now;
        complaint.timeLeftMs = timeLeft;
        complaint.isOverdue = timeLeft < 0;
        complaint.daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
      } else {
        complaint.timeLeftMs = null;
        complaint.isOverdue = false;
        complaint.daysLeft = null;
      }
    });

    return complaints;
  }

  /**
   * Notification helpers
   */
  static async notifyAdminPriorityChange(complaint) {
    // Find all admins
    const User = require("../models/User");
    const admins = await User.find({ role: "admin" });

    for (const admin of admins) {
      await createNotification({
        userId: admin._id,
        title: "Complaint Priority Updated",
        message: `Complaint "${complaint.title}" priority changed to ${complaint.priority.toUpperCase()}. Deadline: ${complaint.deadline.toDateString()}`,
        type: "priority_change",
        complaintId: complaint._id,
      });
    }
  }

  static async notifyAdminEscalation(complaint) {
    const User = require("../models/User");
    const admins = await User.find({ role: "admin" });

    for (const admin of admins) {
      await createNotification({
        userId: admin._id,
        title: "Complaint Escalated",
        message: `Complaint "${complaint.title}" has been escalated to Level ${complaint.level} due to deadline exceedance.`,
        type: "escalation",
        complaintId: complaint._id,
      });
    }
  }

  static async notifyStatusChange(complaint, oldStatus, newStatus) {
    // Notify complaint owner
    await createNotification({
      userId: complaint.user,
      title: "Complaint Status Updated",
      message: `Your complaint "${complaint.title}" status changed from ${oldStatus} to ${newStatus}.`,
      type: "status_change",
      complaintId: complaint._id,
    });

    // Notify admins
    const User = require("../models/User");
    const admins = await User.find({ role: "admin" });

    for (const admin of admins) {
      await createNotification({
        userId: admin._id,
        title: "Complaint Status Updated",
        message: `Complaint "${complaint.title}" status changed to ${newStatus}.`,
        type: "admin_status_update",
        complaintId: complaint._id,
      });
    }
  }

  /**
   * Initialize service - set up cron job for escalation checks
   */
  static init() {
    // Check for overdue complaints is now managed by adminPriorityModuleScheduler.js
    // Left empty to prevent duplicate triggers.
  }
}

module.exports = PriorityService;

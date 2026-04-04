const Complaint = require("../models/Complaint");
const PriorityWorkflow = require("../models/PriorityWorkflow");
const User = require("../models/User");
const { createNotification } = require("../controllers/notificationController");
const PriorityService = require("./priorityService");

const STATUS_TRANSITIONS = {
  pending: ["approved"],
  approved: ["in_progress"],
  in_progress: ["resolved"],
  resolved: [],
};

const DAY_MS = 24 * 60 * 60 * 1000;

function deriveCountdownMeta(deadline) {
  const now = Date.now();
  const remainingMs = new Date(deadline).getTime() - now;
  const isOverdue = remainingMs < 0;
  const hoursLeft = Math.ceil(remainingMs / (60 * 60 * 1000));
  const color = isOverdue ? "red" : hoursLeft <= 24 ? "yellow" : "green";
  return { remainingMs, isOverdue, hoursLeft, color };
}

async function ensureWorkflow(complaintId) {
  let workflow = await PriorityWorkflow.findOne({ complaint: complaintId });
  if (!workflow) {
    workflow = await PriorityWorkflow.create({
      complaint: complaintId,
      status: "pending",
      level: 1,
    });
  }
  return workflow;
}

async function notifyAdmins(title, message, complaintId, type) {
  const admins = await User.find({ role: "admin" }).select("_id");
  await Promise.all(
    admins.map((admin) =>
      createNotification({
        userId: admin._id,
        title,
        message,
        type,
        complaintId,
      }),
    ),
  );
}

exports.listDashboard = async ({ priority, status, overdue }) => {
  const complaints = await Complaint.find({})
    .select("title category location voteCount createdAt")
    .sort({ createdAt: -1 })
    .lean();

  const complaintIds = complaints.map((c) => c._id);
  const workflows = await PriorityWorkflow.find({
    complaint: { $in: complaintIds },
  }).lean();
  const workflowMap = new Map(workflows.map((w) => [String(w.complaint), w]));

  const items = complaints.map((c) => {
    const workflow = workflowMap.get(String(c._id)) || {
      status: "pending",
      level: 1,
    };
    const computedPriority = PriorityService.calculatePriority(c.voteCount || 0);
    const deadline = PriorityService.calculateDeadline(c.createdAt, computedPriority);
    const countdown = deriveCountdownMeta(deadline);

    return {
      complaintId: c._id,
      title: c.title,
      category: c.category,
      location: c.location,
      votes: c.voteCount || 0,
      priority: computedPriority,
      deadline,
      status: workflow.status,
      level: workflow.level,
      approvedAt: workflow.approvedAt || null,
      inProgressAt: workflow.inProgressAt || null,
      resolvedAt: workflow.resolvedAt || null,
      createdAt: c.createdAt,
      countdown,
      timeline: {
        createdAt: c.createdAt,
        approvedAt: workflow.approvedAt || null,
        inProgressAt: workflow.inProgressAt || null,
        resolvedAt: workflow.resolvedAt || null,
      },
    };
  });

  return items.filter((item) => {
    if (priority && item.priority !== priority) return false;
    if (status && item.status !== status) return false;
    if (String(overdue) === "true" && !item.countdown.isOverdue) return false;
    return true;
  });
};

exports.updateStatus = async ({ complaintId, status, adminId, note = "" }) => {
  const complaint =
    await Complaint.findById(complaintId).select("_id title user");
  if (!complaint) throw new Error("Complaint not found");

  const workflow = await ensureWorkflow(complaintId);
  const validNext = STATUS_TRANSITIONS[workflow.status] || [];
  if (!validNext.includes(status)) {
    throw new Error(`Invalid transition: ${workflow.status} -> ${status}`);
  }

  workflow.status = status;
  const now = new Date();
  if (status === "approved") workflow.approvedAt = now;
  if (status === "in_progress") workflow.inProgressAt = now;
  if (status === "resolved") workflow.resolvedAt = now;
  await workflow.save();

  await notifyAdmins(
    "Priority Workflow Updated",
    `Complaint \"${complaint.title}\" moved to ${status.replace("_", " ")}. ${note || ""}`,
    complaint._id,
    "priority_workflow_status",
  );

  return workflow;
};

exports.runEscalation = async () => {
  const items = await exports.listDashboard({});
  const overdue = items.filter(
    (i) => i.countdown.isOverdue && i.status !== "resolved" && i.level < 3,
  );

  for (const item of overdue) {
    const workflow = await ensureWorkflow(item.complaintId);
    if (workflow.level < 3) {
      workflow.level += 1;
      workflow.lastEscalatedAt = new Date();
      await workflow.save();

      await notifyAdmins(
        "Deadline Escalation Triggered",
        `Complaint \"${item.title}\" escalated to Level ${workflow.level}.`,
        item.complaintId,
        "priority_workflow_escalation",
      );
    }
  }

  return { escalatedCount: overdue.length };
};

exports.sendDeadlineAlerts = async () => {
  const items = await exports.listDashboard({});
  const nearDeadline = items.filter(
    (i) =>
      !i.countdown.isOverdue &&
      i.countdown.hoursLeft <= 24 &&
      i.status !== "resolved",
  );

  await Promise.all(
    nearDeadline.map((item) =>
      notifyAdmins(
        "Deadline Near",
        `Complaint \"${item.title}\" is nearing deadline (${item.countdown.hoursLeft}h left).`,
        item.complaintId,
        "priority_workflow_deadline",
      ),
    ),
  );

  return { nearDeadlineCount: nearDeadline.length };
};

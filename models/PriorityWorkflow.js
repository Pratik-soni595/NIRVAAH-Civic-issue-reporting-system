const mongoose = require("mongoose");

const priorityWorkflowSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "in_progress", "resolved"],
      default: "pending",
      index: true,
    },
    level: {
      type: Number,
      min: 1,
      max: 3,
      default: 1,
    },
    approvedAt: Date,
    inProgressAt: Date,
    resolvedAt: Date,
    lastEscalatedAt: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("PriorityWorkflow", priorityWorkflowSchema);

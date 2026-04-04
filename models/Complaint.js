/**
 * Complaint Model
 * Core data model for civic issue reports
 * Supports geospatial queries for nearby complaint detection
 */
const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "pothole",
        "garbage",
        "water_leakage",
        "electricity",
        "road_damage",
        "street_light",
        "sewage",
        "tree_hazard",
        "graffiti",
        "other",
      ],
    },
    aiSuggestedCategory: {
      type: String,
      default: null, // Populated by AI image analysis
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    priorityScore: {
      type: Number,
      default: 0, // Computed: votes + severity + location bonus
    },
    images: [
      {
        url: String,
        publicId: String, // Cloudinary public ID for deletion
      },
    ],
    // GeoJSON Point for geospatial queries
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: String,
      landmark: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    votes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    voteCount: {
      type: Number,
      default: 0,
    },
    // Duplicate detection
    isDuplicate: {
      type: Boolean,
      default: false,
    },
    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      default: null,
    },
    // Status history for timeline view
    statusHistory: [
      {
        status: String,
        changedByModel: {
          type: String,
          enum: ["User", "Admin"],
          default: "User",
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "statusHistory.changedByModel",
        },
        note: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    resolvedAt: Date,
    adminNote: String,
  },
  {
    timestamps: true,
  },
);

// ====================
// INDEXES
// ====================
// 2dsphere index for geospatial queries (nearby complaints)
complaintSchema.index({ location: "2dsphere" });
complaintSchema.index({ status: 1, category: 1 });
complaintSchema.index({ user: 1 });
complaintSchema.index({ createdAt: -1 });

// ====================
// PRIORITY SCORE COMPUTATION
// ====================
complaintSchema.methods.computePriorityScore = function () {
  const severityMap = { low: 1, medium: 2, high: 3, critical: 5 };
  const statusBonus = this.status === "pending" ? 2 : 0;
  this.priorityScore =
    this.voteCount * 2 + severityMap[this.priority] * 10 + statusBonus;
  return this.priorityScore;
};

module.exports = mongoose.model("Complaint", complaintSchema);

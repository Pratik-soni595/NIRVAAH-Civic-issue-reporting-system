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
      default: null,
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
      default: 0,
    },
    deadline: {
      type: Date,
      default: null,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
      max: 3,
    },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
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
    isDuplicate: {
      type: Boolean,
      default: false,
    },
    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      default: null,
    },
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

    // ─────────────────────────────────────────────────────
    // TRANSPARENT RESOLUTION SYSTEM (TRS) — WRITE-ONCE
    // Once submittedAt is set this sub-document is immutable.
    // ─────────────────────────────────────────────────────
    resolutionEvidence: {
      // Cloudinary-hosted resolution photo
      imageUrl:      { type: String, default: null },
      imagePublicId: { type: String, default: null },
      imageHash:     { type: String, default: null }, // SHA-256 hex

      // Server-injected timestamp — any client-provided value is discarded
      submittedAt:   { type: Date, default: null },

      // GPS at moment of capture (client-provided, server-validated)
      captureLocation: {
        lat:       { type: Number, default: null },
        lng:       { type: Number, default: null },
        accuracyM: { type: Number, default: null },
      },

      // Haversine validation result
      distanceFromOriginM: { type: Number, default: null },
      isSuspicious:        { type: Boolean, default: false },
      suspicionReason: {
        type: String,
        enum: ["DISTANCE_EXCEEDED", "NO_ORIGIN_COORDINATES", "LOW_ACCURACY", null],
        default: null,
      },

      // Supervisor review (only populated for suspicious submissions)
      supervisorReview: {
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
        reviewedAt: { type: Date, default: null },
        decision:   { type: String, enum: ["approved", "rejected", null], default: null },
        notes:      { type: String, default: null },
      },

      // Audit trail fields
      submittedBy:   { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
      submitterRole: { type: String, default: null },
      userAgent:     { type: String, default: null },
      notes:         { type: String, default: null },
    },
  },
  {
    timestamps: true,
  },
);

// ====================
// INDEXES
// ====================
complaintSchema.index({ location: "2dsphere" });
complaintSchema.index({ status: 1, category: 1 });
complaintSchema.index({ user: 1 });
complaintSchema.index({ createdAt: -1 });

// ====================
// TRS IMMUTABILITY GUARD
// Once resolutionEvidence.submittedAt is written, block any further
// modification to that field via the Mongoose save path.
// The controller also uses an atomic $exists guard as the primary defence.
// ====================
complaintSchema.pre("save", function (next) {
  if (!this.isNew && this.isModified("resolutionEvidence.submittedAt")) {
    const err = new Error("resolutionEvidence is immutable after first submission");
    err.statusCode = 409;
    return next(err);
  }
  next();
});

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

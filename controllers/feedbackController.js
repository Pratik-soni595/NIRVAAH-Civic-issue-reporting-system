const Complaint = require("../models/Complaint");

exports.submitFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment, isSatisfied } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Valid rating (1-5) is required." });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found." });
    }

    if (complaint.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to submit feedback for this complaint." });
    }

    if (complaint.status !== "resolved") {
      return res.status(400).json({ success: false, message: "Complaint must be resolved to submit feedback." });
    }

    if (!complaint.resolutionEvidence || !complaint.resolutionEvidence.submittedAt) {
      return res.status(400).json({ success: false, message: "TRS resolution evidence is missing." });
    }

    const now = new Date();

    const updated = await Complaint.findOneAndUpdate(
      { 
        _id: id,
        $or: [
          { "resolutionFeedback.submittedAt": { $exists: false } },
          { "resolutionFeedback.submittedAt": null }
        ]
      },
      {
        $set: {
          resolutionFeedback: {
            rating: parseInt(rating),
            comment: comment ? String(comment).trim().slice(0, 500) : null,
            isSatisfied: Boolean(isSatisfied),
            submittedAt: now,
            updatedAt: now,
            submittedBy: req.user.id
          }
        }
      },
      { new: true }
    );

    if (!updated) {
      return res.status(409).json({ success: false, message: "Feedback has already been submitted for this resolution." });
    }

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully.",
      feedback: updated.resolutionFeedback
    });
  } catch (error) {
    next(error);
  }
};

exports.getFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const complaint = await Complaint.findById(id).select("user resolutionFeedback");
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found." });
    }

    if (complaint.user.toString() !== req.user.id && req.accountType !== "admin" && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to read feedback for this complaint." });
    }

    if (!complaint.resolutionFeedback || !complaint.resolutionFeedback.submittedAt) {
      return res.status(404).json({ success: false, message: "No feedback found." });
    }

    res.json({
      success: true,
      feedback: complaint.resolutionFeedback
    });
  } catch (error) {
    next(error);
  }
};

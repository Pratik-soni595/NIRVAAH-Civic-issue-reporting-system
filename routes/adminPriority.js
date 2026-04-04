const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/admin");
const {
  getDashboard,
  patchStatus,
  runEscalation,
  runDeadlineAlerts,
} = require("../controllers/adminPriorityModuleController");

router.use(protect, adminOnly);

router.get("/dashboard", getDashboard);
router.patch("/:complaintId/status", patchStatus);
router.post("/jobs/escalation", runEscalation);
router.post("/jobs/deadline-alerts", runDeadlineAlerts);

module.exports = router;

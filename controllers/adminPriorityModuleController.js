const service = require("../services/adminPriorityModuleService");

exports.getDashboard = async (req, res, next) => {
  try {
    const { priority, status, overdue } = req.query;
    const complaints = await service.listDashboard({
      priority,
      status,
      overdue,
    });
    res.json({ success: true, complaints });
  } catch (error) {
    next(error);
  }
};

exports.patchStatus = async (req, res, next) => {
  try {
    const workflow = await service.updateStatus({
      complaintId: req.params.complaintId,
      status: req.body.status,
      adminId: req.user.id,
      note: req.body.note || "",
    });
    res.json({ success: true, workflow });
  } catch (error) {
    res
      .status(400)
      .json({
        success: false,
        message: error.message || "Failed to update status",
      });
  }
};

exports.runEscalation = async (req, res, next) => {
  try {
    const result = await service.runEscalation();
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

exports.runDeadlineAlerts = async (req, res, next) => {
  try {
    const result = await service.sendDeadlineAlerts();
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

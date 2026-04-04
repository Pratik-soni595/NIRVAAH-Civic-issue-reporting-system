const service = require("./adminPriorityModuleService");

let started = false;

exports.start = () => {
  if (started) return;
  started = true;

  // Escalation checker every 10 minutes
  setInterval(
    () => {
      service.runEscalation().catch(() => {});
    },
    10 * 60 * 1000,
  );

  // Near-deadline alerts every 30 minutes
  setInterval(
    () => {
      service.sendDeadlineAlerts().catch(() => {});
    },
    30 * 60 * 1000,
  );
};

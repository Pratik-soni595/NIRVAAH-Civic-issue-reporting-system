/**
 * Nodemailer transport setup (for OTP delivery)
 */
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.example.com",
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "user@example.com",
    pass: process.env.SMTP_PASS || "yourpassword",
  },
});

transporter
  .verify()
  .then(() => {
    console.log("✅ Email transporter is ready");
  })
  .catch((err) => {
    console.warn("⚠️ Email transporter could not verify:", err.message);
  });

module.exports = transporter;

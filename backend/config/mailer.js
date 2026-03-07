const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("[Mailer] ✗ Transporter verification failed:", error.message);
  } else {
    console.log("[Mailer] ✓ SMTP configured successfully - Ready to send emails");
    console.log(`[Mailer] Using account: ${process.env.MAIL_USER}`);
  }
});

module.exports = transporter;

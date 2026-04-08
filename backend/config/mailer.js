if (process.env.BREVO_API_KEY) {
  console.log("[Mailer] ✓ Brevo configured successfully");
} else {
  console.error("[Mailer] ✗ BREVO_API_KEY missing");
}

module.exports = {};

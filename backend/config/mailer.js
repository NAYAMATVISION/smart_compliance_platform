const Brevo = require("@getbrevo/brevo");

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.authentications["apiKey"].apiKey = process.env.BREVO_API_KEY;

if (process.env.BREVO_API_KEY) {
  console.log("[Mailer] ✓ Brevo configured successfully");
} else {
  console.error("[Mailer] ✗ BREVO_API_KEY missing");
}

module.exports = apiInstance;

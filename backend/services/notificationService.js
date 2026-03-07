const User = require("../models/User");
const transporter = require("../config/mailer");

const notifyAdminDocumentChange = async ({ organisationId, user, documentName, action }) => {
  try {
    const admins = await User.find({ 
      organizationId: organisationId, 
      role: "admin" 
    });

    if (admins.length === 0) {
      console.log("[Notification] No admins found for organization");
      return;
    }

    const actionText = action.replace(/_/g, " ");
    const timestamp = new Date().toLocaleString();

    const mailOptions = {
      from: process.env.MAIL_USER,
      subject: "Document Change Alert",
      html: `
        <h3>Document Change Alert</h3>
        <p><strong>Employee:</strong> ${user.name}</p>
        <p><strong>Action:</strong> ${actionText}</p>
        <p><strong>Document:</strong> ${documentName}</p>
        <p><strong>Time:</strong> ${timestamp}</p>
      `
    };

    const emailPromises = admins.map(admin => {
      return transporter.sendMail({
        ...mailOptions,
        to: admin.email
      });
    });

    await Promise.all(emailPromises);
    console.log(`[Notification] Admin alerts sent for ${action} on ${documentName}`);
  } catch (error) {
    console.error("[Notification] Error sending admin notification:", error);
  }
};

module.exports = {
  notifyAdminDocumentChange
};

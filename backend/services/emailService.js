const Brevo = require("@getbrevo/brevo");
const apiInstance = require("../config/mailer");

const FROM_EMAIL = process.env.MAIL_USER || "nayamatemeet@gmail.com";
const FROM_NAME = "Compliance System";

const sendEmail = async (to, subject, html) => {
  const sendSmtpEmail = new Brevo.SendSmtpEmail();
  sendSmtpEmail.sender = { name: FROM_NAME, email: FROM_EMAIL };
  sendSmtpEmail.to = [{ email: to }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = html;
  await apiInstance.sendTransacEmail(sendSmtpEmail);
};

/**
 * Send overdue tasks summary email to admin
 */
const sendOverdueTasksSummaryEmail = async (adminEmail, overdueTasks) => {
  try {
    if (!overdueTasks || overdueTasks.length === 0) {
      console.log("[Email Service] No overdue tasks to report - skipping email");
      return { sent: false, reason: "No tasks" };
    }

    const taskRows = overdueTasks
      .map((task) => {
        const daysOverdue = Math.ceil(
          (new Date() - new Date(task.dueDate)) / (1000 * 60 * 60 * 24)
        );
        const dueDate = new Date(task.dueDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric"
        });
        return `
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px;">${task.title || "N/A"}</td>
            <td style="padding: 8px;">${task.category || "General"}</td>
            <td style="padding: 8px;">${dueDate}</td>
            <td style="padding: 8px; color: red; font-weight: bold;">${daysOverdue} days</td>
          </tr>
        `;
      })
      .join("");

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h2 style="color: #333;">⚠️ Daily Overdue Tasks Report</h2>
        <p style="color: #666; font-size: 14px;">
          Generated: ${new Date().toLocaleString("en-US")}
        </p>
        
        <p style="color: #333; margin: 20px 0;">
          <strong>${overdueTasks.length}</strong> task(s) are currently overdue and require immediate attention.
        </p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f9f9f9;">
          <thead>
            <tr style="background-color: #e53e3e; color: white;">
              <th style="padding: 10px; text-align: left;">Task Name</th>
              <th style="padding: 10px; text-align: left;">Category</th>
              <th style="padding: 10px; text-align: left;">Due Date</th>
              <th style="padding: 10px; text-align: left;">Days Overdue</th>
            </tr>
          </thead>
          <tbody>
            ${taskRows}
          </tbody>
        </table>

        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #856404;">
            <strong>Action Required:</strong> Please review these overdue tasks and ensure evidence is uploaded and tasks are marked complete in the compliance dashboard.
          </p>
        </div>

        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This is an automated email from the Compliance System. Please do not reply.
        </p>
      </div>
    `;

    await sendEmail(adminEmail, `⚠️ Daily Overdue Tasks Report - ${overdueTasks.length} task(s) overdue`, htmlContent);
    console.log(`[Email Service] ✓ Overdue tasks summary email sent to ${adminEmail}`);
    return { sent: true, taskCount: overdueTasks.length };
  } catch (error) {
    console.error(`[Email Service] ✗ Failed to send overdue tasks email: ${error.message}`);
    throw error;
  }
};

/**
 * Send new business profile created notification email
 */
const sendNewProfileNotificationEmail = async (adminEmail, profileData) => {
  try {
    const createdAt = new Date(profileData.createdAt).toLocaleString("en-US");

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h2 style="color: #333;">✅ New Business Profile Created</h2>
        
        <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>Company Name:</strong> ${profileData.legalName || "N/A"}</p>
          <p style="margin: 10px 0;"><strong>Industry:</strong> ${profileData.industry || "N/A"}</p>
          <p style="margin: 10px 0;"><strong>Company Size:</strong> ${profileData.employeeCountRange || "N/A"}</p>
          <p style="margin: 10px 0;"><strong>Entity Type:</strong> ${profileData.entityType || "N/A"}</p>
          <p style="margin: 10px 0;"><strong>Headquarters:</strong> ${profileData.headquartersCountry || "N/A"}</p>
          <p style="margin: 10px 0;"><strong>Created At:</strong> ${createdAt}</p>
        </div>

        <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #2e7d32;">
            A new business profile has been successfully registered in the system. Tasks have been automatically generated based on the profile configuration.
          </p>
        </div>

        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This is an automated email from the Compliance System. Please do not reply.
        </p>
      </div>
    `;

    await sendEmail(adminEmail, `✅ New Business Profile Created - ${profileData.legalName}`, htmlContent);
    console.log(`[Email Service] ✓ New profile notification email sent to ${adminEmail}`);
    return { sent: true };
  } catch (error) {
    console.error(`[Email Service] ✗ Failed to send new profile email: ${error.message}`);
    throw error;
  }
};

/**
 * Send test email
 */
const sendTestEmail = async (toEmail) => {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4caf50;">✓ Email System Test Successful</h2>
        <p style="color: #333; margin: 20px 0;">
          This is a test email to verify that the email notification system is working correctly.
        </p>
        <p style="color: #666;">
          If you received this email, the mail transporter is configured correctly and ready to send notifications.
        </p>
        <p style="margin-top: 30px; color: #999; font-size: 12px;">
          Sent: ${new Date().toLocaleString("en-US")}
        </p>
      </div>
    `;

    await sendEmail(toEmail, "Test Email - Compliance System", htmlContent);
    console.log(`[Email Service] ✓ Test email sent to ${toEmail}`);
    return { sent: true, message: "Test email sent successfully" };
  } catch (error) {
    console.error(`[Email Service] ✗ Failed to send test email: ${error.message}`);
    throw error;
  }
};

/**
 * Send welcome email to new user
 */
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4caf50;">🎉 Welcome to Compliance System!</h2>
        <p style="color: #333; margin: 20px 0;">
          Hi <strong>${userName}</strong>,
        </p>
        <p style="color: #333;">
          Thank you for signing up! Your account has been successfully created.
        </p>
        <p style="color: #666;">
          You can now set up your business profile and start managing your compliance tasks.
        </p>
        <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #333;"><strong>Next Steps:</strong></p>
          <ul style="color: #666;">
            <li>Complete your business profile</li>
            <li>Review generated compliance tasks</li>
            <li>Upload evidence for tasks</li>
            <li>Track your compliance progress</li>
          </ul>
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This is an automated email from the Compliance System. Please do not reply.
        </p>
      </div>
    `;

    await sendEmail(userEmail, "🎉 Welcome to Compliance System", htmlContent);
    console.log(`[Email Service] ✓ Welcome email sent to ${userEmail}`);
    return { sent: true };
  } catch (error) {
    console.error(`[Email Service] ✗ Failed to send welcome email: ${error.message}`);
    throw error;
  }
};

module.exports = {
  sendOverdueTasksSummaryEmail,
  sendNewProfileNotificationEmail,
  sendTestEmail,
  sendWelcomeEmail
};

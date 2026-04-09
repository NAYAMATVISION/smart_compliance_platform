const transporter = require("../config/mailer");

const sendOverdueTasksSummaryEmail = async (adminEmail, overdueTasks) => {
  try {
    if (!overdueTasks || overdueTasks.length === 0) {
      console.log("[Email Service] No overdue tasks - skipping email");
      return { sent: false, reason: "No tasks" };
    }

    const taskRows = overdueTasks.map((task) => {
      const daysOverdue = Math.ceil((new Date() - new Date(task.dueDate)) / (1000 * 60 * 60 * 24));
      const dueDate = new Date(task.dueDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
      return `<tr><td style="padding:8px;">${task.title || "N/A"}</td><td style="padding:8px;">${task.category || "General"}</td><td style="padding:8px;">${dueDate}</td><td style="padding:8px;color:red;font-weight:bold;">${daysOverdue} days</td></tr>`;
    }).join("");

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:800px;margin:0 auto;">
        <h2>⚠️ Daily Overdue Tasks Report</h2>
        <p><strong>${overdueTasks.length}</strong> task(s) are overdue and require immediate attention.</p>
        <table style="width:100%;border-collapse:collapse;background:#f9f9f9;">
          <thead><tr style="background:#e53e3e;color:white;">
            <th style="padding:10px;text-align:left;">Task</th>
            <th style="padding:10px;text-align:left;">Category</th>
            <th style="padding:10px;text-align:left;">Due Date</th>
            <th style="padding:10px;text-align:left;">Days Overdue</th>
          </tr></thead>
          <tbody>${taskRows}</tbody>
        </table>
        <p style="color:#999;font-size:12px;margin-top:30px;">Automated email from Compliance System.</p>
      </div>`;

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: adminEmail,
      subject: `⚠️ Daily Overdue Tasks Report - ${overdueTasks.length} task(s) overdue`,
      html
    });

    console.log(`[Email Service] ✓ Overdue tasks email sent to ${adminEmail}`);
    return { sent: true, taskCount: overdueTasks.length };
  } catch (error) {
    console.error(`[Email Service] ✗ Failed to send overdue tasks email: ${error.message}`);
    throw error;
  }
};

const sendNewProfileNotificationEmail = async (adminEmail, profileData) => {
  try {
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:800px;margin:0 auto;">
        <h2>✅ New Business Profile Created</h2>
        <div style="background:#f0f0f0;padding:20px;border-radius:8px;">
          <p><strong>Company:</strong> ${profileData.legalName || "N/A"}</p>
          <p><strong>Industry:</strong> ${profileData.industry || "N/A"}</p>
          <p><strong>Size:</strong> ${profileData.employeeCountRange || "N/A"}</p>
          <p><strong>Country:</strong> ${profileData.headquartersCountry || "N/A"}</p>
        </div>
        <p style="color:#999;font-size:12px;margin-top:30px;">Automated email from Compliance System.</p>
      </div>`;

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: adminEmail,
      subject: `✅ New Business Profile Created - ${profileData.legalName}`,
      html
    });

    console.log(`[Email Service] ✓ Profile notification sent to ${adminEmail}`);
    return { sent: true };
  } catch (error) {
    console.error(`[Email Service] ✗ Failed to send profile email: ${error.message}`);
    throw error;
  }
};

const sendTestEmail = async (toEmail) => {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: toEmail,
      subject: "Test Email - Compliance System",
      html: `<h2>✓ Email System Working</h2><p>Sent: ${new Date().toLocaleString()}</p>`
    });

    console.log(`[Email Service] ✓ Test email sent to ${toEmail}`);
    return { sent: true, message: "Test email sent successfully" };
  } catch (error) {
    console.error(`[Email Service] ✗ Failed to send test email: ${error.message}`);
    throw error;
  }
};

const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2>🎉 Welcome to Compliance System!</h2>
        <p>Hi <strong>${userName}</strong>, your account has been created successfully.</p>
        <ul>
          <li>Complete your business profile</li>
          <li>Review generated compliance tasks</li>
          <li>Upload evidence for tasks</li>
        </ul>
        <p style="color:#999;font-size:12px;">Automated email from Compliance System.</p>
      </div>`;

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: userEmail,
      subject: "🎉 Welcome to Compliance System",
      html
    });

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

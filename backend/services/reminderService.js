const ComplianceTask = require("../models/ComplianceTask");
const ReminderLog = require("../models/ReminderLog");
const User = require("../models/User");
const transporter = require("../config/mailer");

const sendReminderEmails = async () => {
  try {
    console.log("[Reminder Service] Starting reminder job...");
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasks = await ComplianceTask.find({
      status: { $ne: "completed" }
    });

    console.log(`[Reminder Service] Found ${tasks.length} incomplete tasks to scan`);

    let remindersTriggered = 0;

    for (const task of tasks) {
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      const diffTime = dueDate - today;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      let reminderType = null;

      if (diffDays === 7) {
        reminderType = "7_day";
      } else if (diffDays === 3) {
        reminderType = "3_day";
      } else if (diffDays === 1) {
        reminderType = "1_day";
      } else if (diffDays < 0) {
        reminderType = "overdue";
      }

      if (!reminderType) continue;

      console.log(`[Reminder Service] Task "${task.title}" - diffDays: ${diffDays}, type: ${reminderType}`);

      // Check if reminder already sent today for this task and type
      const existingLog = await ReminderLog.findOne({
        taskId: task._id,
        reminderType,
        sentAt: { $gte: today }
      });

      if (existingLog) {
        console.log(`[Reminder Service] Skipping - already sent ${reminderType} reminder today for task ${task._id}`);
        continue;
      }

      // Get organization users
      const users = await User.find({ organizationId: task.orgId });

      if (users.length === 0) {
        console.log(`[Reminder Service] No users found for organization ${task.orgId}`);
        continue;
      }

      for (const user of users) {
        try {
          const mailOptions = {
            from: process.env.MAIL_USER,
            to: user.email,
            subject: `Compliance Reminder: ${task.title}`,
            html: `
              <h2>Compliance Task Reminder</h2>
              <p><strong>Task:</strong> ${task.title}</p>
              <p><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>
              <p><strong>Status:</strong> ${task.status}</p>
              <p><strong>Category:</strong> ${task.category || "General"}</p>
              ${diffDays < 0 ? 
                `<p style="color: red;"><strong>This task is ${Math.abs(diffDays)} day(s) overdue!</strong></p>` :
                `<p><strong>Days until due:</strong> ${diffDays}</p>`
              }
              <p>Please upload evidence and complete this task as soon as possible.</p>
              <p>Log in to your compliance dashboard to take action.</p>
            `
          };

          await transporter.sendMail(mailOptions);

          await ReminderLog.create({
            organisationId: task.orgId,
            taskId: task._id,
            recipientEmail: user.email,
            reminderType,
            sentAt: new Date(),
            deliveryStatus: "sent"
          });

          console.log(`[Reminder Service] ✓ Email sent: ${reminderType} for task "${task.title}" to ${user.email}`);
          remindersTriggered++;
        } catch (error) {
          console.error(`[Reminder Service] ✗ Failed to send email to ${user.email}: ${error.message}`);
          
          await ReminderLog.create({
            organisationId: task.orgId,
            taskId: task._id,
            recipientEmail: user.email,
            reminderType,
            sentAt: new Date(),
            deliveryStatus: "failed"
          });
        }
      }
    }

    console.log(`[Reminder Service] Job completed - ${remindersTriggered} reminders sent`);
  } catch (error) {
    console.error(`[Reminder Service] Critical error: ${error.message}`);
  }
};

module.exports = { sendReminderEmails };

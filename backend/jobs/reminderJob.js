const cron = require("node-cron");
const ComplianceTask = require("../models/ComplianceTask");
const User = require("../models/User");
const { sendOverdueTasksSummaryEmail } = require("../services/emailService");

let jobActive = false;

const sendReminderEmails = async () => {
  if (jobActive) {
    console.log("[Reminder Service] Job already running - skipping to avoid duplicate execution");
    return;
  }

  jobActive = true;

  try {
    console.log("[Reminder Service] ========================================");
    console.log("[Reminder Service] Starting daily reminder check...");
    console.log("[Reminder Service] Timestamp:", new Date().toLocaleString("en-US"));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all incomplete tasks with due date in the past
    const overdueTasks = await ComplianceTask.find({
      status: { $ne: "completed" },
      dueDate: { $lt: today }
    }).sort({ dueDate: 1 });

    console.log(`[Reminder Service] Found ${overdueTasks.length} overdue tasks`);

    if (overdueTasks.length === 0) {
      console.log("[Reminder Service] ✓ No overdue tasks found - no email needed");
      console.log("[Reminder Service] ========================================");
      return;
    }

    // Group tasks by organization
    const tasksByOrg = {};
    overdueTasks.forEach(task => {
      const orgId = task.orgId.toString();
      if (!tasksByOrg[orgId]) {
        tasksByOrg[orgId] = [];
      }
      tasksByOrg[orgId].push(task);
    });

    console.log(`[Reminder Service] Tasks grouped across ${Object.keys(tasksByOrg).length} organization(s)`);

    let emailsSent = 0;

    // Send email to each organization's users
    for (const [orgId, tasks] of Object.entries(tasksByOrg)) {
      const users = await User.find({ organizationId: orgId });

      if (users.length === 0) {
        console.log(`[Reminder Service] No users found for organization ${orgId}`);
        continue;
      }

      console.log(`[Reminder Service] Sending ${tasks.length} overdue task(s) to ${users.length} user(s) in org ${orgId}`);

      for (const user of users) {
        try {
          const result = await sendOverdueTasksSummaryEmail(user.email, tasks);
          if (result.sent) {
            console.log(`[Reminder Service] ✓ Email sent to ${user.email} (${result.taskCount} tasks)`);
            emailsSent++;
          }
        } catch (emailError) {
          console.error(`[Reminder Service] ✗ Failed to send email to ${user.email}:`, emailError.message);
        }
      }
    }

    console.log(`[Reminder Service] ✓ Completed - ${emailsSent} email(s) sent`);
    console.log("[Reminder Service] ========================================");
  } catch (error) {
    console.error("[Reminder Service] Critical error:", error.message);
    console.error(error.stack);
  } finally {
    jobActive = false;
  }
};

const startReminderJob = () => {
  console.log("[Reminder Job] Initializing daily reminder scheduler...");

  // Run every day at 5:35 PM IST
  const job = cron.schedule("45 17 * * *", async () => {
    console.log("[Reminder Job] Cron triggered - executing reminder check");
    await sendReminderEmails();
  }, {
    timezone: "Asia/Kolkata"
  });

  console.log("[Reminder Job] ✓ Scheduler active - Daily execution at 05:45 PM IST");
  console.log("[Reminder Job] Next run will be at 05:45 PM IST today/tomorrow");

  return job;
};

module.exports = { startReminderJob, sendReminderEmails };

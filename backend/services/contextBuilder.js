const BusinessProfile = require("../models/B_profile");
const ComplianceTask = require("../models/ComplianceTask");
const Evidence = require("../models/Evidence");

async function buildContext(organisationId) {
  try {
    const [profile, tasks, evidences] = await Promise.all([
      BusinessProfile.findOne({ orgId: organisationId }),
      ComplianceTask.find({ orgId: organisationId }).sort({ dueDate: 1 }),
      Evidence.find({ organisationId, status: "active" })
    ]);

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const overdueTasks = tasks.filter(t => t.status !== "completed" && new Date(t.dueDate) < now);
    const dueSoonTasks = tasks.filter(t => t.status !== "completed" && new Date(t.dueDate) >= now && new Date(t.dueDate) <= sevenDaysFromNow);
    const pendingTasks = tasks.filter(t => t.status === "pending").slice(0, 5);

    const taskIds = tasks.map(t => t._id.toString());
    const tasksWithEvidence = new Set(evidences.map(e => e.taskId.toString()));
    const evidenceCoverage = taskIds.length > 0 
      ? Math.round((tasksWithEvidence.size / taskIds.length) * 100) 
      : 0;

    const categoryCounts = tasks.reduce((acc, task) => {
      const cat = task.category || "General";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    const companySummary = profile ? {
      legalName: profile.legalName,
      industry: profile.industry || profile.industryCustom,
      entityType: profile.entityType,
      employeeRange: profile.employeeCountRange,
      countries: profile.countriesOfOperation,
      dataTypes: [
        profile.storesPersonalData && "Personal Data",
        profile.storesFinancialData && "Financial Data",
        profile.storesHealthData && "Health Data"
      ].filter(Boolean)
    } : null;

    return {
      companySummary,
      riskHighlights: {
        overdue: overdueTasks.length,
        dueSoon: dueSoonTasks.length,
        totalPending: tasks.filter(t => t.status === "pending").length
      },
      topPendingTasks: pendingTasks.map(t => ({
        title: t.title,
        category: t.category,
        dueDate: t.dueDate,
        priority: t.priority
      })),
      overdueTasks: overdueTasks.slice(0, 3).map(t => ({
        title: t.title,
        dueDate: t.dueDate
      })),
      evidenceCoverage,
      applicableDomains: Object.keys(categoryCounts)
    };
  } catch (error) {
    console.error("Context builder error:", error);
    return null;
  }
}

module.exports = { buildContext };

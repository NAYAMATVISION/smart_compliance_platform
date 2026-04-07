const express = require("express");
const ComplianceTask = require("../models/ComplianceTask");
const BusinessProfile = require("../models/B_profile");
const authMiddleware = require("../middleware/authMiddleware");
const { computeApplicabilityMatrix } = require("../services/applicabilityEngine");
const { calculateComplianceHealth, generateApplicabilitySummary, getTopRiskDomains } = require("../services/dashboardIntelligenceService");
const { taskHasEvidence } = require("../services/evidenceService");

const router = express.Router();


// SUMMARY
router.get("/summary", authMiddleware, async (req, res) => {
  try {
    const orgId = req.organizationId;
    if (!orgId) return res.status(400).json({ message: "Organization not found" });

    const today = new Date();

    const total = await ComplianceTask.countDocuments({ orgId });
    const pending = await ComplianceTask.countDocuments({ orgId, status: "pending" });
    const overdue = await ComplianceTask.countDocuments({ orgId, status: "pending", dueDate: { $lt: today } });
    const dueSoon = await ComplianceTask.countDocuments({ orgId, status: "pending", dueDate: { $gte: today } });

    const tasks = await ComplianceTask.find({ orgId });
    const healthScore = calculateComplianceHealth(tasks);

    const profile = await BusinessProfile.findOne({ orgId });
    let applicabilitySummary = null;
    let topRiskDomains = [];

    if (profile) {
      const applicabilityResult = computeApplicabilityMatrix(profile);
      applicabilitySummary = generateApplicabilitySummary(profile, applicabilityResult);
      topRiskDomains = getTopRiskDomains(applicabilityResult);
    }

    res.json({ total, pending, overdue, dueSoon, healthScore, applicabilitySummary, topRiskDomains });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// UPCOMING
router.get("/upcoming", authMiddleware, async (req, res) => {
  try {
    const orgId = req.organizationId;
    if (!orgId) return res.status(400).json({ message: "Organization not found" });

    const today = new Date();
    const tasks = await ComplianceTask.find({
      orgId,
      status: "pending",
      dueDate: { $gte: today }
    })
      .sort({ dueDate: 1 })
      .limit(5);

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// ALL TASKS
router.get("/tasks", authMiddleware, async (req, res) => {
  try {
    const orgId = req.organizationId;
    if (!orgId) return res.status(400).json({ message: "Organization not found" });

    const tasks = await ComplianceTask.find({ orgId })
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// MARK TASK COMPLETE
router.patch("/tasks/:taskId/complete", authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;
    const orgId = req.organizationId;

    const task = await ComplianceTask.findOne({ _id: taskId, orgId });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const hasEvidence = await taskHasEvidence(taskId);
    if (!hasEvidence) {
      return res.status(400).json({ message: "Evidence required before completing this task." });
    }

    task.status = "completed";
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

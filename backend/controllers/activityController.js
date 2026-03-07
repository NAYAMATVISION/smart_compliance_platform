const ActivityLog = require("../models/ActivityLog");

const createActivityLog = async ({ userId, organisationId, action, documentId, documentName, details }) => {
  try {
    const log = new ActivityLog({
      userId,
      organisationId,
      action,
      documentId,
      documentName,
      details
    });
    await log.save();
    return log;
  } catch (error) {
    console.error("Error creating activity log:", error);
    throw error;
  }
};

const getRecentActivity = async (req, res) => {
  try {
    const organisationId = req.organizationId;

    const activities = await ActivityLog.find({ organisationId })
      .sort({ timestamp: -1 })
      .limit(20)
      .populate("userId", "name email");

    res.json({ success: true, activities });
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createActivityLog,
  getRecentActivity
};

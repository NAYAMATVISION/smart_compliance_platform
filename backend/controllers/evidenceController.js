const { uploadEvidence, getEvidenceForTask } = require("../services/evidenceService");
const { createActivityLog } = require("./activityController");
const { notifyAdminDocumentChange } = require("../services/notificationService");
const User = require("../models/User");

const uploadEvidenceController = async (req, res) => {
  try {
    const { taskId } = req.body;
    const organisationId = req.organizationId;
    const userId = req.userId;
    const file = req.file;

    if (!taskId) {
      return res.status(400).json({ message: "Task ID is required" });
    }

    if (!file) {
      return res.status(400).json({ message: "File is required" });
    }

    const evidence = await uploadEvidence(organisationId, taskId, userId, file);

    // Get user details for logging and notification
    const user = await User.findById(userId);

    // Create activity log
    await createActivityLog({
      userId,
      organisationId,
      action: "DOCUMENT_UPLOADED",
      documentId: evidence._id,
      documentName: file.originalname,
      details: `Uploaded evidence for task ${taskId}`
    });

    // Notify admins if user is employee or manager
    if (user && (user.role === "employee" || user.role === "manager")) {
      await notifyAdminDocumentChange({
        organisationId,
        user,
        documentName: file.originalname,
        action: "DOCUMENT_UPLOADED"
      });
    }

    res.json({
      success: true,
      evidence
    });
  } catch (error) {
    console.error("Error uploading evidence:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getTaskEvidenceController = async (req, res) => {
  try {
    const { taskId } = req.params;

    const evidence = await getEvidenceForTask(taskId);

    res.json(evidence);
  } catch (error) {
    console.error("Error fetching evidence:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  uploadEvidenceController,
  getTaskEvidenceController
};

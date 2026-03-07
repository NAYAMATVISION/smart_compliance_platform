const Evidence = require("../models/Evidence");

const uploadEvidence = async (organisationId, taskId, userId, file) => {
  const latestEvidence = await Evidence.findOne({ taskId, status: "active" })
    .sort({ version: -1 });

  let version = 1;

  if (latestEvidence) {
    latestEvidence.status = "superseded";
    latestEvidence.changeLog.push({
      action: "replaced",
      userId,
      timestamp: new Date(),
      notes: "Superseded by new version"
    });
    await latestEvidence.save();
    version = latestEvidence.version + 1;
  }

  const newEvidence = await Evidence.create({
    organisationId,
    taskId,
    fileName: file.originalname,
    fileUrl: `/uploads/evidence/${file.filename}`,
    fileType: file.mimetype,
    version,
    uploadedBy: userId,
    uploadedAt: new Date(),
    status: "active",
    changeLog: [
      {
        action: "uploaded",
        userId,
        timestamp: new Date(),
        notes: "Initial upload"
      }
    ]
  });

  return newEvidence;
};

const getEvidenceForTask = async (taskId) => {
  return await Evidence.find({ taskId }).sort({ version: -1 });
};

const taskHasEvidence = async (taskId) => {
  const evidence = await Evidence.findOne({ taskId, status: "active" });
  return !!evidence;
};

module.exports = {
  uploadEvidence,
  getEvidenceForTask,
  taskHasEvidence
};

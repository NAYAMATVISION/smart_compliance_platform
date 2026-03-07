const Evidence = require("../models/Evidence");
const User = require("../models/User");
const { createActivityLog } = require("./activityController");
const { notifyAdminDocumentChange } = require("../services/notificationService");

const uploadDocument = async (req, res) => {
  try {
    const { taskId } = req.body;
    const organisationId = req.organizationId;
    const userId = req.userId;
    const file = req.file;

    if (!taskId || !file) {
      return res.status(400).json({ message: "Task ID and file are required" });
    }

    const document = await Evidence.create({
      organisationId,
      taskId,
      fileName: file.originalname,
      fileUrl: `/uploads/evidence/${file.filename}`,
      fileType: file.mimetype,
      version: 1,
      uploadedBy: userId,
      status: "active",
      changeLog: [{ action: "uploaded", userId, notes: "Initial upload" }]
    });

    const user = await User.findById(userId);

    await createActivityLog({
      userId,
      organisationId,
      action: "DOCUMENT_UPLOADED",
      documentId: document._id,
      documentName: file.originalname,
      details: `Uploaded document for task ${taskId}`
    });

    if (user && (user.role === "employee" || user.role === "manager")) {
      await notifyAdminDocumentChange({
        organisationId,
        user,
        documentName: file.originalname,
        action: "DOCUMENT_UPLOADED"
      });
    }

    res.json({ success: true, document });
  } catch (error) {
    console.error("Error uploading document:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { fileName, notes } = req.body;
    const userId = req.userId;
    const organisationId = req.organizationId;

    const document = await Evidence.findOne({ _id: documentId, organisationId });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (fileName) document.fileName = fileName;
    
    document.changeLog.push({
      action: "updated",
      userId,
      notes: notes || "Document updated"
    });

    await document.save();

    const user = await User.findById(userId);

    await createActivityLog({
      userId,
      organisationId,
      action: "DOCUMENT_UPDATED",
      documentId: document._id,
      documentName: document.fileName,
      details: notes || "Document updated"
    });

    if (user && (user.role === "employee" || user.role === "manager")) {
      await notifyAdminDocumentChange({
        organisationId,
        user,
        documentName: document.fileName,
        action: "DOCUMENT_UPDATED"
      });
    }

    res.json({ success: true, document });
  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const archiveDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.userId;
    const organisationId = req.organizationId;

    const document = await Evidence.findOne({ _id: documentId, organisationId });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    document.status = "superseded";
    document.changeLog.push({
      action: "updated",
      userId,
      notes: "Document archived"
    });

    await document.save();

    const user = await User.findById(userId);

    await createActivityLog({
      userId,
      organisationId,
      action: "DOCUMENT_ARCHIVED",
      documentId: document._id,
      documentName: document.fileName,
      details: "Document archived"
    });

    if (user && (user.role === "employee" || user.role === "manager")) {
      await notifyAdminDocumentChange({
        organisationId,
        user,
        documentName: document.fileName,
        action: "DOCUMENT_ARCHIVED"
      });
    }

    res.json({ success: true, message: "Document archived" });
  } catch (error) {
    console.error("Error archiving document:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.userId;
    const organisationId = req.organizationId;

    const document = await Evidence.findOne({ _id: documentId, organisationId });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const documentName = document.fileName;

    await Evidence.deleteOne({ _id: documentId });

    const user = await User.findById(userId);

    await createActivityLog({
      userId,
      organisationId,
      action: "DOCUMENT_DELETED",
      documentId,
      documentName,
      details: "Document permanently deleted"
    });

    if (user && (user.role === "employee" || user.role === "manager")) {
      await notifyAdminDocumentChange({
        organisationId,
        user,
        documentName,
        action: "DOCUMENT_DELETED"
      });
    }

    res.json({ success: true, message: "Document deleted" });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getDocuments = async (req, res) => {
  try {
    const organisationId = req.organizationId;

    const documents = await Evidence.find({ organisationId })
      .sort({ uploadedAt: -1 })
      .populate("uploadedBy", "name email");

    res.json({ success: true, documents });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  uploadDocument,
  updateDocument,
  archiveDocument,
  deleteDocument,
  getDocuments
};

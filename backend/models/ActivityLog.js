const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  organisationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organisation",
    required: true
  },
  action: {
    type: String,
    enum: ["DOCUMENT_UPLOADED", "DOCUMENT_UPDATED", "DOCUMENT_ARCHIVED", "DOCUMENT_DELETED"],
    required: true
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId
  },
  documentName: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  details: {
    type: String
  }
});

activityLogSchema.index({ organisationId: 1, timestamp: -1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);

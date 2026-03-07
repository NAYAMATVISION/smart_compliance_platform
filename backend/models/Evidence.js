const mongoose = require("mongoose");

const evidenceSchema = new mongoose.Schema(
  {
    organisationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    fileName: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      required: true
    },
    version: {
      type: Number,
      default: 1
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ["active", "superseded"],
      default: "active"
    },
    changeLog: [
      {
        action: {
          type: String,
          enum: ["uploaded", "updated", "replaced"]
        },
        userId: mongoose.Schema.Types.ObjectId,
        timestamp: {
          type: Date,
          default: Date.now
        },
        notes: String
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Evidence", evidenceSchema);

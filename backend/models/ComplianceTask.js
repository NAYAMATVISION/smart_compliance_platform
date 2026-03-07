const mongoose = require("mongoose");

const complianceTaskSchema = new mongoose.Schema(
{
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },

  title: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  reason: {
    type: String
  },

  category: {
    type: String
  },

  frequency: {
    type: String
  },

  dueDate: {
    type: Date,
    required: true
  },

  status: {
    type: String,
    enum: ["pending", "completed", "overdue"],
    default: "pending"
  },

  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },

  createdBySystem: {
    type: Boolean,
    default: true
  }
},
{ timestamps: true }
);

module.exports = mongoose.model("ComplianceTask", complianceTaskSchema);

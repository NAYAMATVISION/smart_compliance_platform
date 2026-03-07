const mongoose = require("mongoose");

const reminderLogSchema = new mongoose.Schema(
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
    recipientEmail: {
      type: String,
      required: true
    },
    reminderType: {
      type: String,
      enum: ["7_day", "3_day", "1_day", "overdue"],
      required: true
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    deliveryStatus: {
      type: String,
      default: "sent"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReminderLog", reminderLogSchema);

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization"
  },
  role: {
    type: String,
    enum: ["admin", "manager", "employee", "viewer"],
    default: "employee"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);

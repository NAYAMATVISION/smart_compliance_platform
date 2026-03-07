const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const router = express.Router();

// CREATE USER (Admin only)
router.post("/create-user", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const organisationId = req.organizationId;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      organizationId: organisationId
    });

    res.json({
      success: true,
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET ALL USERS IN ORGANIZATION (Admin only)
router.get("/users", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const organisationId = req.organizationId;

    const users = await User.find({ organizationId: organisationId })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// UPDATE USER ROLE (Admin only)
router.patch("/users/:userId/role", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const organisationId = req.organizationId;

    if (!["admin", "manager", "employee", "viewer"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findOne({ _id: userId, organizationId: organisationId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: "User role updated",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// DELETE USER (Admin only)
router.delete("/users/:userId", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const { userId } = req.params;
    const organisationId = req.organizationId;

    const user = await User.findOne({ _id: userId, organizationId: organisationId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user._id.toString() === req.userId) {
      return res.status(400).json({ message: "Cannot delete yourself" });
    }

    await User.deleteOne({ _id: userId });

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;

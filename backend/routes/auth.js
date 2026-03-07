const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { sendTestEmail, sendWelcomeEmail } = require("../services/emailService");

const User = require("../models/User");
const Organization = require("../models/Organisation");
const BusinessProfile = require("../models/B_profile");

const router = express.Router();


// 📧 TEST EMAIL (for debugging)
router.get("/test-email", async (req, res) => {
  try {
    const toEmail = req.query.email || process.env.ADMIN_EMAIL;

    if (!toEmail) {
      return res.status(400).json({
        message: "Email recipient required",
        instruction: "Pass ?email=your@email.com or set ADMIN_EMAIL in .env"
      });
    }

    console.log(`[Test Email Route] Sending test email to ${toEmail}`);
    const result = await sendTestEmail(toEmail);

    res.json({
      success: true,
      message: result.message,
      recipient: toEmail,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("[Test Email Route] Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to send test email",
      error: error.message
    });
  }
});
// 🔐 SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const organization = await Organization.create({});

    // First user in organization is admin
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      organizationId: organization._id,
      role: "admin"
    });

    const token = jwt.sign(
      { userId: user._id, organizationId: organization._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send welcome email
    try {
      await sendWelcomeEmail(email, name);
    } catch (emailError) {
      console.error("[Signup] Failed to send welcome email:", emailError.message);
    }

    res.json({ 
      token, 
      isNewUser: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// 🔐 LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, organizationId: user.organizationId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const hasProfile = await BusinessProfile.findOne({ orgId: user.organizationId });

    res.json({ 
      token, 
      isNewUser: false, 
      hasProfile: !!hasProfile,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "employee"
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

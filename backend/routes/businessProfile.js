const express = require("express");
const ComplianceTask = require("../models/ComplianceTask");
const generateTasksFromProfile = require("../services/taskGenerator");
const User = require("../models/User");

const BusinessProfile = require("../models/B_profile");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const { sendNewProfileNotificationEmail } = require("../services/emailService");

const router = express.Router();


// CREATE OR UPDATE BUSINESS PROFILE (Admin only)
router.post("/", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    console.log("Received body:", req.body);
    console.log("Organization ID:", req.organizationId);

    const profileData = {
      orgId: req.organizationId,
      legalName: req.body.legalName,
      entityType: req.body.entityType,
      entityTypeCustom: req.body.entityTypeCustom,
      incorporationDate: req.body.incorporationDate,
      headquartersCountry: req.body.headquartersCountry,
      stateOrRegion: req.body.stateOrRegion,

      employeeCountRange: req.body.employeeCountRange,
      remoteWorkforce: req.body.remoteWorkforce,
      usesContractors: req.body.usesContractors,

      countriesOfOperation: req.body.countriesOfOperation,
      customerRegions: req.body.customerRegions,

      storesPersonalData: req.body.storesPersonalData,
      storesFinancialData: req.body.storesFinancialData,
      storesHealthData: req.body.storesHealthData,
      cloudHosted: req.body.cloudHosted,
      cloudProviders: req.body.cloudProviders,

      industry: req.body.industry,
      industryCustom: req.body.industryCustom,
      businessModel: req.body.businessModel,
      sellsToEnterprises: req.body.sellsToEnterprises,

      revenueRange: req.body.revenueRange,
      taxRegistered: req.body.taxRegistered
    };

    console.log("Profile data prepared:", profileData);

    const existingProfile = await BusinessProfile.findOne({
      orgId: req.organizationId
    });

    let profile;

    if (existingProfile) {
      profile = await BusinessProfile.findOneAndUpdate(
        { orgId: req.organizationId },
        profileData,
        { new: true, runValidators: true }
      );
      console.log("Profile updated:", profile);
    } else {
      profile = await BusinessProfile.create(profileData);
      console.log("Profile created:", profile);
      
      // Send email notification to all users in the organization
      try {
        const users = await User.find({ organizationId: req.organizationId });
        
        if (users.length > 0) {
          for (const user of users) {
            await sendNewProfileNotificationEmail(user.email, profile);
            console.log(`[Business Profile] ✓ Notification sent to ${user.email}`);
          }
        } else {
          console.warn("[Business Profile] No users found for organization");
        }
      } catch (emailError) {
        console.error("[Business Profile] Failed to send new profile email:", emailError.message);
        // Continue even if email fails - don't block profile creation
      }
    }

    // 🔥🔥🔥 CORE MAGIC 🔥🔥🔥
    // Remove old system-generated tasks
    await ComplianceTask.deleteMany({
      orgId: req.organizationId,
      createdBySystem: true
    });

    console.log("Old system tasks cleared");

    // Generate fresh tasks
    const count = await generateTasksFromProfile(profile);
    console.log(`Generated ${count} tasks`);

    return res.json({
      message: "Business profile saved successfully",
      profile,
      tasksGenerated: count
    });

  } catch (error) {
    console.error("Error saving profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


// GET PROFILE
router.get("/", authMiddleware, async (req, res) => {
  try {
    const profile = await BusinessProfile.findOne({
      orgId: req.organizationId
    });
    res.json({ profile });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;

const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const { getRecentActivity } = require("../controllers/activityController");

const router = express.Router();

// Get Recent Activity - admin, manager only
router.get(
  "/recent",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  getRecentActivity
);

module.exports = router;

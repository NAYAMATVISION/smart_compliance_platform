const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const upload = require("../middleware/uploadMiddleware");
const { uploadEvidenceController, getTaskEvidenceController } = require("../controllers/evidenceController");

const router = express.Router();

router.post("/upload", authMiddleware, authorizeRoles("admin", "manager", "employee"), upload.single("file"), uploadEvidenceController);
router.get("/task/:taskId", authMiddleware, authorizeRoles("admin", "manager", "employee", "viewer"), getTaskEvidenceController);

module.exports = router;

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/aiUploadMiddleware");
const { handleChat } = require("../controllers/aiCopilotController");

router.post("/chat", authMiddleware, upload.single("file"), handleChat);

module.exports = router;

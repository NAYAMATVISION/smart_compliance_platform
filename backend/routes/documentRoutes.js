const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const upload = require("../middleware/uploadMiddleware");
const {
  uploadDocument,
  updateDocument,
  archiveDocument,
  deleteDocument,
  getDocuments
} = require("../controllers/documentController");

const router = express.Router();

// Upload Document - admin, manager
router.post(
  "/upload",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  upload.single("file"),
  uploadDocument
);

// Update Document - admin, manager
router.put(
  "/:documentId",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  updateDocument
);

// Archive Document - admin only
router.patch(
  "/:documentId/archive",
  authMiddleware,
  authorizeRoles("admin"),
  archiveDocument
);

// Delete Document - admin only
router.delete(
  "/:documentId",
  authMiddleware,
  authorizeRoles("admin"),
  deleteDocument
);

// View Documents - all roles
router.get(
  "/",
  authMiddleware,
  authorizeRoles("admin", "manager", "employee", "viewer"),
  getDocuments
);

module.exports = router;

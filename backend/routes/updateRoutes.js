const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");
const validateRequest = require("../middleware/validationMiddleware");
const {
  createUpdateValidator,
  getProjectUpdatesValidator,
  reviewUpdateValidator,
  replaceAttachmentValidator,
} = require("../middleware/requestValidators");
const {
  createUpdate,
  getUpdatesByProject,
  reviewUpdate,
  replaceAttachment,
} = require("../controllers/updateController");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  allowRoles("student"),
  upload.single("file"),
  createUpdateValidator,
  validateRequest,
  createUpdate
);
router.get(
  "/project/:projectId",
  authMiddleware,
  allowRoles("student", "mentor"),
  getProjectUpdatesValidator,
  validateRequest,
  getUpdatesByProject
);
router.patch(
  "/:id/attachment",
  authMiddleware,
  allowRoles("student"),
  upload.single("file"),
  replaceAttachmentValidator,
  validateRequest,
  replaceAttachment
);
router.patch(
  "/:id/review",
  authMiddleware,
  allowRoles("mentor"),
  reviewUpdateValidator,
  validateRequest,
  reviewUpdate
);

module.exports = router;

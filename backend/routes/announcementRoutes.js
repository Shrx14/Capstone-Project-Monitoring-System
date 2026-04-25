const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validationMiddleware");
const {
  createAnnouncementValidator,
  getAnnouncementsValidator,
} = require("../middleware/requestValidators");
const {
  createAnnouncement,
  getAnnouncements,
} = require("../controllers/announcementController");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  allowRoles("coordinator"),
  createAnnouncementValidator,
  validateRequest,
  createAnnouncement
);
router.get(
  "/",
  authMiddleware,
  allowRoles("teamleader", "mentor", "coordinator"),
  getAnnouncementsValidator,
  validateRequest,
  getAnnouncements
);

module.exports = router;

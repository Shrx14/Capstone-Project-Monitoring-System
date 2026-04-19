const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const {
  createAnnouncement,
  getAnnouncements,
} = require("../controllers/announcementController");

const router = express.Router();

router.post("/", authMiddleware, allowRoles("coordinator"), createAnnouncement);
router.get("/", authMiddleware, allowRoles("student", "mentor", "coordinator"), getAnnouncements);

module.exports = router;

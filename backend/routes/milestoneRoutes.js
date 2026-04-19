const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const {
  createMilestone,
  getMilestonesByProject,
  updateMilestoneStatus,
} = require("../controllers/milestoneController");

const router = express.Router();

router.post("/", authMiddleware, allowRoles("student"), createMilestone);
router.get(
  "/project/:projectId",
  authMiddleware,
  allowRoles("student", "mentor", "coordinator"),
  getMilestonesByProject
);
router.patch("/:id", authMiddleware, allowRoles("student"), updateMilestoneStatus);

module.exports = router;

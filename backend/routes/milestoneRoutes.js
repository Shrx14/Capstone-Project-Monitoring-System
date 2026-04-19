const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validationMiddleware");
const {
  createMilestoneValidator,
  getMilestonesByProjectValidator,
  updateMilestoneStatusValidator,
} = require("../middleware/requestValidators");
const {
  createMilestone,
  getMilestonesByProject,
  updateMilestoneStatus,
} = require("../controllers/milestoneController");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  allowRoles("student"),
  createMilestoneValidator,
  validateRequest,
  createMilestone
);
router.get(
  "/project/:projectId",
  authMiddleware,
  allowRoles("student", "mentor", "coordinator"),
  getMilestonesByProjectValidator,
  validateRequest,
  getMilestonesByProject
);
router.patch(
  "/:id",
  authMiddleware,
  allowRoles("student"),
  updateMilestoneStatusValidator,
  validateRequest,
  updateMilestoneStatus
);

module.exports = router;

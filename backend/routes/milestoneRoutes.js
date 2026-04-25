const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validationMiddleware");
const {
  getMilestonesByProjectValidator,
} = require("../middleware/requestValidators");
const {
  getMilestonesByProject,
} = require("../controllers/milestoneController");

const router = express.Router();

router.get(
  "/project/:projectId",
  authMiddleware,
  allowRoles("mentor", "coordinator"),
  getMilestonesByProjectValidator,
  validateRequest,
  getMilestonesByProject
);

module.exports = router;

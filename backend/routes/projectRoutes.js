const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validationMiddleware");
const {
  createProjectValidator,
  updateProjectStatusValidator,
} = require("../middleware/requestValidators");
const {
  createProject,
  getMyProjects,
  getAssignedProjects,
  getAllProjects,
  updateProjectStatus,
  getProjectStats,
} = require("../controllers/projectController");

const router = express.Router();

router.post("/", authMiddleware, allowRoles("student"), createProjectValidator, validateRequest, createProject);
router.get("/my", authMiddleware, allowRoles("student"), getMyProjects);
router.get("/assigned", authMiddleware, allowRoles("mentor"), getAssignedProjects);
router.get("/", authMiddleware, allowRoles("coordinator"), getAllProjects);
router.get("/stats", authMiddleware, allowRoles("coordinator"), getProjectStats);
router.patch(
  "/:id/status",
  authMiddleware,
  allowRoles("coordinator"),
  updateProjectStatusValidator,
  validateRequest,
  updateProjectStatus
);

module.exports = router;

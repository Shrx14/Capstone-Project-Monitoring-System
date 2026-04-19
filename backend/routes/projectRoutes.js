const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const {
  createProject,
  getMyProjects,
  getAssignedProjects,
  getAllProjects,
  updateProjectStatus,
  getProjectStats,
} = require("../controllers/projectController");

const router = express.Router();

router.post("/", authMiddleware, allowRoles("student"), createProject);
router.get("/my", authMiddleware, allowRoles("student"), getMyProjects);
router.get("/assigned", authMiddleware, allowRoles("mentor"), getAssignedProjects);
router.get("/", authMiddleware, allowRoles("coordinator"), getAllProjects);
router.get("/stats", authMiddleware, allowRoles("coordinator"), getProjectStats);
router.patch("/:id/status", authMiddleware, allowRoles("coordinator"), updateProjectStatus);

module.exports = router;

const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const {
  getPendingTeams,
  approveTeam,
  rejectTeam,
  getAllTeams,
  getMyTeam,
  getMentorTeams,
  getTeamStats,
} = require("../controllers/teamController");

const router = express.Router();

router.get("/pending", authMiddleware, allowRoles("coordinator"), getPendingTeams);
router.get("/", authMiddleware, allowRoles("coordinator"), getAllTeams);
router.get("/stats", authMiddleware, allowRoles("coordinator"), getTeamStats);
router.get("/my", authMiddleware, allowRoles("teamleader"), getMyTeam);
router.get("/mentor-teams", authMiddleware, allowRoles("mentor"), getMentorTeams);
router.patch("/:id/approve", authMiddleware, allowRoles("coordinator"), approveTeam);
router.patch("/:id/reject", authMiddleware, allowRoles("coordinator"), rejectTeam);

module.exports = router;

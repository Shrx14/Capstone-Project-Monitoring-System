const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  createSchedule,
  addTaskAttachment,
  getScheduleForTeam,
  getAllSchedules,
  updateSchedule,
} = require("../controllers/scheduleController");

const router = express.Router();

router.post("/", authMiddleware, allowRoles("coordinator"), createSchedule);
router.get("/", authMiddleware, allowRoles("coordinator"), getAllSchedules);
router.get(
  "/team/:teamId",
  authMiddleware,
  allowRoles("coordinator", "teamleader", "mentor"),
  getScheduleForTeam
);
router.patch("/:scheduleId", authMiddleware, allowRoles("coordinator"), updateSchedule);
router.post(
  "/:scheduleId/tasks/:taskId/attachment",
  authMiddleware,
  allowRoles("coordinator"),
  upload.single("file"),
  addTaskAttachment
);

module.exports = router;

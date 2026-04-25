const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  upsertSubmission,
  submitTask,
  getTeamSubmissions,
  getMentorGrades,
  getSingleSubmission,
  mentorReviewTask,
} = require("../controllers/taskSubmissionController");

const router = express.Router();

router.put("/", authMiddleware, allowRoles("teamleader"), upsertSubmission);
router.post("/:submissionId/submit", authMiddleware, allowRoles("teamleader"), upload.single("file"), submitTask);
router.get(
  "/schedule/:scheduleId",
  authMiddleware,
  allowRoles("teamleader", "mentor", "coordinator"),
  getTeamSubmissions
);
router.get("/grades/:scheduleId", authMiddleware, allowRoles("mentor"), getMentorGrades);
router.get(
  "/:submissionId",
  authMiddleware,
  allowRoles("teamleader", "mentor", "coordinator"),
  getSingleSubmission
);
router.patch("/:submissionId/review", authMiddleware, allowRoles("mentor"), mentorReviewTask);

module.exports = router;

const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validationMiddleware");
const {
  getProjectUpdatesValidator,
  reviewUpdateValidator,
} = require("../middleware/requestValidators");
const {
  getUpdatesByProject,
  reviewUpdate,
} = require("../controllers/updateController");

const router = express.Router();

router.get(
  "/project/:projectId",
  authMiddleware,
  allowRoles("mentor"),
  getProjectUpdatesValidator,
  validateRequest,
  getUpdatesByProject
);
router.patch(
  "/:id/review",
  authMiddleware,
  allowRoles("mentor"),
  reviewUpdateValidator,
  validateRequest,
  reviewUpdate
);

module.exports = router;

const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  createUpdate,
  getUpdatesByProject,
  reviewUpdate,
} = require("../controllers/updateController");

const router = express.Router();

router.post("/", authMiddleware, allowRoles("student"), upload.single("file"), createUpdate);
router.get(
  "/project/:projectId",
  authMiddleware,
  allowRoles("student", "mentor"),
  getUpdatesByProject
);
router.patch("/:id/review", authMiddleware, allowRoles("mentor"), reviewUpdate);

module.exports = router;

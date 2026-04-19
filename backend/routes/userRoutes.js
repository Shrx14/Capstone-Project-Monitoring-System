const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const validateRequest = require("../middleware/validationMiddleware");
const { getUsersValidator } = require("../middleware/requestValidators");

const router = express.Router();

router.get("/", authMiddleware, getUsersValidator, validateRequest, async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};

    const users = await User.find(filter).select("-password");

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
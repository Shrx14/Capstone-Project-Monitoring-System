const express = require("express");
const { register, login, registerTeam } = require("../controllers/authController");
const validateRequest = require("../middleware/validationMiddleware");
const { registerValidator, loginValidator } = require("../middleware/requestValidators");

const router = express.Router();

router.post("/register", registerValidator, validateRequest, register);
router.post("/login", loginValidator, validateRequest, login);
router.post("/register-team", registerTeam);

module.exports = router;
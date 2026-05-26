const express = require("express");
const authController = require("./auth.controller");
const { requireAuth, optionalAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/google", authController.googleSignup);
router.post("/phone", authController.submitPhoneNumber);
router.post("/verifyOtp", authController.verifyPhoneOtp);
router.post("/set-pin", authController.setPin);
router.post("/verify-pin-otp", authController.verifyPinOtp);
router.post("/set-password", authController.setPassword);
router.post("/login", authController.login);
router.post("/verify-login-pin", authController.verifyLoginPin);
router.post("/email", authController.emailSignup);
router.post("/refresh-token", authController.refreshAccessToken);

module.exports = router;
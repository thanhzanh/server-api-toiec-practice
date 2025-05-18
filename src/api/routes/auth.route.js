const express = require('express');
const router = express.Router();

const controller = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');

router.post("/register", validate.registerValidation, controller.register);

router.post("/login", validate.loginValidation, controller.login);

router.post("/forgot-password", validate.forgotPasswordValidation, controller.forgotPassword);

router.post("/vertify-otp", validate.vertifyOtpValidation, controller.vertifyOtp);

router.post("/reset-password", validate.resetPasswordValidation, controller.resetPassword);

router.post("/google", controller.googleLogin);

module.exports = router;
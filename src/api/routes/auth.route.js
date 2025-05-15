const express = require('express');
const router = express.Router();

const controller = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');

router.post("/register", validate.registerValidation, controller.register);

router.post("/login", validate.loginValidation, controller.login);

router.post("/forgot-password", controller.forgotPassword);

router.post("/vertify-otp", controller.vertifyOtpPassword);

module.exports = router;
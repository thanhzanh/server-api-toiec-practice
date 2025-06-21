const express = require('express');
const router = express.Router();

const controller = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const { authenticateUser, authorizeRole } = require('../middlewares/auth.middleware');
const logAction = require('../middlewares/log.middleware');

// Đăng ký tài khoản
router.post("/register", 
    validate.registerValidation, 
    logAction('Đăng ký tài khoản', (req) => `Đăng ký tài khoản với email: ${req.body.email}`),
    controller.register
);

// Đăng nhập
router.post("/login", 
    validate.loginValidation, 
    logAction('Đăng nhập', (req) => `Đăng nhập với identifier: ${req.body.identifier}`), 
    controller.login
);

// Quên mật khẩu (nhập email)
router.post("/forgot-password", validate.forgotPasswordValidation, controller.forgotPassword);

// Quên mật khẩu (nhập otp)
router.post("/vertify-otp", validate.vertifyOtpValidation, controller.vertifyOtp);

// Quên mật khẩu (nhập mật khẩu mới)
router.post("/reset-password", validate.resetPasswordValidation, controller.resetPassword);

// Thay đổi mật khẩu
router.post("/change-password", authenticateUser, authorizeRole(['nguoi_dung']), controller.changePassword);

router.post("/google", controller.googleLogin);

module.exports = router;
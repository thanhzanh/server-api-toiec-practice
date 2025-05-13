const express = require('express');
const router = express.Router();

const controller = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');

router.post("/register", validate.registerValidation, controller.register);

router.post("/login", validate.loginValidation, controller.login);

// router.post("/password/forgot", controller.forgotPassword);

module.exports = router;
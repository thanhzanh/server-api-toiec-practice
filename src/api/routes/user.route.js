const express = require('express');
const router = express.Router();

const controller = require('../controllers/user.controller');
const { authenticateUser, authorizeRole } = require('../middlewares/auth.middleware');

router.get("/", authenticateUser, authorizeRole(["quan_tri_vien"]), controller.getAllUsers);

router.get("/me", authenticateUser, authorizeRole(["quan_tri_vien", "nguoi_dung"]), controller.getMe);

module.exports = router;
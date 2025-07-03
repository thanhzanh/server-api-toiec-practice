const express = require('express');
const router = express.Router();
const controller = require('../controllers/role.controller');
const { authenticateUser, authorizeRole } = require('../middlewares/auth.middleware');
const logAction = require('../middlewares/log.middleware');

// Lấy danh sách vai trò
router.get("/",
    authenticateUser,
    authorizeRole(["quan_tri_vien"]), 
    logAction('Lấy danh sách vai trò'),
    controller.getAllRoles
);

module.exports = router;
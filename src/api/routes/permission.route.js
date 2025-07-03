const express = require('express');
const router = express.Router();
const controller = require('../controllers/permission.controller');
const { authenticateUser, authorizeRole } = require('../middlewares/auth.middleware');
const logAction = require('../middlewares/log.middleware');

// Lấy danh sách quyền
router.get("/",
    authenticateUser,
    authorizeRole(["quan_tri_vien"]), 
    logAction('Lấy danh sách quyền'),
    controller.index
);

module.exports = router;
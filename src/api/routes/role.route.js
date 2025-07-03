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
    controller.index
);

// Tạo vai trò mới
router.post("/create",
    authenticateUser,
    authorizeRole(["quan_tri_vien"]),
    logAction('Tạo vai trò mới'),
    controller.createRole
);

// Cập nhật vai trò
router.patch("/update/:id_vai_tro",
    authenticateUser,
    authorizeRole(["quan_tri_vien"]),
    logAction('Cập nhật vai trò'),
    controller.updateRole
);

module.exports = router;
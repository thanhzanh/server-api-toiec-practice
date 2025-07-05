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

// Thêm quyền
router.post("/create",
    authenticateUser,
    authorizeRole(["quan_tri_vien"]), 
    logAction('Thêm quyền'),
    controller.createPermission
);

// Cập nhật quyền
router.patch("/update/:id_quyen",
    authenticateUser,
    authorizeRole(["quan_tri_vien"]), 
    logAction('Cập nhật quyền'),
    controller.updatePermission
);

// Xóa quyền
router.delete("/delete/:id_quyen",
    authenticateUser,
    authorizeRole(["quan_tri_vien"]), 
    logAction('Xóa quyền'),
    controller.deletePermission
);

// Xem chi tiết quyền quyền
router.get("/detail/:id_quyen",
    authenticateUser,
    authorizeRole(["quan_tri_vien"]), 
    logAction('Xem chi tiết quyền quyền'),
    controller.detailPermission
);

module.exports = router;
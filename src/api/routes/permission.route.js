const express = require('express');
const router = express.Router();
const controller = require('../controllers/permission.controller');
const { authenticateUser } = require('../middlewares/auth.middleware');
const { authorizePermission } = require('../middlewares/permission.middleware');
const logAction = require('../middlewares/log.middleware');

// Lấy danh sách quyền
router.get("/",
    authenticateUser,
    authorizePermission("PERMISSION_VIEW"), 
    logAction('Lấy danh sách quyền'),
    controller.index
);

// Thêm quyền
router.post("/create",
    authenticateUser,
    authorizePermission("PERMISSION_CREATE"), 
    logAction('Thêm quyền'),
    controller.createPermission
);

// Cập nhật quyền
router.patch("/update/:id_quyen",
    authenticateUser,
    authorizePermission("PERMISSION_UPDATE"), 
    logAction('Cập nhật quyền'),
    controller.updatePermission
);

// Xóa quyền
router.delete("/delete/:id_quyen",
    authenticateUser,
    authorizePermission("PERMISSION_DELETE"), 
    logAction('Xóa quyền'),
    controller.deletePermission
);

// Xem chi tiết quyền quyền
router.get("/detail/:id_quyen",
    authenticateUser,
    authorizePermission("PERMISSION_DETAIL"), 
    logAction('Xem chi tiết quyền quyền'),
    controller.detailPermission
);

module.exports = router;
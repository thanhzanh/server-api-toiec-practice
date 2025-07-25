const express = require('express');
const router = express.Router();
const controller = require('../controllers/role.controller');
const { authenticateUser, authorizeAdminOnly } = require('../middlewares/auth.middleware');
const { authorizePermission } = require('../middlewares/permission.middleware');
const logAction = require('../middlewares/log.middleware');

// Lấy danh sách vai trò
router.get("/",
    authenticateUser,
    authorizePermission("ROLE_VIEW"), 
    logAction('Lấy danh sách vai trò'),
    controller.index
);

// Lấy danh sách vai trò
router.get("/get-all",
    authenticateUser,
    logAction('Lấy danh sách vai trò'),
    controller.getAll
);

// Tạo vai trò mới
router.post("/create",
    authenticateUser,
    authorizePermission("ROLE_CREATE"),
    logAction('Tạo vai trò mới'),
    controller.createRole
);

// Cập nhật vai trò
router.patch("/update/:id_vai_tro",
    authenticateUser,
    authorizePermission("ROLE_UPDATE"),
    logAction('Cập nhật vai trò'),
    controller.updateRole
);

// Xem chi tiết vai trò
router.get("/detail/:id_vai_tro",
    authenticateUser,
    authorizePermission("ROLE_DETAIL"),
    logAction('Xem chi tiết vai trò'),
    controller.detailRole
);

// Xóa vai trò
router.delete("/delete/:id_vai_tro",
    authenticateUser,
    authorizePermission("ROLE_DELETE"),
    logAction('Xóa vai trò'),
    controller.deleteRole
);

// Cập nhật quyền cho vai trò
router.post("/permissions/:id_vai_tro",
    authenticateUser,
    authorizeAdminOnly,
    authorizePermission("ROLE_PERMISSION"),
    logAction('Cập nhật quyền cho vai trò'),
    controller.updateRolePermission
);


router.get("/permissions-table", 
    authenticateUser,
    authorizePermission("ROLE_VIEW"), 
    logAction("Xem bảng phân quyền"),
    controller.getPermissionsTable
);

module.exports = router;
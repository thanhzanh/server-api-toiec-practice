const express = require('express');
const router = express.Router();

const controller = require('../controllers/user.controller');
const { authenticateUser, authorizeRole } = require('../middlewares/auth.middleware');
const { authorizePermission } = require('../middlewares/permission.middleware');
const validate = require('../middlewares/validate.middleware');

const { uploadCloudinary } = require('../middlewares/upload.middleware');
const logAction = require('../middlewares/log.middleware');

// Lấy danh sách tất cả người dùng tìm kiếm, phân trang (quản trị viên)
router.get("/", 
    authenticateUser, 
    authorizePermission("USER_VIEW"),
    logAction('Lấy danh sách tất cả người dùng'),
    controller.index
);

// Lấy thông tin một người dùng (quản trị viên)
router.get("/detail/:id_nguoi_dung", 
    authenticateUser, 
    authorizePermission("USER_DETAIL"), 
    logAction('Lấy thông tin một người dùng'),
    controller.detailUser
);

// Lấy thông tin một người dùng (Thông tin tài khoản cá nhân)
router.get("/detail-admin/:id_nguoi_dung", 
    authenticateUser, 
    logAction('Lấy thông tin một người dùng'),
    controller.detailAdmin
);

// Xóa tài khoản người dùng (quản trị viên)
router.delete("/delete/:id_nguoi_dung", 
    authenticateUser, 
    authorizePermission("USER_DELETE"),
    logAction('Xóa tài khoản người dùng (xóa mềm)'),
    controller.deleteUser
);

// Sửa tài khoản người dùng (quản trị viên)
router.patch("/edit/:id_nguoi_dung", 
    authenticateUser, 
    authorizePermission("USER_UPDATE"),
    uploadCloudinary([{ name: 'hinh_dai_dien', type: 'image' }]),
    validate.updateProfileValidation,
    logAction('Sửa tài khoản người dùng'),
    controller.editUser
);

// Cập nhật trạng thái người dùng (khong_hoat_dong = block)
router.put("/change-status/:id_nguoi_dung", 
    authenticateUser, 
    authorizePermission("USER_CHANGE_STATUS"),
    logAction('Cập nhật trạng thái người dùng'),
    controller.changeStatus
);

// Lấy thông tin tài khoản đăng nhập
router.get("/me", 
    authenticateUser, 
    logAction('Lấy thông tin tài khoản đăng nhập'),
    controller.getMe
);

// Cập nhật thông tin cá nhân người dùng 
router.patch("/update-profile",
    authenticateUser,
    uploadCloudinary([{ name: 'hinh_dai_dien', type: 'image' }]),
    validate.updateProfileValidation,
    logAction('Cập nhật thông tin cá nhân người dùng'),
    controller.updateProfile
);

// Lấy thông tin một người dùng
router.get("/profile", 
    authenticateUser, 
    logAction('Lấy thông tin một người dùng'),
    controller.getProfile
);

// Set vai_tro cho vào giao diện quản trị
router.patch("/set-role/:id_nguoi_dung", 
    authenticateUser, 
    authorizePermission("USER_SET_ROLE"),
    logAction('Set vai_tro cho vào giao diện quản trị'),
    controller.setUserRole
);

module.exports = router;
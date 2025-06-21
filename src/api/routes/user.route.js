const express = require('express');
const router = express.Router();

const controller = require('../controllers/user.controller');
const { authenticateUser, authorizeRole } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

const { uploadCloudinary } = require('../middlewares/upload.middleware');
const logAction = require('../middlewares/log.middleware');

// Lấy danh sách tất cả người dùng tìm kiếm, phân trang (quản trị viên)
router.get("/", 
    authenticateUser, 
    authorizeRole(["quan_tri_vien"]),
    logAction('Lấy danh sách tất cả người dùng'),
    controller.index
);

// Lấy thông tin một người dùng (quản trị viên)
router.get("/detail/:id_nguoi_dung", 
    authenticateUser, 
    authorizeRole(["quan_tri_vien"]), 
    logAction('Lấy thông tin một người dùng'),
    controller.detailUser
);

// Xóa tài khoản người dùng (quản trị viên)
router.delete("/delete/:id_nguoi_dung", 
    authenticateUser, 
    authorizeRole(["quan_tri_vien"]), 
    logAction('Xóa tài khoản người dùng (xóa mềm)'),
    controller.deleteUser
);

// Sửa tài khoản người dùng (quản trị viên)
router.put("/edit/:id_nguoi_dung", 
    authenticateUser, 
    authorizeRole(["quan_tri_vien"]), 
    uploadCloudinary([{ name: 'hinh_dai_dien', type: 'image' }]),
    validate.updateProfileValidation,
    logAction('Sửa tài khoản người dùng'),
    controller.editUser
);

// Cập nhật trạng thái người dùng (khong_hoat_dong = block)
router.put("/change-status/:id_nguoi_dung", 
    authenticateUser, 
    authorizeRole(["quan_tri_vien"]), 
    logAction('Cập nhật trạng thái người dùng'),
    controller.changeStatus
);

// Lấy thông tin tài khoản đăng nhập
router.get("/me", 
    authenticateUser, 
    authorizeRole(["quan_tri_vien", "nguoi_dung"]), 
    logAction('Lấy thông tin tài khoản đăng nhập'),
    controller.getMe
);

// Cập nhật thông tin cá nhân người dùng 
router.put("/update-profile",
    authenticateUser,
    authorizeRole(["nguoi_dung"]),
    uploadCloudinary([{ name: 'hinh_dai_dien', type: 'image' }]),
    validate.updateProfileValidation,
    logAction('Cập nhật thông tin cá nhân người dùng'),
    controller.updateProfile
);

// Lấy thông tin một người dùng
router.get("/profile", 
    authenticateUser, 
    authorizeRole(["nguoi_dung"]), 
    logAction('Lấy thông tin một người dùng'),
    controller.getProfile
);

module.exports = router;
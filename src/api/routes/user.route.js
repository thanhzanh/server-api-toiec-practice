const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const controller = require('../controllers/user.controller');
const { authenticateUser, authorizeRole } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

const uploadCloud = require('../middlewares/uploadCloud.middleware');

// Lấy danh sách tất cả người dùng tìm kiếm, phân trang (quản trị viên)
router.get("/", authenticateUser, authorizeRole(["quan_tri_vien"]), controller.index);

// Lấy thông tin một người dùng (quản trị viên)
router.get("/detail/:id_nguoi_dung", authenticateUser, authorizeRole(["quan_tri_vien"]), controller.detailUser);

// Xóa tài khoản người dùng (quản trị viên)
router.delete("/delete/:id_nguoi_dung", authenticateUser, authorizeRole(["quan_tri_vien"]), controller.deleteUser);

// Sửa tài khoản người dùng (quản trị viên)
router.put("/edit/:id_nguoi_dung", authenticateUser, authorizeRole(["quan_tri_vien"]), controller.editUser);

// Cập nhật trạng thái người dùng (khong_hoat_dong = block)
router.put("/change-status/:id_nguoi_dung", authenticateUser, authorizeRole(["quan_tri_vien"]), controller.changeStatus);

// Lấy thông tin tài khoản đăng nhập
router.get("/me", authenticateUser, authorizeRole(["quan_tri_vien", "nguoi_dung"]), controller.getMe);

// Cập nhật thông tin cá nhân người dùng 
router.put("/update-profile",
    authenticateUser,
    authorizeRole(["nguoi_dung"]),
    upload.single("url_hinh_dai_dien"),
    uploadCloud.upload,
    validate.updateProfileValidation,
    controller.updateProfile
);

// Lấy thông tin một người dùng
router.get("/profile", authenticateUser, authorizeRole(["nguoi_dung"]), controller.getProfile);

module.exports = router;
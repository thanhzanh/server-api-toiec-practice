const express = require('express');
const router = express.Router();

const controller = require('../controllers/user.controller');
const { authenticateUser, authorizeRole } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

// Lấy danh sách tất cả người dùng (quản trị viên)
router.get("/", authenticateUser, authorizeRole(["quan_tri_vien"]), controller.getAllUsers);

// Lấy thông tin tài khoản đăng nhập
router.get("/me", authenticateUser, authorizeRole(["quan_tri_vien", "nguoi_dung"]), controller.getMe);

// Xóa tài khoản người dùng (quản trị viên)
router.delete("/delete/:id_nguoi_dung", authenticateUser, authorizeRole(["quan_tri_vien"]), controller.deleteUser);

// Cập nhật trạng thái người dùng (khong_hoat_dong = block)
router.put("/change-status/:id_nguoi_dung", authenticateUser, authorizeRole(["quan_tri_vien"]), controller.changeStatus);

// Cập nhật thông tin cá nhân người dùng 
router.put("/update-profile", authenticateUser, authorizeRole(["nguoi_dung"]), validate.updateProfileValidation, controller.updateProfile);

module.exports = router;
const express = require('express');
const router = express.Router();

const controller = require('../controllers/blog.controller');
const { authenticateUser } = require('../middlewares/auth.middleware');
const { authorizePermission } = require('../middlewares/permission.middleware');
const { uploadCloudinary } = require('../middlewares/upload.middleware');
const logAction = require('../middlewares/log.middleware');

// ============================== API NGƯỜI DÙNG ==============================
// Người dùng tạo bài viết bài viết
router.post("/create", 
    authenticateUser, 
    uploadCloudinary([{ name: 'hinh_anh', type: 'image' }]),
    logAction('Người dùng tạo bài viết bài viết'),
    controller.createUserBlog
);

// Lấy tất cả bài viết của người dùng
router.get("/user",
    authenticateUser, 
    logAction('Lấy tất cả bài viết của người dùng'),
    controller.getUserBlogs
);

// Người dùng chỉnh sửa bài viết bài viết khi bài viết đã được phê duyệt
router.patch("/update/:id_bai_viet", 
    authenticateUser, 
    uploadCloudinary([{ name: 'hinh_anh', type: 'image' }]),
    logAction('Người dùng chỉnh sửa bài viết bài viết khi bài viết đã được phê duyệt'),
    controller.updateUserBlog
);

// ============================== API QUẢN TRỊ VIÊN ==============================


module.exports = router;
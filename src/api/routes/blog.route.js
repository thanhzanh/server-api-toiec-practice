const express = require('express');
const router = express.Router();

const controller = require('../controllers/blog.controller');
const { authenticateUser } = require('../middlewares/auth.middleware');
const { authorizePermission } = require('../middlewares/permission.middleware');
const { uploadCloudinary } = require('../middlewares/upload.middleware');
const logAction = require('../middlewares/log.middleware');

// ============================== API NGƯỜI DÙNG ==============================
// Người dùng tạo bài viết
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

// Người dùng chỉnh sửa bài viết khi bài viết đã được phê duyệt
router.patch("/update/:id_bai_viet", 
    authenticateUser, 
    uploadCloudinary([{ name: 'hinh_anh', type: 'image' }]),
    logAction('Người dùng chỉnh sửa bài viết bài viết khi bài viết đã được phê duyệt'),
    controller.updateUserBlog
);

// Người dùng gỡ bài viết
router.delete("/delete/:id_bai_viet", 
    authenticateUser, 
    logAction('Người dùng gỡ bài viết'),
    controller.deleteUserBlog
);

// Xem chi tiết bài viết của người dùng
router.get("/detail/:id_bai_viet",
    authenticateUser, 
    logAction('Xem chi tiết bài viết của người dùng'),
    controller.getUserBlogsDetail
);

// ============================== API QUẢN TRỊ VIÊN ==============================
// Lấy tất cả danh sách bài viết chờ phê duyệt
router.get("/pending",
    authenticateUser, 
    logAction('Lấy tất cả danh sách bài viết chờ phê duyệt'),
    controller.getAdminPendingBlogs
);

module.exports = router;
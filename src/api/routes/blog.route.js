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

// Lấy tất cả bài viết hiển thị ngoài blog
router.get("/public",
    logAction('Lấy tất cả bài viết của người dùng'),
    controller.getPublicBlogs
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
// Quản trị viên lấy tất cả danh sách bài viết chờ phê duyệt
router.get("/pending",
    authenticateUser, 
    authorizePermission('BLOG_VIEW'),
    logAction('Lấy tất cả danh sách bài viết chờ phê duyệt'),
    controller.getAdminPendingBlogs
);

// Quản trị viên lấy tất cả danh sách bài viết
router.get("/",
    authenticateUser, 
    authorizePermission('BLOG_VIEW'),
    logAction('Lấy tất cả danh sách bài viết'),
    controller.index
)

// Quản trị viên phê duyệt bài viết
router.patch("/approve/:id_bai_viet", 
    authenticateUser, 
    authorizePermission('BLOG_APPROVE'),
    logAction('Quản trị viên phê duyệt bài viết'),
    controller.approveAdminBlog
);

// Quản trị viên từ chối bài viết
router.patch("/reject/:id_bai_viet",    
    authenticateUser, 
    authorizePermission('BLOG_REJECT'),
    logAction('Quản trị viên từ chối bài viết'),
    controller.rejectAdminBlog
);

// Quản trị viên xóa bài viết
router.delete("/admin-delete/:id_bai_viet",   
    authenticateUser, 
    authorizePermission('BLOG_DELETE'),
    logAction('Quản trị viên xóa bài viết'),
    controller.deleteAdminBlog
);

// Quản trị viên lấy chi tiết bài viết
router.get("/admin-detail/:id_bai_viet",    
    authenticateUser, 
    authorizePermission('BLOG_DETAIL'),
    logAction('Quản trị viên lấy chi tiết bài viết'),
    controller.getAdminBlogsDetail
);

// Quản trị viên chỉnh sửa bài viết
router.patch("/admin-update/:id_bai_viet",  
    authenticateUser, 
    authorizePermission('BLOG_UPDATE'),
    uploadCloudinary([{ name: 'hinh_anh', type: 'image' }]),
    logAction('Quản trị viên chỉnh sửa bài viết'),
    controller.updateAdminBlog
);

module.exports = router;
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
    controller.createBlog
);

// Lấy tất cả bài viết của người dùng
router.get("/user",
    authenticateUser, 
    logAction('Lấy tất cả bài viết của người dùng'),
    controller.getUserBlogs
);




module.exports = router;
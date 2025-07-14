const express = require('express');
const router = express.Router();

const controller = require('../controllers/comment.controller');
const { authenticateUser } = require('../middlewares/auth.middleware');
const { authorizePermission } = require('../middlewares/permission.middleware');

// Người dùng tạo mới bình luận
router.post("/create", 
    authenticateUser, 
    controller.createComment
);

// Lấy danh sách bình luận bài viết kèm phản hồi
router.get("/list/:id_bai_viet", 
    authenticateUser, 
    controller.getCommentsByBlogId
);

module.exports = router;
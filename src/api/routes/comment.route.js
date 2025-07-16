const express = require('express');
const router = express.Router();

const controller = require('../controllers/comment.controller');
const { authenticateUser } = require('../middlewares/auth.middleware');

// Người dùng tạo mới bình luận
router.post("/create", 
    authenticateUser, 
    controller.createComment
);

// Lấy danh sách bình luận bài viết kèm phản hồi
router.get("/list/:id_bai_viet", 
    controller.getCommentsByBlogId
);

// Cập nhật bình luận
router.patch("/update/:id_binh_luan", 
    authenticateUser, 
    controller.updateComment
);

// Xoá bình luận
router.delete("/delete/:id_binh_luan", 
    authenticateUser, 
    controller.deleteComment
);

module.exports = router;
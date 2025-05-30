const express = require('express');
const router = express.Router();
const { upload } = require('../middlewares/uploadCloud.middleware');
const controller = require('../controllers/question.controller');
const { authenticateUser, authorizeRole } = require('../middlewares/auth.middleware');

// Lấy tất cả danh sách câu hỏi theo phần
router.get("/", authenticateUser, authorizeRole(["quan_tri_vien"]), controller.index);

// Tạo câu hỏi thủ công nhập tay
router.post("/create", authenticateUser, authorizeRole(['quan_tri_vien']), upload, controller.create);

module.exports = router;
const express = require('express');
const router = express.Router();
const { uploadCloudinary } = require('../middlewares/upload.middleware');
const controller = require('../controllers/question.controller');
const { authenticateUser, authorizeRole } = require('../middlewares/auth.middleware');

// Lấy tất cả danh sách câu hỏi theo phần
router.get("/", authenticateUser, authorizeRole(["quan_tri_vien"]), controller.index);

// Tạo câu hỏi thủ công nhập tay
router.post("/create", 
    authenticateUser, 
    authorizeRole(['quan_tri_vien']), 
    uploadCloudinary([{ name: 'hinh_anh', type: 'image' }, { name: 'am_thanh', type: 'video' }]), 
    controller.create
);

// Xem chi tiết 1 câu hỏi
router.get("/detail/:id_cau_hoi", authenticateUser, authorizeRole(['quan_tri_vien']), controller.detail);

// Xóa câu hỏi
router.delete("/delete/:id_cau_hoi", authenticateUser, authorizeRole(["quan_tri_vien"]), controller.delete);

module.exports = router;
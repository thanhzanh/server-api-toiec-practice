const express = require('express');
const router = express.Router();

const controller = require('../controllers/passage.controller');
const { authenticateUser, authorizeRole } = require('../middlewares/auth.middleware');

// Lấy tất cả danh sách đoạn văn
router.get("/", authenticateUser, authorizeRole(["quan_tri_vien"]), controller.index);

// Tạo đoạn văn mới
router.post("/create", authenticateUser, authorizeRole(["quan_tri_vien"]), controller.create);

// Chỉnh sửa đoạn văn
router.put("/edit/:id_doan_van", authenticateUser, authorizeRole(["quan_tri_vien"]), controller.edit);

// Xóa đoạn văn
router.delete("/delete/:id_doan_van", authenticateUser, authorizeRole(["quan_tri_vien"]), controller.delete);

module.exports = router;
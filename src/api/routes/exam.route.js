const express = require('express');
const router = express.Router();
const controller = require('../controllers/exam.controller');
const { authenticateUser, authorizeRole } = require('../middlewares/auth.middleware');

// Tạo đề thi nháp (Bước 1)
router.post("/create", authenticateUser, authorizeRole(["quan_tri_vien"]), controller.createExam);

// Lấy ngân hàng câu hỏi của đề thi (Bước 2)
router.get("/questions", authenticateUser, authorizeRole(["quan_tri_vien"]), controller.getQuestions);

// Thêm câu hỏi vào bài thi (Bước 3)
router.post("/questions/add-questions/:id_bai_thi", authenticateUser, authorizeRole(["quan_tri_vien"]), controller.addQuestionsToExam);

// Xem bản nháp thông tin đề thi và tất cả câu hỏi của đề thi (Bước 4)
router.get("/draft/:id_bai_thi", authenticateUser, authorizeRole(["quan_tri_vien"]), controller.getDraftExam);

// Duyệt đề thi chuyển trạng thái da_xuat_ban (Bước 5)
router.post("/approve/:id_bai_thi", authenticateUser, authorizeRole(["quan_tri_vien"]), controller.approveExam);

module.exports = router;
const express = require('express');
const router = express.Router();
const controller = require('../controllers/exam.controller');
const { authenticateUser, authorizeRole } = require('../middlewares/auth.middleware');

// Tạo đề thi nháp (Bước 1: Nhập toàn bộ thông tin đề thi)
router.post("/create", authenticateUser, authorizeRole(["quan_tri_vien"]), controller.createExam);

// Lấy ngân hang câu hỏi của đề thi (Bước 2: )
router.get("/questions", authenticateUser, authorizeRole(["quan_tri_vien"]), controller.getQuestions);

// Thêm câu hỏi vào bài thi (Bước 3: )
router.post("/questions/add-questions/:id_bai_thi", authenticateUser, authorizeRole(["quan_tri_vien"]), controller.addQuestionsToExam);

module.exports = router;
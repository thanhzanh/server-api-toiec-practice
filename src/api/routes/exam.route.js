const express = require('express');
const router = express.Router();
const controller = require('../controllers/exam.controller');
const { authenticateUser, authorizeRole } = require('../middlewares/auth.middleware');
const logAction = require('../middlewares/log.middleware');

// Hiển thị danh sách đề thi
router.get("/", 
    authenticateUser, 
    authorizeRole("quan_tri_vien"), 
    logAction('Xem danh sách đề thi'), 
    controller.index
);

// Tạo đề thi nháp (Bước 1)
router.post("/create", 
    authenticateUser, 
    authorizeRole(["quan_tri_vien"]), 
    logAction('Tạo đề thi nháp'), 
    controller.createExam
);

// Lấy ngân hàng câu hỏi của đề thi (Bước 2)
router.get("/questions", 
    authenticateUser, 
    authorizeRole(["quan_tri_vien"]), 
    logAction('Mở ngân hàng câu hỏi để thêm câu hỏi vào đề thi'), 
    controller.getQuestions
);

// Thêm câu hỏi vào bài thi (Bước 3)
router.post("/questions/add-questions/:id_bai_thi", 
    authenticateUser, 
    authorizeRole(["quan_tri_vien"]),
    logAction('Thêm câu hỏi vào đề thi'), 
    controller.addQuestionsToExam
);

// Xem bản nháp thông tin đề thi và tất cả câu hỏi của đề thi (Bước 4)
router.get("/draft/:id_bai_thi", 
    authenticateUser, 
    authorizeRole(["quan_tri_vien"]), 
    logAction('Xem bản nháp thông tin đề thi và tất cả câu hỏi của đề thi'),
    controller.getDraftExam
);

// Duyệt đề thi chuyển trạng thái da_xuat_ban (Bước 5)
router.post("/approve/:id_bai_thi", 
    authenticateUser, 
    authorizeRole(["quan_tri_vien"]), 
    logAction('Duyệt đề thi chuyển sang trạng thái da_xuat_ban'),
    controller.approveExam
);

// Xóa đề thi
router.delete("/delete/:id_bai_thi", 
    authenticateUser, 
    authorizeRole(["quan_tri_vien"]), 
    logAction('Xóa đề thi chuyển trạng thái da_xuat_ban sang luu_tru'),
    controller.deleteExam
);

// Sửa đề thi
router.put("/edit/:id_bai_thi", 
    authenticateUser, 
    authorizeRole(["quan_tri_vien"]), 
    logAction('Sửa đề thi'),
    controller.editExam
);

// Hiển thị danh sách đề thi ngoài người dùng
router.get("/get-all-exam-public", logAction('Hiển thị danh sách đề thi ngoài người dùng'), controller.getExamTest);

// Xem chi tiết đề thi ngoài người dùng
router.get("/detail-exam-public/:id_bai_thi", logAction('Xem chi tiết đề thi ngoài người dùng'), controller.detailExamTest);

// Lấy danh sách bài thi đầu vào
router.get("/get-exam-dau-vao", authenticateUser, authorizeRole(['quan_tri_vien']), logAction('Lấy danh sách bài thi đầu vào'), controller.getExamDauVao);

// Gỡ bài thi đầu vào
router.patch("/unset-entry-exam/:id_bai_thi", authenticateUser, authorizeRole(['quan_tri_vien']), logAction('Gỡ bài thi đầu vào'), controller.unsetEntryExam);

module.exports = router;
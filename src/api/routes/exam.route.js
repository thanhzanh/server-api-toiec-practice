const express = require('express');
const router = express.Router();
const controller = require('../controllers/exam.controller');
const { authenticateUser } = require('../middlewares/auth.middleware');
const { authorizePermission } = require('../middlewares/permission.middleware');
const logAction = require('../middlewares/log.middleware');

// Hiển thị danh sách đề thi
router.get("/", 
    authenticateUser, 
    authorizePermission("EXAM_VIEW"),
    logAction('Xem danh sách đề thi'), 
    controller.index
);

// Tạo đề thi nháp (Bước 1)
router.post("/create", 
    authenticateUser, 
    authorizePermission("EXAM_CREATE"),
    logAction('Tạo đề thi nháp'), 
    controller.createExam
);

// Lấy ngân hàng câu hỏi của đề thi (Bước 2)
router.get("/questions", 
    authenticateUser, 
    authorizePermission("QUESTION_VIEW"),
    logAction('Mở ngân hàng câu hỏi để thêm câu hỏi vào đề thi'), 
    controller.getQuestions
);

// Thêm câu hỏi vào bài thi (Bước 3)
router.post("/questions/add-questions/:id_bai_thi", 
    authenticateUser, 
    authorizePermission("EXAM_UPDATE"), 
    logAction('Thêm câu hỏi vào đề thi'), 
    controller.addQuestionsToExam
);

// Xem bản nháp thông tin đề thi và tất cả câu hỏi của đề thi (Bước 4)
router.get("/draft/:id_bai_thi", 
    authenticateUser, 
    logAction('Xem bản nháp thông tin đề thi và tất cả câu hỏi của đề thi'),
    controller.getDraftExam
);

// Duyệt đề thi chuyển trạng thái da_xuat_ban (Bước 5)
router.post("/approve/:id_bai_thi", 
    authenticateUser, 
    authorizePermission("EXAM_APPROVE"),
    logAction('Duyệt đề thi chuyển sang trạng thái da_xuat_ban'),
    controller.approveExam
);

// Xóa đề thi
router.delete("/delete/:id_bai_thi", 
    authenticateUser, 
    authorizePermission("EXAM_DELETE"),
    logAction('Xóa đề thi chuyển trạng thái da_xuat_ban sang luu_tru'),
    controller.deleteExam
);

// Sửa đề thi
router.put("/edit/:id_bai_thi", 
    authenticateUser, 
    authorizePermission("EXAM_UPDATE"), 
    logAction('Sửa đề thi'),
    controller.editExam
);

// Sửa câu hỏi trong đề thi
router.put("/questions/update-questions/:id_bai_thi",
    authenticateUser,
    authorizePermission("EXAM_UPDATE"),
    logAction('Sửa câu hỏi trong đề thi'),
    controller.updateQuestionsToExam
)

// Hiển thị danh sách đề thi ngoài công khai
router.get("/get-all-exam-public", 
    logAction('Hiển thị danh sách đề thi ngoài người dùng'), 
    controller.getExamTest
);

// Hiển thị danh sách đề thi người dùng đã đăng nhập
router.get("/get-all-exam-user", 
    authenticateUser,
    logAction('Hiển thị danh sách đề thi ngoài người dùng'), 
    controller.getExamTestUser
);

// Xem chi tiết đề thi ngoài người dùng
router.get("/detail-exam-public/:id_bai_thi", 
    logAction('Xem chi tiết đề thi ngoài người dùng'), 
    controller.detailExamTest
);

// Lấy danh sách bài thi đầu vào
router.get("/get-exam-dau-vao", 
    authenticateUser, 
    authorizePermission("EXAM_VIEW"), 
    logAction('Lấy danh sách bài thi đầu vào'), 
    controller.getExamDauVao
);

// Gỡ bài thi đầu vào
router.patch("/unset-entry-exam/:id_bai_thi", 
    authenticateUser, 
    authorizePermission("EXAM_UPDATE"),  
    logAction('Gỡ bài thi đầu vào'), 
    controller.unsetEntryExam
);

// Xem chi tiết bài thi đầu vào chỉ có 1 đề thi đầu vào duy nhất
router.get("/detail-entry-exam", 
    authenticateUser, 
    logAction('Xem chi tiết bài thi đầu vào'), 
    controller.getDetailEntryExam
);

// Kiểm tra đã làm bài thi đầu vào chưa
router.post("/check-entry-exam/:id_bai_thi",
    authenticateUser,
    controller.checkEntryExam
);

module.exports = router;
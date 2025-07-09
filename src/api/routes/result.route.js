const express = require('express');
const router = express.Router();
const controller = require('../controllers/result.controller');
const { authenticateUser, authorizeRole } = require('../middlewares/auth.middleware');
const { authorizePermission } = require('../middlewares/permission.middleware');
const logAction = require('../middlewares/log.middleware');

// ==================================== QUẢN TRỊ VIÊN ====================================
// Làm bài thi
router.post("/submit-exam",
    authenticateUser,
    logAction('Nộp bài thi'),
    controller.submitExam
);

router.post("/submit-from-fe-react",
    authenticateUser,
    logAction('Nộp bài thi'),
    controller.submitExamFromFE
);

// Lấy danh sách kết quả làm bài thi
router.get("/", 
    authenticateUser, 
    authorizePermission("RESULT_VIEW"), 
    logAction('Lấy danh sách kết quả làm bài thi'),
    controller.index
);

// Xem chi tiết kết quả làm bài thi
router.get("/detail/:id_bai_lam_nguoi_dung", 
    authenticateUser, 
    authorizePermission("RESULT_DETAIL"), 
    logAction('Xem chi tiết kết quả làm bài thi'),
    controller.detail
);

// Xem chi tiết kết quả làm bài thi theo part
router.get("/detail-part/:id_bai_lam_nguoi_dung/:part", 
    authenticateUser, 
    authorizePermission("RESULT_DETAIL"),
    logAction('Xem chi tiết kết quả làm bài thi theo Part'),
    controller.detailPart
);

// Xem chi tiết kết quả làm bài thi part 1
router.get("/detail-first/:id_bai_lam_nguoi_dung", 
    authenticateUser, 
    authorizePermission("RESULT_DETAIL"),
    logAction('Xem chi tiết kết quả làm bài thi Part 1'),
    controller.detailFirstPart
);

// ==================================== NGƯỜI DÙNG ====================================

// Lấy danh sách tất cả kết quả làm bài thi của người dùng
router.get("/get-all-exam-submit/:id_nguoi_dung", 
    authenticateUser, 
    logAction('Lấy danh sách tất cả kết quả làm bài thi của người dùng'),
    controller.getAllExamSubmit
);

// Xem chi tiết kết quả làm bài thi theo part
router.get("/detail-part-user/:id_bai_lam_nguoi_dung/:part", 
    authenticateUser, 
    logAction('Xem chi tiết kết quả làm bài thi theo Part'),
    controller.detailPartUser
);

// Xem chi tiết kết quả làm bài thi part 1
router.get("/detail-first-user/:id_bai_lam_nguoi_dung", 
    authenticateUser, 
    logAction('Xem chi tiết kết quả làm bài thi Part 1'),
    controller.detailFirstPartUser
);


module.exports = router;
const express = require('express');
const router = express.Router();
const controller = require('../controllers/result.controller');
const { authenticateUser, authorizeRole } = require('../middlewares/auth.middleware');
const logAction = require('../middlewares/log.middleware');

// Làm bài thi
router.post("/submit-exam",
    authenticateUser,
    authorizeRole(["nguoi_dung"]), 
    logAction('Nộp bài thi'),
    controller.submitExam
);

router.post("/submit-from-fe-react",
    authenticateUser,
    authorizeRole(["nguoi_dung"]), 
    logAction('Nộp bài thi'),
    controller.submitExamFromFE
);

// Lấy danh sách kết quả làm bài thi
router.get("/", 
    authenticateUser, 
    authorizeRole(["quan_tri_vien"]), 
    logAction('Lấy danh sách kết quả làm bài thi'),
    controller.index
);

// Lấy danh sách tất cả kết quả làm bài thi của người dùng
router.get("/get-all-exam-submit/:id_nguoi_dung", 
    authenticateUser, 
    authorizeRole(["nguoi_dung"]), 
    logAction('Lấy danh sách tất cả kết quả làm bài thi của người dùng'),
    controller.getAllExamSubmit
);

// Xem chi tiết kết quả làm bài thi
router.get("/detail/:id_bai_lam_nguoi_dung", 
    authenticateUser, 
    authorizeRole(["quan_tri_vien", "nguoi_dung"]), 
    logAction('Xem chi tiết kết quả làm bài thi'),
    controller.detail
);

module.exports = router;
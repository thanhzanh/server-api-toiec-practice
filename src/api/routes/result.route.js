const express = require('express');
const router = express.Router();
const controller = require('../controllers/result.controller');
const { authenticateUser, authorizeRole } = require('../middlewares/auth.middleware');
const logAction = require('../middlewares/log.middleware');

// Làm bài thi
router.post("/submit-exam",
    authenticateUser,
    authorizeRole(["quan_tri_vien", "nguoi_dung"]), 
    logAction('Nộp bài thi'),
    controller.submitExam
);

// Lấy danh sách kết quả làm bài thi
router.get("/", 
    authenticateUser, 
    authorizeRole(["quan_tri_vien", "nguoi_dung"]), 
    logAction('Lấy danh sách kết quả làm bài thi'),
    controller.index
);

// Xem chi tiết kết quả làm bài thi
router.get("/detail/:id_bai_lam_nguoi_dung", 
    authenticateUser, 
    authorizeRole(["quan_tri_vien", "nguoi_dung"]), 
    logAction('Xem chi tiết kết quả làm bài thi'),
    controller.detail
);

module.exports = router;
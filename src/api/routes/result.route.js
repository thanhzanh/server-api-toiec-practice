const express = require('express');
const router = express.Router();
const controller = require('../controllers/result.controller');
const { authenticateUser, authorizeRole } = require('../middlewares/auth.middleware');
const logAction = require('../middlewares/log.middleware');

// Làm bài thi
router.post("/submit-exam",
    authenticateUser,
    authorizeRole(["quan_tri_vien"]),
    logAction('Nộp bài thi'),
    controller.submitExam
);

// Lấy danh sách kết quả làm bài thi
router.get("/", 
    authenticateUser, 
    authorizeRole(["quan_tri_vien"]), 
    logAction('Lấy danh sách kết quả làm bài thi'),
    controller.index
);

module.exports = router;
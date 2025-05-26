const express = require('express');
const router = express.Router();

const controller = require('../controllers/question.controller');
const { authenticateUser, authorizeRole } = require('../middlewares/auth.middleware');

// Lấy tất cả danh sách câu hỏi theo phần
router.get("/", authenticateUser, authorizeRole(["quan_tri_vien"]), controller.getAllQuestions);

module.exports = router;
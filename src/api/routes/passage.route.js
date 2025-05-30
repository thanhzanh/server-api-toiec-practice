const express = require('express');
const router = express.Router();

const controller = require('../controllers/passage.controller');
const { authenticateUser, authorizeRole } = require('../middlewares/auth.middleware');

// Lấy tất cả danh sách đoạn văn
router.get("/", authenticateUser, authorizeRole(["quan_tri_vien"]), controller.index);

module.exports = router;
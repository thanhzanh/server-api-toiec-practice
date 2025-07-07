const express = require('express');
const router = express.Router();

const controller = require('../controllers/category.controller');
const { authenticateUser } = require('../middlewares/auth.middleware');
const { authorizePermission } = require('../middlewares/permission.middleware');
const { uploadCloudinary } = require('../middlewares/upload.middleware');
const logAction = require('../middlewares/log.middleware');

// Lấy tất cả danh sách danh mục bài viết
router.get("/", 
    authenticateUser, 
    logAction('Xem danh sách danh mục bài viết'),
    controller.index
);

// Tạo danh mục bài viết
router.post("/create", 
    authenticateUser, 
    logAction('Tạo danh mục bài viết'),
    controller.create
);

module.exports = router;
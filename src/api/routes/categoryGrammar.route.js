const express = require('express');
const router = express.Router();

const controller = require('../controllers/categoryGrammar.controller');
const { authenticateUser } = require('../middlewares/auth.middleware');
const { authorizePermission } = require('../middlewares/permission.middleware');
const logAction = require('../middlewares/log.middleware');

// Lấy tất cả danh sách danh mục ngữ pháp
router.get("/", 
    authenticateUser, 
    logAction('Xem danh sách danh mục ngữ pháp'),
    controller.index
);

// Tạo danh mục ngữ pháp
router.post("/create", 
    authenticateUser, 
    logAction('Tạo danh mục ngữ pháp'),
    controller.createCategory
);


module.exports = router;
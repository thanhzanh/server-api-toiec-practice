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
    controller.createCategory
);

// Cập nhật danh mục bài viết
router.patch("/update/:id_danh_muc", 
    authenticateUser, 
    logAction('Cập nhật danh mục bài viết'),
    controller.updateCategory
);

// Xóa danh mục bài viết
router.delete("/delete/:id_danh_muc", 
    authenticateUser, 
    logAction('Xóa danh mục bài viết'),
    controller.deleteCategory
);

// Xem danh mục bài viết
router.get("/detail/:id_danh_muc", 
    authenticateUser, 
    logAction('Xem danh mục bài viết'),
    controller.detailCategory
);

module.exports = router;
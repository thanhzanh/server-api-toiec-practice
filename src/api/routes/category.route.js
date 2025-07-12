const express = require('express');
const router = express.Router();

const controller = require('../controllers/category.controller');
const { authenticateUser } = require('../middlewares/auth.middleware');
const { authorizePermission } = require('../middlewares/permission.middleware');
const logAction = require('../middlewares/log.middleware');

// Lấy tất cả danh sách danh mục bài viết
router.get("/", 
    authenticateUser, 
    authorizePermission("CATEGORY_VIEW"),
    logAction('Xem danh sách danh mục bài viết'),
    controller.index
);

// Tạo danh mục bài viết
router.post("/create", 
    authenticateUser, 
    authorizePermission("CATEGORY_CREATE"),
    logAction('Tạo danh mục bài viết'),
    controller.createCategory
);

// Cập nhật danh mục bài viết
router.patch("/update/:id_danh_muc", 
    authenticateUser, 
    authorizePermission("CATEGORY_UPDATE"),
    logAction('Cập nhật danh mục bài viết'),
    controller.updateCategory
);

// Xóa danh mục bài viết
router.delete("/delete/:id_danh_muc", 
    authenticateUser, 
    authorizePermission("CATEGORY_DELETE"),
    logAction('Xóa danh mục bài viết'),
    controller.deleteCategory
);

// Xem danh mục bài viết
router.get("/detail/:id_danh_muc", 
    authenticateUser, 
    authorizePermission("CATEGORY_DETAIL"),
    logAction('Xem danh mục bài viết'),
    controller.detailCategory
);

// Lấy tất cả danh sách danh mục bài viết hiển thị trên trang chủ
router.get("/get-all-categorys", 
    authenticateUser, 
    controller.getAllCategorys
);

module.exports = router;
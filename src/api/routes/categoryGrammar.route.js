const express = require('express');
const router = express.Router();

const controller = require('../controllers/categoryGrammar.controller');
const { authenticateUser } = require('../middlewares/auth.middleware');
const { authorizePermission } = require('../middlewares/permission.middleware');
const logAction = require('../middlewares/log.middleware');

// Quản trị viên lấy tất cả danh sách danh mục ngữ pháp
router.get("/", 
    authenticateUser, 
    logAction('Xem danh sách danh mục ngữ pháp'),
    controller.index
);

// Quản trị viên tạo danh mục ngữ pháp
router.post("/create", 
    authenticateUser, 
    logAction('Tạo danh mục ngữ pháp'),
    controller.createCategory
);

// Quản trị viên chỉnh sửa danh mục ngữ pháp
router.patch("/update/:id_danh_muc", 
    authenticateUser, 
    logAction('Chỉnh sửa danh mục ngữ pháp'),
    controller.updateCategory
);

// Quản trị viên xóa danh mục ngữ pháp
router.delete("/delete/:id_danh_muc", 
    authenticateUser, 
    logAction('á danh mục ngữ pháp'),
    controller.deleteCategory
);

// Quản trị viên xem chi tiết danh mục ngữ pháp
router.get("/detail/:id_danh_muc", 
    authenticateUser, 
    logAction('Xem chi tiết danh mục ngữ pháp'),
    controller.detailCategory
);

// Lấy tất cả danh sách danh mục bài viết hiển thị trên trang chủ
router.get("/get-all-categorys-grammars", 
    authenticateUser, 
    controller.getAllCategorys
);


module.exports = router;
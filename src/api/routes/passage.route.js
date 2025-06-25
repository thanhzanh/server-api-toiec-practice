const express = require('express');
const router = express.Router();

const controller = require('../controllers/passage.controller');
const { authenticateUser, authorizeRole } = require('../middlewares/auth.middleware');
const { uploadCloudinary } = require('../middlewares/upload.middleware');
const logAction = require('../middlewares/log.middleware');

// Lấy tất cả danh sách đoạn văn
router.get("/", 
    authenticateUser, 
    authorizeRole(["quan_tri_vien"]), 
    logAction('Xem danh sách đoạn văn'),
    controller.index
);

// Tạo đoạn văn mới
router.post("/create", 
    authenticateUser, 
    authorizeRole(["quan_tri_vien"]), 
    uploadCloudinary([{ name: 'hinh_anh', type: 'image' }]),
    logAction('Tạo đoạn văn mới'),
    controller.create
);

// Chỉnh sửa đoạn văn
router.put("/edit/:id_doan_van", 
    authenticateUser, 
    authorizeRole(["quan_tri_vien"]), 
    logAction('Chỉnh sửa đoạn văn'),
    controller.edit
);

// Xóa đoạn văn
router.delete("/delete/:id_doan_van", 
    authenticateUser, 
    authorizeRole(["quan_tri_vien"]), 
    logAction('Xóa đoạn văn'),
    controller.delete
);

// Xem chi tiết đoạn văn
router.get("/detail/:id_doan_van", 
    authenticateUser, 
    authorizeRole(["quan_tri_vien"]), 
    logAction('Xem chi tiết 1 đoạn văn'),
    controller.detail
);

module.exports = router;
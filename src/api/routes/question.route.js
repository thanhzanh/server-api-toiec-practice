const express = require('express');
const router = express.Router();
const controller = require('../controllers/question.controller');
const { uploadCloudinary } = require('../middlewares/upload.middleware');
const upLoadExcel = require('../middlewares/uploadExcel.middleware');
const { authenticateUser } = require('../middlewares/auth.middleware');
const { authorizePermission } = require('../middlewares/permission.middleware');
const logAction = require('../middlewares/log.middleware');

// Lấy tất cả danh sách câu hỏi theo phần
router.get("/", 
    authenticateUser, 
    authorizePermission("QUESTION_VIEW"), 
    logAction('Lấy tất cả danh sách câu hỏi theo phần'),
    controller.index
);

// Tạo câu hỏi thủ công nhập tay
router.post("/create", 
    authenticateUser, 
    authorizePermission("QUESTION_CREATE"), 
    uploadCloudinary([{ name: 'hinh_anh', type: 'image' }, { name: 'am_thanh', type: 'video' }]), 
    logAction('Tạo câu hỏi thủ công bằng tay'),
    controller.create
);

// Import câu hỏi bằng file excel
router.post("/import-excel",
    authenticateUser,
    authorizePermission("QUESTION_IMPORT"),
    upLoadExcel.single('file'),
    controller.importExcel
);

// Xem chi tiết 1 câu hỏi
router.get("/detail/:id_cau_hoi", 
    authenticateUser, 
    authorizePermission("QUESTION_DETAIL"), 
    logAction('Xem chi tiết một câu hỏi'),
    controller.detail
);

// Xóa câu hỏi
router.delete("/delete/:id_cau_hoi", 
    authenticateUser, 
    authorizePermission("QUESTION_DELETE"), 
    logAction('Xóa câu hỏi (xóa mềm)'),
    controller.delete
);

// Chỉnh sửa câu hỏi
router.put("/edit/:id_cau_hoi", 
    authenticateUser, 
    authorizePermission("QUESTION_UPDATE"), 
    uploadCloudinary([{ name: 'hinh_anh', type: 'image' }, { name: 'am_thanh', type: 'video' }]), 
    logAction('Chỉnh sửa câu hỏi'),
    controller.edit
);

module.exports = router;
const express = require('express');
const router = express.Router();

const controller = require('../controllers/grammar.controller');
const { authenticateUser } = require('../middlewares/auth.middleware');
const { authorizePermission } = require('../middlewares/permission.middleware');
const logAction = require('../middlewares/log.middleware');

// Quản trị viên xem danh sách ngữ pháp
router.get("/", 
    authenticateUser, 
    authorizePermission('GRAMMAR_VIEW'),
    logAction('Xem danh sách ngữ pháp'),
    controller.index
);

// Quản trị viên tạo mới ngữ pháp
router.post("/create", 
    authenticateUser, 
    authorizePermission('GRAMMAR_CREATE'),
    logAction('Tạo mới ngữ pháp'),
    controller.createGrammar
);

// Quản trị viên xem chi tiết danh sách ngữ pháp
router.get("/detail/:id_tai_lieu", 
    authenticateUser, 
    authorizePermission('GRAMMAR_VIEW'),
    logAction('Xem chi tiết ngữ pháp'),
    controller.detailGrammar
);

// Quan trị viên cập nhật ngữ pháp
router.put("/update/:id_tai_lieu",  
    authenticateUser, 
    authorizePermission('GRAMMAR_UPDATE'),
    logAction('Cập nhật ngữ pháp'),
    controller.updateGrammar
);

// Quản trị viên xóa ngữ pháp
router.delete("/delete/:id_tai_lieu", 
    authenticateUser, 
    authorizePermission('GRAMMAR_DELETE'),
    logAction('Xóa ngữ pháp'),
    controller.deleteGrammar
);

// Lấy danh sách ngữ pháp hiển thị trên trang chủ hiển thị theo danh mục
router.get("/home",  
    logAction('Lấy danh sách ngữ pháp hiển thị trên trang chủ'),
    controller.getHomeGrammars
);


module.exports = router;
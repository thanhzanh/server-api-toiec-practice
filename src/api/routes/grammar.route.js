const express = require('express');
const router = express.Router();

const controller = require('../controllers/grammar.controller');
const { authenticateUser } = require('../middlewares/auth.middleware');
const { authorizePermission } = require('../middlewares/permission.middleware');
const logAction = require('../middlewares/log.middleware');


// Quản trị viên tạo mới ngữ pháp
router.post("/create", 
    authenticateUser, 
    logAction('Tạo mới ngữ pháp'),
    controller.createGrammar
);

// Quản trị viên xem chi tiết danh sách ngữ pháp
router.get("/detail/:id_tai_lieu", 
    authenticateUser, 
    logAction('Xem chi tiết ngữ pháp'),
    controller.detailGrammar
);

// Quan trị viên cập nhật ngữ pháp
router.put("/update/:id_tai_lieu",  
    authenticateUser, 
    logAction('Cập nhật ngữ pháp'),
    controller.updateGrammar
);


module.exports = router;
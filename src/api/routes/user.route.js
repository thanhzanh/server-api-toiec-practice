const express = require('express');
const router = express.Router();

const controller = require('../controllers/user.controller');
const { authenticateUser, authorizeRole } = require('../middlewares/auth.middleware');

router.get("/", authenticateUser, authorizeRole(["quan_tri_vien"]), controller.getAllUsers);

module.exports = router;
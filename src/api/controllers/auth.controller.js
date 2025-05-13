const NguoiDung = require("../../models/nguoiDung.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config();

// [POST] /api/users/register
module.exports.register = async(req, res) => {
    const { email, ten_dang_nhap, mat_khau, vai_tro } = req.body;

    // Kiểm tra email và ten_dang_nhap
    const existingUser = await NguoiDung.findOne({ where: { email } }) || await NguoiDung.findOne({ where: { ten_dang_nhap } });
    if (existingUser) {
        return res.status(409).json({
            message: "Email hoặc tên đăng nhập đã tồn tại"
        });
    }

    // Mã hóa mật khẩu
    const hashPassword = bcrypt.hashSync(mat_khau, 10);

    // Đăng ký tài khoản người dùng
    await NguoiDung.create({
        email,
        ten_dang_nhap,
        mat_khau: hashPassword,
        vai_tro: vai_tro || 'nguoi_dung'
    });

    res.status(201).json({ message: "Tạo tài khoản thành công" });
};

// [POST] /api/users/login
module.exports.login = async(req, res) => {
    return res.json({
        code: 200
    });
};
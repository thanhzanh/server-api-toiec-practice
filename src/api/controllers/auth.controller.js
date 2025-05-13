const NguoiDung = require("../../models/nguoiDung.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { where } = require("sequelize");
require('dotenv').config();

// [POST] /api/users/register
module.exports.register = async(req, res) => {
    try {
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
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// [POST] /api/users/login
module.exports.login = async(req, res) => {
    try {
        const { email, mat_khau } = req.body;
    
        // Tìm người dùng
        const user = await NguoiDung.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "Email không tồn tại" });
        }

        // Mật khẩu
        if (!user.mat_khau) {
            return res.status(401).json({ message: "Tài khoản này đăng nhập bằng Google" });
        }
        const isPassword = await bcrypt.compareSync(mat_khau, user.mat_khau);
        if (!isPassword) {
            return res.status(401).json({ message: "Mật khẩu không chính xác" });
        }

        // Trạng thái
        if(user.trang_thai === 'khong_hoat_dong') {
            return res.status(403).json({ message: "Tài khoản đã bị khóa" });
        }

        // Tạo JWT
        const token = jwt.sign(
            {
                id_nguoi_dung: user.id_nguoi_dung, email: user.email, vai_tro: user.vai_tro
            },
            process.env.SECRET_KEY,
            {
                expiresIn: '7d'
            }
        );

        res.status(200).json({
            message: "Đăng nhập thành công",
            token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
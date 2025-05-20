const NguoiDung = require("../../models/nguoiDung.model");
const MaXacMinhEmail = require("../../models/maXacMinhEmail.model");
const generateHelper = require("../../helpers/generate");
const sendMailHelper = require("../../helpers/sendMail");
const { Sequelize } = require('sequelize');
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const HoSoNguoiDung = require("../../models/hoSoNguoiDung.model");
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// [POST] /api/auth/register
module.exports.register = async(req, res) => {
    try {
        const { email, ten_dang_nhap, mat_khau } = req.body;

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
        });

        res.status(201).json({ message: "Tạo tài khoản thành công" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// [POST] /api/auth/login
module.exports.login = async(req, res) => {
    try {
        const { identifier, mat_khau } = req.body;
    
        // Tìm người dùng
        // SELECT * FROM nguoi_dung WHERE email = 'admin@gmail.com' OR ten_dang_nhap = 'abc123';
        const user = await NguoiDung.findOne({ 
            where: { 
                [Sequelize.Op.or]: [
                    { email: identifier },
                    { ten_dang_nhap: identifier }
                ],
            },
        });
        if (!user) {
            return res.status(400).json({ message: "Email hoặc tên đăng nhập không đúng" });
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
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        );

        res.status(200).json({
            message: "Đăng nhập thành công",
            token,
            vai_tro: user.vai_tro
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [POST] /api/auth/forgot-password
module.exports.forgotPassword = async(req, res) => {
    try {
        const { email } = req.body;

        // Tìm người dùng
        const user = await NguoiDung.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "Email không tồn tại" });
        }

        // Tạo mã otp
        const otp = generateHelper.generateRandomNumber(6);

        // Thời gian hết hạn mã otp (hết hạn sau 5p)
        const thoi_gian = 5;

        // Lưu vào bảng ma_xac_minh_email
        await MaXacMinhEmail.create({
            id_nguoi_dung: user.id_nguoi_dung,
            otp_code: otp,
            thoi_gian_het_han: Date.now() + thoi_gian * 60 * 1000
        });
        
        // Gửi OTP qua email cho người dùng
        const subject = "Mã OTP xác minh lấy lại mật khẩu";
        const html = `
            <p>Mã OTP để lấy lại mật khẩu của bạn là <b>${otp}</b></p>
            <p>Mã OTP này sử dụng trong thời gian ${thoi_gian} phút.</p>
            <p>Vui lòng không chia sẽ với bất kỳ ai.</p>
            <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        `;
        sendMailHelper.sendMail(email, subject, html);

        return res.status(200).json({
            message: "Mã OTP đã được gửi đến email của bạn"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [POST] /api/auth/vertify-otp
module.exports.vertifyOtp = async(req, res) => {
    try {
        const { email, otp_code } = req.body;

        // Tìm người dùng
        const user = await NguoiDung.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "Email không tồn tại" });
        }

        const otpResult = await MaXacMinhEmail.findOne({
            where: {
                id_nguoi_dung: user.id_nguoi_dung,
                otp_code: otp_code
            }
        });
        if(!otpResult || otpResult.thoi_gian_het_han < Date.now()) {
            return res.status(400).json({ message: "Mã OTP không hợp lệ hoặc đã hết hạn" });
        }

        res.status(200).json({ message: "Xác thực OTP thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [POST] /api/auth/reset-password
module.exports.resetPassword = async(req, res) => {
    try {
        const { email, mat_khau_moi } = req.body;

        // Tìm người dùng
        const user = await NguoiDung.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "Email không tồn tại" });
        }

        // Kiểm tra mật khẩu mới trùng mật khẩu cũ không
        const checkMatKhau = await bcrypt.compareSync(mat_khau_moi, user.mat_khau);
        if(checkMatKhau) {
            return res.status(400).json({ message: "Vui lòng nhập mật khẩu khác mật khẩu cũ " });
        }

        // Mã hóa mật khẩu mới
        const hashPassword = bcrypt.hashSync(mat_khau_moi, 10);

        // Cập nhật database
        await user.update({ mat_khau: hashPassword });

        res.status(200).json({ message: "Đổi mật khẩu thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [POST] /api/auth/google
module.exports.googleLogin = async(req, res) => {
    try {
        const { token } = req.body;

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        const { email, name, picture, sub} = payload;    

        let user = await NguoiDung.findOne({ where: { email } });
        if (!user) {
            // Lưu bảng nguoi_dung
            user = await NguoiDung.create({
                email: email,
                ten_dang_nhap: email.split('@')[0],
                mat_khau: '',
                id_google: sub,
                vai_tro: 'nguoi_dung',
                trang_thai: 'hoat_dong'
            });

            // Lưu bảng hồ sơ người dùng
            await HoSoNguoiDung.create({
                id_nguoi_dung: user.id_nguoi_dung,
                ho_ten: name,
                url_hinh_dai_dien: picture
            });
        }

        const jwtToken = jwt.sign(
            {
                id_nguoi_dung: user.id_nguoi_dung,
                email: user.email,
                vai_tro: user.vai_tro,
                action: 'auth'
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        )

        res.status(200).json({
            message: "Đăng nhập bằng Google thành công",
            token: jwtToken
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


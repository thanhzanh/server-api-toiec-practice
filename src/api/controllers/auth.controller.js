const NguoiDung = require("../../models/nguoiDung.model");
const MaXacMinhEmail = require("../../models/maXacMinhEmail.model");
const HoSoNguoiDung = require("../../models/hoSoNguoiDung.model");
const VaiTro = require("../../models/vaiTro.model");
const Quyen = require("../../models/quyen.model");
const generateHelper = require("../../utils/generate");
const sendMailHelper = require("../../utils/sendMail");
const { Sequelize } = require('sequelize');
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// [POST] /api/auth/register
module.exports.register = async(req, res) => {
    try {
        const { email, ten_dang_nhap, mat_khau } = req.body;

        if (!email || !ten_dang_nhap || !mat_khau) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
        }

        // Kiểm tra email và ten_dang_nhap
        const existingUser = await NguoiDung.findOne({ where: { email } }) || await NguoiDung.findOne({ where: { ten_dang_nhap } });
        if (existingUser) {
            return res.status(409).json({
                message: "Email hoặc tên đăng nhập đã tồn tại"
            });
        }

        // Gán vai trò mặc định 'nguoi_dung'
        const vaiTroMacDinh = await VaiTro.findOne({ where: { ten_vai_tro: 'nguoi_dung' } });
        if (!vaiTroMacDinh) {
            return res.status(500).json({ message: "Vai trò mặc định chưa được tạo" });
        }

        // Mã hóa mật khẩu
        const hashPassword = bcrypt.hashSync(mat_khau, 10);

        // Đăng ký tài khoản người dùng
        await NguoiDung.create({
            email,
            ten_dang_nhap,
            mat_khau: hashPassword,
            id_vai_tro: vaiTroMacDinh.id_vai_tro
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

        if (!identifier || !mat_khau) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ tài khoản và mật khẩu!" });
        }
    
        // Tìm người dùng
        // SELECT * FROM nguoi_dung WHERE email = 'admin@gmail.com' OR ten_dang_nhap = 'abc123';
        const user = await NguoiDung.findOne({ 
            where: { 
                [Sequelize.Op.or]: [ // [Op.or]: hoặc
                    { email: identifier },
                    { ten_dang_nhap: identifier }
                ],
            },
            include: [
                { 
                    model: VaiTro, 
                    as: 'vai_tro_nguoi_dung', 
                    attributes: ['ten_vai_tro', 'is_admin'],
                    include: [
                        {
                            model: Quyen,
                            as: 'ds_quyen',
                            attributes: ['ma_quyen']
                        }
                    ]

                }
            ],
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

        // Lấy danh sách mã quyền
        const permissions = user.vai_tro_nguoi_dung?.ds_quyen?.map(quyen => quyen.ma_quyen) || [];

        // Tạo JWT
        const token = jwt.sign(
            {
                id_nguoi_dung: user.id_nguoi_dung, 
                email: user.email, 
                id_vai_tro: user.id_vai_tro,
                vai_tro: user.vai_tro_nguoi_dung?.ten_vai_tro,
                is_admin: user.vai_tro_nguoi_dung?.is_admin,
                permissions: permissions
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d'
            }
        );
        
       // Gán req.user để log
        req.user = { id_nguoi_dung: user.id_nguoi_dung };

        res.status(200).json({
            message: "Đăng nhập thành công",
            token,
            vai_tro: user.vai_tro_nguoi_dung.ten_vai_tro,
            is_admin: user.vai_tro_nguoi_dung.is_admin,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [POST] /api/auth/forgot-password
module.exports.forgotPassword = async(req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Vui lòng nhập email!" });
        }

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
            thoi_gian_het_han: new Date(Date.now() + thoi_gian * 60 * 1000)
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
        console.error(error);
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

// [POST] /api/auth/change-password
module.exports.changePassword = async(req, res) => {
    try {
        const { mat_khau_hien_tai, mat_khau_moi, xac_nhan_mat_khau } = req.body;

        if (mat_khau_moi !== xac_nhan_mat_khau) {
            return res.status(400).json({ message: "Mật khẩu xác nhận không khớp" });
        }

        // Lấy người dùng từ token
        const id_nguoi_dung = req.user.id_nguoi_dung;

        const user = await NguoiDung.findByPk(id_nguoi_dung);

        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }
        
        if (!user.mat_khau) {
            return res.status(400).json({ message: "Tài khoản của bạn đăng nhập bằng Google, không thể đổi mật khẩu" });
        }

        // Kiểm tra mật khẩu hiện tại có đúng không
        const checkMatKhau = bcrypt.compareSync(mat_khau_hien_tai, user.mat_khau);
        if (!checkMatKhau) {
            return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
        }

        // Kiểm tra mật khẩu mới có trùng mật khẩu cũ
        const samePassword = bcrypt.compareSync(mat_khau_moi, user.mat_khau);
        if (samePassword) {
            return res.status(400).json({ message: "Mật khẩu mới không được trùng với mật khẩu cũ" });
        }

        // Cập nhật mật khẩu
        user.mat_khau = bcrypt.hashSync(mat_khau_moi, 10);
        await user.save();

        return res.status(200).json({ message:"Thay đổi mật khẩu thành công" });
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

        // Gán vai trò mặc định 'nguoi_dung'
        const vaiTroMacDinh = await VaiTro.findOne({ where: { ten_vai_tro: 'nguoi_dung' } });
        if (!vaiTroMacDinh) {
            return res.status(500).json({ message: "Không tìm thấy vai trò mặc định" });
        }

        // Tìm user theo email (vai trò và hồ sơ)
        let user = await NguoiDung.findOne({ 
            where: { email },
            include: [
                {
                    model: VaiTro,
                    as: 'vai_tro_nguoi_dung',
                    attributes: ['ten_vai_tro']
                },
                {
                    model: HoSoNguoiDung,
                    as: 'ho_so',
                    attributes: ['ho_ten', 'url_hinh_dai_dien']
                }
            ]
        });

        // Nếu user chưa tồn tại thì tạo mới
        if (!user) {
            const userName = email.split('@')[0];
            const userNameHoanChinh = userName.replace(/[^a-zA-Z0-9_-]/g, '_'); 
            // Lưu bảng nguoi_dung
            user = await NguoiDung.create({
                email: email,
                ten_dang_nhap: userNameHoanChinh,
                mat_khau: '',
                id_google: sub,
                id_vai_tro: vaiTroMacDinh.id_vai_tro,
                trang_thai: 'hoat_dong'
            });

            // Lưu bảng hồ sơ người dùng
            await HoSoNguoiDung.create({
                id_nguoi_dung: user.id_nguoi_dung,
                ho_ten: name,
                url_hinh_dai_dien: picture
            });

            // Lấy lại user kèm vai trò
            user = await NguoiDung.findOne({ 
                where: { email },
                include: [
                    {
                        model: VaiTro,
                        as: 'vai_tro_nguoi_dung',
                        attributes: ['ten_vai_tro']
                    },
                    {
                        model: HoSoNguoiDung,
                        as: 'ho_so',
                        attributes: ['ho_ten', 'url_hinh_dai_dien']
                    }
                ]
            });
        } else {
            if (!user.ho_so) {
                await HoSoNguoiDung.create({
                    id_nguoi_dung: user.id_nguoi_dung,
                    ho_ten: name,
                    url_hinh_dai_dien: picture
                });

                // Cập nhật lại user sau khi thêm hồ sơ
                user = await NguoiDung.findOne({
                    where: { email },
                    include: [
                        {
                            model: VaiTro,
                            as: 'vai_tro_nguoi_dung',
                            attributes: ['ten_vai_tro']
                        },
                        {
                            model: HoSoNguoiDung,
                            as: 'ho_so',
                            attributes: ['ho_ten', 'url_hinh_dai_dien']
                        }
                    ]
                });
            }
        }

        // Tạo JWT token
        const jwtToken = jwt.sign(
            {
                id_nguoi_dung: user.id_nguoi_dung,
                email: user.email,
                vai_tro: user.vai_tro_nguoi_dung?.ten_vai_tro,
                action: 'auth'
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        )

        res.status(200).json({
            message: "Đăng nhập thành công",
            token: jwtToken
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


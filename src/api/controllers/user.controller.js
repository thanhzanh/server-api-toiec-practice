const NguoiDung = require("../../models/nguoiDung.model");
const HoSoNguoiDung = require("../../models/hoSoNguoiDung.model");
const { Sequelize, where } = require('sequelize');

// [GET] /api/users
module.exports.getAllUsers = async(req, res) => {
    try {
        // Lấy tất cả loại bỏ thuộc tính mat_khau
        const users = await NguoiDung.findAll({
            where: {
                vai_tro: "nguoi_dung"
            },
            attributes: { exclude: ['mat_khau'] },
        });

        res.status(200).json(users);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// [GET] /api/users/me
module.exports.getMe = async(req, res) => {
    try {
        const id_nguoi_dung = req.user.id_nguoi_dung;

        // Tìm người dùng
        const user = await NguoiDung.findByPk(id_nguoi_dung, { attributes: { exclude: ['mat_khau'] } });
        
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// [DELETE] /api/users/delete/:id_nguoi_dung
module.exports.deleteUser = async(req, res) => {
    try {
        const { id_nguoi_dung } = req.params;

        const user = await NguoiDung.findByPk(id_nguoi_dung);
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }
        // Nếu là tài khoản quản trị viên thì không được xóa
        if (user.vai_tro === "quan_tri_vien") {
            return res.status(404).json({ message: "Đây là tài khoản quản trị viên không xóa được" });
        }

        // Xóa mềm trong database
        await user.update({ da_xoa: true });

        res.status(200).json({ message: "Đã xóa thành công" });
        
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// [PUT] /api/users/change-status/:id_nguoi_dung
module.exports.changeStatus = async(req, res) => {
    try {
        const { id_nguoi_dung } = req.params;
        const { trang_thai } = req.body;

        const user = await NguoiDung.findByPk(id_nguoi_dung);
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }

        // Cập nhật trạng thái
        await user.update({ trang_thai: trang_thai });

        res.status(200).json({ message: "Đã chặn người dùng thành công" });
        
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// [PUT] /api/users/update-profile
module.exports.updateProfile = async(req, res) => {
    try {
        
        const { ten_dang_nhap, ho_ten, so_dien_thoai, url_hinh_dai_dien, dia_chi, ngay_sinh, gioi_thieu } = req.body;

        // id_nguoi_dung
        const id_nguoi_dung = req.user.id_nguoi_dung;

        // Kiểm tra người dùng
        const user = await NguoiDung.findByPk(id_nguoi_dung);
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại" });
        }

        // Cập nhật ten_dang_nhap từ bảng NguoiDung
        if (ten_dang_nhap && ten_dang_nhap !== user.ten_dang_nhap) {
            await user.update({ ten_dang_nhap });
        }

        // Cập nhật hồ sơ người dùng
        let profile = await HoSoNguoiDung.findByPk(id_nguoi_dung);
        if (!profile) {
            profile = await HoSoNguoiDung.create({ id_nguoi_dung: id_nguoi_dung });
        }

        if (ho_ten !== undefined) profile.ho_ten = ho_ten;
        if (so_dien_thoai !== undefined) profile.so_dien_thoai = so_dien_thoai;
        if (url_hinh_dai_dien !== undefined) profile.url_hinh_dai_dien = url_hinh_dai_dien;
        if (dia_chi !== undefined) profile.dia_chi = dia_chi;
        if (ngay_sinh !== undefined) profile.ngay_sinh = ngay_sinh;
        if (gioi_thieu !== undefined) profile.gioi_thieu = gioi_thieu;

        await profile.save();

        // Trả về thông tin người dùng
        const userProfile = await NguoiDung.findByPk(
            id_nguoi_dung,
            {
                attributes: ['id_nguoi_dung', 'ten_dang_nhap'],
                include: [
                    {
                        model: HoSoNguoiDung,
                        attributes: [
                            'ho_ten',
                            'so_dien_thoai',
                            'url_hinh_dai_dien',
                            'dia_chi',
                            'ngay_sinh',
                            'gioi_thieu'
                        ],
                    },
                ],
            },
        );

        res.status(200).json({ 
            message: "Đã cập nhật thông tin cá nhân",
            data: userProfile
        });
        
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};
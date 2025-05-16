const NguoiDung = require("../../models/nguoiDung.model");
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
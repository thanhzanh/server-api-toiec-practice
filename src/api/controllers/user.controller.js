const NguoiDung = require("../../models/nguoiDung.model");
const { Sequelize } = require('sequelize');

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
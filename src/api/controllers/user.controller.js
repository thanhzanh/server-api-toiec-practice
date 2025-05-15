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
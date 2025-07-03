const VaiTro = require("../../models/vaiTro.model");

// [GET] /api/roles/
module.exports.index = async (req, res) => {
    try {
        const roles = await VaiTro.findAll({
            where: {
                da_xoa: false
            }
        });

        res.status(200).json({ message: 'Danh sách nhóm quyền', data: roles });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [POST] /api/roles/create
module.exports.createRole = async (req, res) => {
    try {
        const { ten_vai_tro, mo_ta } = req.body;

        if (!ten_vai_tro) {
            return res.status(400).json({ message: "Tên vài trò phải bắt buộc!" });
        }

        // Kiểm tra vai trò có chưa
        const existed = await VaiTro.findOne({
            where: {
                ten_vai_tro
            }
        });
        if (existed) {
            return res.status(400).json({ message: 'Vai trò đã tồn tại!' });
        }

        const role = await VaiTro.create({ ten_vai_tro, mo_ta });

        res.status(200).json({ message: 'Tạo vai trò thành công!', data: role });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const VaiTro = require("../../models/vaiTro.model");
const Quyen = require("../../models/quyen.model");

// [GET] /api/permissions/
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

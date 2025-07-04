const Quyen = require("../../models/quyen.model");
const PhanQuyenVaiTro = require("../../models/phanQuyenVaiTro.model");

// [GET] /api/permissions/
module.exports.index = async (req, res) => {
    try {
        const permissions = await Quyen.findAll({
            where: {
                da_xoa: false
            }
        });

        res.status(200).json({ message: 'Danh sách nhóm quyền', data: permissions });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [POST] /api/permissions/create
module.exports.createPermission = async (req, res) => {
    try {
        const { ten_quyen, ma_quyen } = req.body;

        if (!ten_quyen || !ma_quyen) {
            return res.status(400).json({ message: "Vui lòng nhập đủ thông tin tên quyền và mã quyền!" });
        }

        const existed = await Quyen.findOne({ where: { ma_quyen } });
        if (existed) {
            return res.status(400).json({ message: "Mã quyền đã tồn tại!" });
        }

        // Lưu vào database
        const permission = await Quyen.create({ ten_quyen, ma_quyen });

        res.status(200).json({ message: 'Danh sách nhóm quyền', data: permission });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [PATCH] /api/permissions/update/:id_quyen
module.exports.updatePermission = async (req, res) => {
    try {
        const { id_quyen } = req.params;
        const { ten_quyen } = req.body;

        const existed = await Quyen.findByPk(id_quyen);
        if (!existed) {
            return res.status(400).json({ message: "Không tìm thấy quyền!" });
        }

        // Lưu vào database
        await Quyen.update({ 
            ten_quyen, 
            thoi_gian_cap_nhat: new Date()
        }, { 
            where: { id_quyen } 
        });

        // Trả về data
        const updatedPermission = await Quyen.findByPk(id_quyen);

        res.status(200).json({ message: 'Cập nhật quyền thành công', data: updatedPermission });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [DELETE] /api/permissions/delete/:id_quyen
module.exports.deletePermission = async (req, res) => {
    try {
        const { id_quyen } = req.params;
        // Kiểm tra trong phan_quyen_vai_tro
        const usedPermission = await Quyen.findOne({ where: { id_quyen } });
        if (usedPermission) {
            return res.status(400).json({ message: "Không thể xóa quyền đang được gán cho vai trò!" });
        }

        // Lưu vào database
        await Quyen.update({ 
            da_xoa: true
        }, { 
            where: { id_quyen } 
        });

        res.status(200).json({ message: 'Xóa quyền thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [GET] /api/permissions/detail/:id_quyen
module.exports.detailPermission = async (req, res) => {
    try {
        const { id_quyen } = req.params;
        const permission = await Quyen.findByPk(id_quyen);
        if (!permission) {
            return res.status(400).json({ message: 'Vai trò không hợp lệ' });
        }

        res.status(200).json({ message: 'Thông tin chi tiết quyền', data: permission });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

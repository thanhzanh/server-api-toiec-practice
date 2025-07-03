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

// [PATCH] /api/roles/update/:id_vai_tro
module.exports.updateRole = async (req, res) => {
    try {
        const { id_vai_tro } = req.params;
        const { ten_vai_tro, mo_ta } = req.body;        

        // Kiểm tra vai trò có chưa
        const role = await VaiTro.findByPk(id_vai_tro);
        if (!role) {
            return res.status(400).json({ message: 'Vai trò không tồn tại!' });
        }

        if (role?.ten_vai_tro === 'quan_tri_vien') {
            return res.status(400).json({ message: 'Không thể sửa vai trò quản trị viên!' });
        }

        if (ten_vai_tro?.toLowerCase() === 'quan_tri_vien') {
            return res.status(400).json({ message: 'Tên vai trò "quan_tri_vien" đã tồn tại!' });
        }

        // Cập nhật trong database
        await VaiTro.update({ 
            ten_vai_tro: ten_vai_tro,
            mo_ta: mo_ta,
            thoi_gian_cap_nhat: new Date()
        }, {
            where: {
                id_vai_tro: id_vai_tro
            }
        });

        // Trả về dữ liệu sau khi cập nhật
        const updatedRole = await VaiTro.findByPk(id_vai_tro);

        res.status(200).json({ 
            message: 'Cập nhật vai trò thành công!', 
            data: updatedRole 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [PATCH] /api/roles/delete/:id_vai_tro
module.exports.deleteRole = async (req, res) => {
    try {
        const { id_vai_tro } = req.params;

        // Kiểm tra vai trò có chưa
        const role = await VaiTro.findByPk(id_vai_tro);
        if (!role) {
            return res.status(400).json({ message: 'Vai trò không tồn tại!' });
        }

        // Chặn nếu xóa là vai trò 'quan_tri_vien
        if (role?.ten_vai_tro === 'quan_tri_vien') {
            return res.status(400).json({ message: 'Không thể xóa vai trò quản trị viên!' });
        }

        // Cập nhật trong database
        await VaiTro.update({ 
            da_xoa: true
        }, {
            where: {
                id_vai_tro: id_vai_tro
            }
        });

        res.status(200).json({ message: 'Đã xóa vai trò thành công!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
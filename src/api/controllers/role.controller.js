const VaiTro = require("../../models/vaiTro.model");
const Quyen = require("../../models/quyen.model");
const PhanQuyenVaiTro = require("../../models/phanQuyenVaiTro.model");
const { Op, Sequelize } = require("sequelize");

// [GET] /api/roles/
module.exports.index = async (req, res) => {
    try {
        const roles = await VaiTro.findAll({
            where: {
                da_xoa: false,
            },
            attributes: ["id_vai_tro", "ten_vai_tro", "mo_ta", "is_admin", "thoi_gian_tao", "thoi_gian_cap_nhat"], 
            order: [['thoi_gian_tao', 'ASC']]
        });

        res.status(200).json({ message: 'Danh sách nhóm quyền', data: roles });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [POST] /api/roles/create
module.exports.createRole = async (req, res) => {
    try {
        const { ten_vai_tro, mo_ta, is_admin } = req.body;
        const tenVaiTroUpper = ten_vai_tro.toLowerCase();

        if (!tenVaiTroUpper) {
            return res.status(400).json({ message: "Tên vài trò phải bắt buộc!" });
        }

        // Kiểm tra vai trò có chưa
        const existed = await VaiTro.findOne({
            where: {
                ten_vai_tro: tenVaiTroUpper
            }
        });
        if (existed) {
            return res.status(400).json({ message: 'Vai trò đã tồn tại!' });
        }

        // Tạo role mới lưu vào database
        const role = await VaiTro.create({ 
            ten_vai_tro: tenVaiTroUpper, 
            mo_ta,
            is_admin: is_admin || false // false là nguoi_dung
        });

        res.status(200).json({ 
            message: 'Tạo vai trò thành công!', 
            data: role 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [PATCH] /api/roles/update/:id_vai_tro
module.exports.updateRole = async (req, res) => {
    try {
        const { id_vai_tro } = req.params;
        const { ten_vai_tro, mo_ta, is_admin } = req.body;        

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
            ten_vai_tro: ten_vai_tro?.toLowerCase() || role.ten_vai_tro,
            mo_ta: mo_ta || role.mo_ta,
            is_admin: is_admin !== undefined ? is_admin : role.is_admin,
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

// [GET] /api/roles/detail/id_vai_tro
module.exports.detailRole = async (req, res) => {
    try {
        const { id_vai_tro } = req.params;
        const role = await VaiTro.findByPk(id_vai_tro);
        if (!role) {
            return res.status(400).json({ message: 'Vai trò không hợp lệ' });
        }

        res.status(200).json({ message: 'Thông tin chi tiết vai trò', data: role });
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

        // Chặn nếu xóa là vai trò 'quan_tri_vien và 'nguoi_dung'
        const vaiTroChinhTrongHeThong = ["quan_tri_vien", "nguoi_dung"];
        if (vaiTroChinhTrongHeThong.includes(role.ten_vai_tro)) {
            return res.status(400).json({ message: `Không thể xóa vai trò chính trong hệ thống: ${role.ten_vai_tro}!` });
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

// [POST] /api/roles/permissions/:id_vai_tro
module.exports.updateRolePermission = async (req, res) => {
    try {
        const { id_vai_tro } = req.params;
        const { ds_ma_quyen } = req.body;

        const role = await VaiTro.findByPk(id_vai_tro);
        if (!role) {
            return res.status(404).json({ message: "Vai trò không tồn tại!" });
        }

        // Kiểm tra ds mảng mã quyền
        if (!Array.isArray(ds_ma_quyen)) {
            return res.status(400).json({ message: "Danh sách mảng quyền không hợp lệ!" });
        }

        // quan_tri_vien toàn quyền nên không cho sửa quyền cửa quan_tri_vien
        // if (role.ten_vai_tro === 'quan_tri_vien') {
        //     return res.status(400).json({ message: "Quản trị viên toàn quyền. Không thể cập nhật quyền cho quản trị viên!" });
        // }

        if (ds_ma_quyen.length === 0) {
            return res.status(400).json({ message: "Không có gì thay đổi!" });
        }

        // Tìm kiếm quyền trong table quyen
        const permissions = await Quyen.findAll({
            where: {
                ma_quyen: { [Op.in]: ds_ma_quyen } // [Op.in]: In (thuộc danh sách)
            },
            attributes: ['id_quyen']
        });

        if (permissions.length === 0) {
            return res.status(400).json({ message: "Không tìm thấy quyền trong danh sách quyền!" });
        }

        // Xóa toàn bộ quyền cũ trong PhanQuyenPhanQuyen
        await PhanQuyenVaiTro.destroy({ where: { id_vai_tro } });

        const newPermissions = permissions.map(quyen => ({
            id_vai_tro,
            id_quyen: quyen.id_quyen
        }));

        // Thêm toàn bộ quyền mới vào database
        await PhanQuyenVaiTro.bulkCreate(newPermissions);

        res.status(200).json({ message: `Đã cập nhật quyền cho vai trò ${role.ten_vai_tro}!` });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [GET] /api/roles/permissions-table
module.exports.getPermissionsTable = async (req, res) => {  
    try {
        const dsVaiTro = await VaiTro.findAll({ 
            where: {
                ten_vai_tro: { [Op.ne]: 'nguoi_dung' } // Loại bỏ nguoi_dung
            },
            attributes: ['id_vai_tro', 'ten_vai_tro'] ,
            order: [['id_vai_tro', 'ASC']] // sắp xếp tăng dần
        });
        const dsQuyen = await Quyen.findAll({
            include: [
                {
                    model: VaiTro,
                    as: 'ds_vai_tro',
                    through: { attributes: [] }, // bỏ bảng trung gian
                    attributes: ['id_vai_tro', 'ten_vai_tro']
                }
            ]
        });

        // Gom nhóm theo tiền tố ma_quyen
        const groupedPermissions = {};

        dsQuyen.forEach(quyen => {
            const prefix = quyen.ma_quyen.split('_')[0]; // VD: USER, EXAM,...
            const roles = dsVaiTro.map(role => ({
                id_vai_tro: role.id_vai_tro,
                ten_vai_tro: role.ten_vai_tro,
                co_quyen: quyen.ds_vai_tro.some(vt => vt.id_vai_tro === role.id_vai_tro)
            }));

            const item = {
                ma_quyen: quyen.ma_quyen,
                ten_quyen: quyen.ten_quyen,
                mo_ta: quyen.mo_ta,
                roles
            };

            if (!groupedPermissions[prefix]) {
                groupedPermissions[prefix] = [];
            }

            groupedPermissions[prefix].push(item);
        });

        res.status(200).json({ 
            message: "Danh sách quyền của từng vai trò",
            permissions: groupedPermissions
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

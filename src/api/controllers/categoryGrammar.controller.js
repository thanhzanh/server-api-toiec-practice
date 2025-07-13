const DanhMucNguPhap = require("../../models/danhMucNguPhap.model");
const striptags = require('striptags');
const { createPaginationQuery } = require('../../utils/pagination');

// [GET] /api/category-grammars
module.exports.index = async (req, res) => {
    try {        
        const { page, limit } = req.query;

        // Điều kiện lọc
        const where = {
            da_xoa: false
        };

        // Đếm tổng số bản ghi
        const count = await DanhMucNguPhap.count({
            where,
            distinct: true
        });

        // Phân trang
        let initPagination = {
            currentPage: 1,
            limitItem: 10
        }
        const pagination = createPaginationQuery(
            initPagination,
            { page, limit },
            count
        );

        // Lấy tất cả danh mục bài viết
        const dsDanhMuc = await DanhMucNguPhap.findAll({
            where,
            attributes: ['id_danh_muc', 'ten_danh_muc', 'mo_ta', 'thoi_gian_tao', 'thoi_gian_cap_nhat', 'da_xoa'],
            order: [['thoi_gian_tao', 'DESC']],
            offset: pagination.skip,
            limit: pagination.limitItem,
        });
        
        res.status(200).json({ 
            message: "Lấy danh sách danh mục ngữ pháp thành công",
            data: dsDanhMuc,
            pagination: {
                page: pagination.currentPage,
                limit: pagination.limitItem,
                total: count,
                totalPages: pagination.totalPages
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// [POST] /api/category-grammars/create
module.exports.createCategory = async (req, res) => {
    try {
        const { ten_danh_muc, mo_ta } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!ten_danh_muc || !mo_ta) {
            return res.status(400).json({ message: "Cần nhập đủ thông tin!" });
        }

        // Tạo danh mục ngữ pháp mới
        const newCategory = await DanhMucNguPhap.create({
            ten_danh_muc: striptags(ten_danh_muc),
            mo_ta: striptags(mo_ta),
        });

        res.status(201).json({
            message: "Tạo danh mục ngữ pháp thành công",
            data: newCategory
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

// [PATCH] /api/category-grammars/update/:id_danh_muc
module.exports.updateCategory = async (req, res) => {
    try {        
        const {id_danh_muc } = req.params;
        const { ten_danh_muc, mo_ta } = req.body;

        const danhMuc = await DanhMucNguPhap.findByPk(id_danh_muc);
        if (!danhMuc) {
            return res.status(404).json({ message: "Danh mục ngữ pháp không tồn tại!" });
        }

        const updateData = {};
        if (ten_danh_muc !== danhMuc.ten_danh_muc && ten_danh_muc !== undefined) updateData.ten_danh_muc = ten_danh_muc || danhMuc.ten_danh_muc;
        if (mo_ta !== danhMuc.mo_ta && mo_ta !== undefined) updateData.mo_ta = striptags(mo_ta) || danhMuc.mo_ta;

        // Cập nhật thời gian
        updateData.thoi_gian_cap_nhat = new Date();

        res.status(200).json({ 
            message: "Đã chỉnh sửa danh ngữ pháp viết thành công",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [DELETE] /api/category-grammars/delete/:id_danh_muc
module.exports.deleteCategory = async (req, res) => {
    try {
        const { id_danh_muc } = req.params;

        const danhMuc = await DanhMucNguPhap.findByPk(id_danh_muc);
        if (!danhMuc) {
            return res.status(404).json({ message: "Danh mục ngữ pháp không tồn tại!" });
        }

        // Đánh dấu là đã xóa
        danhMuc.da_xoa = true;
        await danhMuc.save();

        res.status(200).json({ 
            message: "Đã xóa danh mục ngữ pháp thành công",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// [GET] /api/category-grammars/detail/:id_danh_muc
module.exports.detailCategory = async (req, res) => {
    try {
        const { id_danh_muc } = req.params;

        const danhMuc = await DanhMucNguPhap.findByPk(id_danh_muc);
        if (!danhMuc) {
            return res.status(404).json({ message: "Danh mục ngữ pháp không tồn tại!" });
        }

        res.status(200).json({ 
            message: "Lấy chi tiết danh mục ngữ pháp thành công",
            data: danhMuc
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}
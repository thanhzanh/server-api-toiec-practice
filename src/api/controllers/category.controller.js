const DanhMucBaiViet = require("../../models/danhMucBaiViet.model");
const BaiViet = require("../../models/baiViet.model");
const striptags = require('striptags');
const { createPaginationQuery } = require('../../utils/pagination');

// [GET] /api/categorys
module.exports.index = async (req, res) => {
    try {        
        const { page, limit } = req.query;

        // Điều kiện lọc
        const where = {
            da_xoa: false
        };

        // Đếm tổng số bản ghi
        const count = await DanhMucBaiViet.count({
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
        const dsDanhMuc = await DanhMucBaiViet.findAll({
            where,
            attributes: ['id_danh_muc', 'ten_danh_muc', 'mo_ta', 'thoi_gian_tao', 'thoi_gian_cap_nhat', 'da_xoa'],
            order: [['thoi_gian_tao', 'DESC']],
            offset: pagination.skip,
            limit: pagination.limitItem,
        });
        
        res.status(200).json({ 
            message: "Lấy danh sách danh mục bài viết thành công",
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

// [POST] /api/categorys/create
module.exports.createCategory = async (req, res) => {
    try {        
        const { ten_danh_muc, mo_ta } = req.body;

        if (!ten_danh_muc) {
            return res.status(400).json({ message: "Vui lòng nhập tên danh mục!" });
        }

        const danhMuc = await DanhMucBaiViet.findOne({
            where: { ten_danh_muc }
        });
        if (danhMuc) {
            return res.status(404).json({ message: "Danh mục đã tồn tại!" });
        }
        
        const data = await DanhMucBaiViet.create({ ten_danh_muc, mo_ta });

        res.status(200).json({ 
            message: "Tạo danh mục bài viết thành công",
            data: data
        });
    } catch (error) {
        console.error("Lỗi tạo danh mục bài viết:", error);
        res.status(500).json({ message: error.message });
    }
};

// [PATCH] /api/categorys/update/:id_danh_muc
module.exports.updateCategory = async (req, res) => {
    try {        
        const {id_danh_muc } = req.params;
        const { ten_danh_muc, mo_ta } = req.body;

        const danhMuc = await DanhMucBaiViet.findByPk(id_danh_muc);
        if (!danhMuc) {
            return res.status(404).json({ message: "Danh mục không tồn tại!" });
        }

        const updateData = {};
        if (ten_danh_muc !== danhMuc.ten_danh_muc && ten_danh_muc !== undefined) updateData.ten_danh_muc = ten_danh_muc || danhMuc.ten_danh_muc;
        if (mo_ta !== danhMuc.mo_ta && mo_ta !== undefined) updateData.mo_ta = striptags(mo_ta) || danhMuc.mo_ta;

        // Cập nhật thời gian
        updateData.thoi_gian_cap_nhat = new Date();

        const data = await danhMuc.update(updateData);        

        res.status(200).json({ 
            message: "Đã chỉnh sửa danh mục bài viết thành công",
            data: data
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [DELETE] /api/categorys/delete/:id_danh_muc
module.exports.deleteCategory = async (req, res) => {
    try {        
        const {id_danh_muc } = req.params;

        const danhMuc = await DanhMucBaiViet.findByPk(id_danh_muc);
        if (!danhMuc) {
            return res.status(404).json({ message: "Danh mục không tồn tại!" });
        }

        const existedCategory = await BaiViet.findOne({ where: { id_danh_muc } });
        if (existedCategory) {
            return res.status(404).json({ message: "Danh mục đã được sử dụng trong bài viết. Không xóa được!" });
        }

        await danhMuc.update({
            da_xoa: true
        });

        res.status(200).json({ 
            message: "Đã xóa danh mục bài viết thành công"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [GET] /api/categorys/detail/:id_danh_muc
module.exports.detailCategory = async (req, res) => {
    try {        
        const {id_danh_muc } = req.params;

        const danhMuc = await DanhMucBaiViet.findByPk(id_danh_muc);
        if (!danhMuc) {
            return res.status(404).json({ message: "Danh mục không tồn tại!" });
        }

        const data = await DanhMucBaiViet.findByPk(id_danh_muc, {
            attributes: ['id_danh_muc', 'ten_danh_muc', 'mo_ta', 'thoi_gian_tao', 'thoi_gian_cap_nhat', 'da_xoa']
        })

        res.status(200).json({ 
            message: "Xem thông tin chi tiết danh mục bài viết thành công",
            data: data
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [GET] /api/categorys/get-all-categorys
module.exports.getAllCategorys = async (req, res) => {
    try {
        const dsDanhMuc = await DanhMucBaiViet.findAll({
            where: { da_xoa: false },
            attributes: ['id_danh_muc', 'ten_danh_muc'],
            order: [['thoi_gian_tao', 'DESC']]
        });

        res.status(200).json({ 
            message: "Lấy tất cả danh mục bài viết thành công",
            data: dsDanhMuc
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}
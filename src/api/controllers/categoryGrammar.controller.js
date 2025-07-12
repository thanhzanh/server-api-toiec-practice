const DanhMucNguPhap = require("../../models/danhMucNguPhap.model");
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

// [POST] /api/categorys/create
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

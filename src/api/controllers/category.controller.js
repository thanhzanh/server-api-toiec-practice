const DanhMucBaiViet = require("../../models/danhMucBaiViet.model");

// [GET] /api/categorys
module.exports.index = async (req, res) => {
    try {        
        const { page, limit, id_phan } = req.query;

        // Điều kiện lọc
        const where = {
            da_xoa: false
        };
        if (id_phan) where.id_phan = id_phan;

        // Đếm tổng số bản ghi
        const count = await DoanVan.count({
            where,
            distinct: true
        });

        // Phân trang
        let initPagination = {
            currentPage: 1,
            limitItem: 7
        }
        const pagination = createPaginationQuery(
            initPagination,
            { page, limit },
            count
        );
        
        
        res.status(200).json({ 
            message: "Lấy danh sách danh mục bài viết thành công",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [POST] /api/categorys/create
module.exports.create = async (req, res) => {
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

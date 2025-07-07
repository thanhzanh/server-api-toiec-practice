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
        const { tieu_de, noi_dung, id_phan, loai_doan_van } = req.body;
        console.log("Data request: ", req.body);

        
        res.status(200).json({ 
            message: "Tạo danh mục bài viết thành công",
        });
    } catch (error) {
        console.error("Lỗi tạo danh mục bài viết:", error);
        res.status(500).json({ message: error.message });
    }
};

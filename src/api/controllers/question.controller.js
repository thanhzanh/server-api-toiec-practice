const { NganHangCauHoi, PhanCauHoi, DoanVan, PhuongTien, LuaChon } = require('../../models');
const { createPaginationQuery } = require('../../helpers/pagination');

// [GET] /api/questions
module.exports.index = async (req, res) => {
    try {
        const { page, limit, id_phan, muc_do_kho, trang_thai } = req.query;

        // Điều kiện lọc
        const where = {
            da_xoa: false
        };
        if (id_phan) where.id_phan = id_phan;
        if (muc_do_kho) where.muc_do_kho = muc_do_kho;
        if (trang_thai) where.trang_thai = trang_thai;

        // Đếm tổng số bản ghi
        const count = await NganHangCauHoi.count({
            where,
            distinct: true
        });

        // Phân trang
        let initPagination = {
            currentPage: 1,
            limitItem: 3
        }
        const pagination = createPaginationQuery(
            initPagination,
            { page, limit },
            count
        );

        // Danh sách câu hỏi theo bộ lọc phần, trạng thái, mức độ
        const questions = await NganHangCauHoi.findAll({
            where,
            include: [
                { model: PhanCauHoi, as: 'phan', attributes: ['ten_phan', 'loai_phan', 'co_hinh_anh', 'co_am_thanh', 'co_doan_van'] },
                { model: DoanVan, as: 'doan_van', attributes: ['noi_dung'] },
                { model: PhuongTien, as: 'hinh_anh', attributes: ['url_phuong_tien'] },
                { model: PhuongTien, as: 'am_thanh', attributes: ['url_phuong_tien'] },
                { model: LuaChon, as: 'lua_chon', attributes: ['ky_tu_lua_chon', 'noi_dung'] }
            ],
            attributes: [
                'id_cau_hoi',
                'noi_dung',
                'dap_an_dung',
                'giai_thich',
                'muc_do_kho',
                'trang_thai',
                'nguon_goc',
                'thoi_gian_tao'
            ],
            offset: pagination.skip,
            limit: pagination.limitItem
        });
        
        res.status(200).json({ 
            message: "Lấy danh sách câu hỏi thành công",
            data: questions,
            pagination: {
                page: pagination.currentPage,
                limit: pagination.limitItem,
                total: count,
                totalPages: pagination.totalPages
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [GET] /api/questions
module.exports.create = async (req, res) => {
    try {
        const { id_phan, id_doan_van, noi_dung, dap_an_dung, giai_thich, muc_do_kho, id_phuong_tien_hinh_anh, id_phuong_tien_am_thanh } = req.body;

        console.log('Dữ liệu test postman gửi lên: ', req.body);
        
        
        res.status(200).json({ 
            message: "Lấy danh sách câu hỏi thành công",
            
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
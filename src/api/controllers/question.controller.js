const { NganHangCauHoi, PhanCauHoi, DoanVan, PhuongTien, LuaChon } = require('../../models');
const { createPaginationQuery } = require('../../helpers/pagination');
const { upload } = require('../middlewares/uploadCloud.middleware');

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

// [POST] /api/questions/create
module.exports.create = async (req, res) => {
    try {

        let data;
        data = JSON.parse(req.body.data);
        const { id_phan, id_doan_van, noi_dung, dap_an_dung, giai_thich, muc_do_kho, trang_thai, lua_chon } = data;

        console.log('Dữ liệu test postman gửi lên: ', data);

        // Kiểm tra phần
        if (id_phan) {
            const phan = await PhanCauHoi.findByPk(id_phan);
            if (!phan) {
                return res.status(400).json({ message: "Phần câu hỏi không tồn tại" });
            }
        }

        // Kiểm tra đoạn văn
        if (id_doan_van) {
            const doanvan = await DoanVan.findByPk(id_doan_van);
            if (!doanvan) {
                return res.status(400).json({ message: "Đoạn văn không tồn tại" });
            }
            
            if (phan && !phan.co_doan_van) {
                return res.status(400).json({ message: "Đoạn văn chỉ nằm trong Part 6 và Part 7" });
            }
        }

        // Validate Part 1
        if (id_phan === 1) {
            if (!req.body.url_am_thanh && !req.body.url_hinh_anh) {
                return res.status(400).json({ message: "Part 1 bắt buộc phải có hình ảnh và âm thanh!" });
            }
        }

        // Xử lý hình ảnh
        let id_phuong_tien_am_thanh = null;
        let id_phuong_tien_hinh_anh = null
        if(req.body.url_hinh_anh) {
            const media = await PhuongTien.create({
                url_phuong_tien: req.body.url_hinh_anh,
                loai_phuong_tien: 'hinh_anh',
                thoi_gian_tao: new Date()
            });
            id_phuong_tien_hinh_anh = media.id_phuong_tien;
        }
        if(req.body.url_am_thanh) {
            const media = await PhuongTien.create({
                url_phuong_tien: req.body.url_am_thanh,
                loai_phuong_tien: 'am_thanh',
                thoi_gian_tao: new Date()
            });
            id_phuong_tien_am_thanh = media.id_phuong_tien;
        }

        // Lưu vào database ngan_hang_cau_hoi
        const question = await NganHangCauHoi.create({
            id_phan,
            id_doan_van,
            noi_dung,
            dap_an_dung,
            giai_thich,
            muc_do_kho,
            id_phuong_tien_hinh_anh,
            id_phuong_tien_am_thanh,
            trang_thai: trang_thai
        });

        // Tạo lựa chọn
        const luaChonDapAn = lua_chon.map((item) => ({
            id_cau_hoi: question.id_cau_hoi,
            ky_tu_lua_chon: item.ky_tu_lua_chon,
            noi_dung: item.noi_dung
        }));

        // Lưu vào database lua_chon
        await LuaChon.bulkCreate(luaChonDapAn);

        // Lấy dữ liệu câu hỏi trả về
        const dataQuestion = await NganHangCauHoi.findByPk(question.id_cau_hoi, {
            include: [
                { model: PhanCauHoi, as: 'phan', attributes: ['ten_phan', 'loai_phan'] },
                { model: DoanVan, as: 'doan_van', attributes: ['noi_dung'] },
                { model: PhuongTien, as: 'hinh_anh', attributes: ['url_phuong_tien'] },
                { model: PhuongTien, as: 'am_thanh', attributes: ['url_phuong_tien'] },
                { model: LuaChon, as: 'lua_chon', attributes: ['ky_tu_lua_chon', 'noi_dung'] },
            ]
        });
                
        res.status(200).json({ 
            message: "Lấy danh sách câu hỏi thành công",
            data: dataQuestion
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [GET] /api/questions/detail
module.exports.detail = async (req, res) => {
    try {
        const { id_cau_hoi } = req.params;
        const question = await NganHangCauHoi.findByPk(id_cau_hoi);
        if (!question) {
            return res.status(400).json({ message: "ID câu hỏi không hợp lệ" });
        }
        // Lấy thông tin câu hỏi
        const questionDetail = await NganHangCauHoi.findByPk(
            id_cau_hoi,
            {
                include: [
                    { model: PhanCauHoi, as: 'phan', attributes: ['id_phan', 'ten_phan', 'loai_phan', 'mo_ta'] },
                    { model: DoanVan, as: 'doan_van', attributes: ['noi_dung', 'id_phan'] },
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
                ]
            }
        );        
                
        res.status(200).json({ 
            message: "Lấy chi tiết câu hỏi thành công",
            data: questionDetail
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
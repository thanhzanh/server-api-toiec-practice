const BaiThi = require('../../models/baiThi.model');
const NganHangCauHoi = require('../../models/nganHangCauHoi.model');
const PhanCauHoi= require('../../models/phanCauHoi.model');
const DoanVan = require('../../models/doanVan.model');
const PhuongTien = require('../../models/phuongTien.model');
const LuaChon = require('../../models/luaChon.model');
const { createPaginationQuery } = require('../../helpers/pagination');
const CauHoiBaiThi = require('../../models/cauHoiBaiThi.model');
const { where } = require('sequelize');

// Số lượng câu hỏi tối đa trong bài thi
const MAX_QUESTION_TEST = 50;

// Hàm tính điểm tối đa
const calculateMaxScore = (tongSoCauHoi) => {
    return Math.round((tongSoCauHoi / MAX_QUESTION_TEST) * 990);
};

// [POST] /api/exams/create
module.exports.createExam = async (req, res) => {
    try {

        console.log("Request body:", req.body);
        console.log("User from request:", req.user);
        const { ten_bai_thi, mo_ta, la_bai_thi_dau_vao, nam_xuat_ban } = req.body;

        if (!ten_bai_thi || !mo_ta || !nam_xuat_ban || typeof la_bai_thi_dau_vao !== 'boolean') {
            return res.status(400).json({ message: "Cần nhập đủ thông tin bài thi!" });
        }

        // Lưu vào database
        const examCreated = await BaiThi.create({ 
            ten_bai_thi,
            mo_ta,
            la_bai_thi_dau_vao,
            nam_xuat_ban,
            trang_thai: "nhap",
            nguoi_tao: req.user.id_nguoi_dung
        });

        res.status(200).json({ 
            message: "Tạo đề thi thành công!",
            data: examCreated
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [GET] /api/exams/questions
module.exports.getQuestions = async (req, res) => {
    try {
        const { page, limit, id_phan, muc_do_kho, trang_thai } = req.query;

        // Điều kiện lọc
        const where = {
            da_xoa: false,
            trang_thai: 'da_xuat_ban'
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
            limitItem: 10
        }
        const pagination = createPaginationQuery(
            initPagination,
            { page, limit },
            count
        );

        // Lấy danh sách trạng thái
        const dsTrangThai = NganHangCauHoi.rawAttributes.trang_thai.values;

        // Lấy danh sách phần câu hỏi
        const dsPhan = await PhanCauHoi.findAll({ attributes: ['id_phan', 'ten_phan'] });

        // Lấy danh sách mức độ khó
        const dsMucDoKho = NganHangCauHoi.rawAttributes.muc_do_kho.values;

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
            },
            dsPhan,
            dsTrangThai,
            dsMucDoKho
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [POST] /api/exams/questions/add-questions/:id_bai_thi
module.exports.addQuestionsToExam = async (req, res) => {
    try {
        const { id_bai_thi } = req.params;
        console.log("ID bài thi: ", id_bai_thi);
        const { ds_cau_hoi } = req.body;
        console.log("Request body: ", ds_cau_hoi);
        
        // Kiểm tra bài thi tồn tại không
        const exam = await BaiThi.findByPk(id_bai_thi);
        if (!exam) {
            return res.status(404).json({ message: "Bài thi không tồn tại!" });
        }

        // Kiểm tra danh sách câu hỏi có hợp lệ không
        if (ds_cau_hoi.length > MAX_QUESTION_TEST) {
            return res.status(400).json({ message: `Tổng số câu hỏi không được vượt quá ${MAX_QUESTION_TEST} trong giai đoạn test!` });
        }

        // Kiểm tra danh sách câu hỏi
        const questions = await NganHangCauHoi.findAll({
            where: {
                id_cau_hoi: ds_cau_hoi,
                da_xoa: false
            }
        });
        if (questions.length !== ds_cau_hoi.length) {
            return res.status(404).json({ message: "Không tìm thấy 1 số câu hỏi!" });
        }
        console.log("Danh sách câu hỏi:", questions);
        
        // Duyệt qua danh sách câu hỏi
        const questionsToAdd = [];
        for (const question of questions) {
            // Kiểm tra câu hỏi trong bài thi đã tồn tại chưa
            const existingQuestion = await CauHoiBaiThi.findOne({
                where: {
                    id_bai_thi: id_bai_thi,
                    id_cau_hoi: question.id_cau_hoi
                }
            });

            if (!existingQuestion) {
                questionsToAdd.push({
                    id_bai_thi: id_bai_thi,
                    id_cau_hoi: question.id_cau_hoi,
                });
            }
        }
        // Thêm câu hỏi vào bảng cau_hoi_bai_thi
        await CauHoiBaiThi.bulkCreate(questionsToAdd);            

        // Cập nhật thông tin đề thi
        const tong_so_cau_hoi = ds_cau_hoi.length;
        console.log("Tổng số câu hỏi trong bài thi:", tong_so_cau_hoi);
        const diem_toi_da = calculateMaxScore(tong_so_cau_hoi);
        const muc_do_diem = `0-${diem_toi_da}`;
        const da_hoan_thien = tong_so_cau_hoi === MAX_QUESTION_TEST;

        // Cập nhật bài thi với thông tin còn lại
        await BaiThi.update(
            {
                so_luong_cau_hoi: tong_so_cau_hoi,
                diem_toi_da: diem_toi_da,
                muc_do_diem: muc_do_diem,
                da_hoan_thien: da_hoan_thien,
                thoi_gian_cap_nhat: new Date()
            },
            { where: { id_bai_thi } },
        );
        
        // Lấy thông tin bài thi cùng với câu hỏi
        const examWithQuestions = await BaiThi.findByPk(id_bai_thi,{
            include: [
                {
                    model: CauHoiBaiThi,
                    as: 'cau_hoi_cua_bai_thi',
                    include: [
                        {
                            model: NganHangCauHoi,
                            as: 'cau_hoi',
                            attributes: ['id_cau_hoi', 'noi_dung', 'dap_an_dung', 'giai_thich', 'muc_do_kho', 'trang_thai'],
                            include: [
                                { model: PhanCauHoi, as: 'phan', attributes: ['id_phan', 'ten_phan', 'loai_phan', 'mo_ta'] },
                                { model: DoanVan, as: 'doan_van', attributes: ['id_doan_van', 'tieu_de', 'noi_dung'] },
                                { model: PhuongTien, as: 'hinh_anh', attributes: ['id_phuong_tien', 'url_phuong_tien'] },
                                { model: PhuongTien, as: 'am_thanh', attributes: ['id_phuong_tien', 'url_phuong_tien'] },
                                { model: LuaChon, as: 'lua_chon', attributes: ['ky_tu_lua_chon', 'noi_dung'] }
                            ]
                        }
                    ], 
                    attributes: ['id_cau_hoi', 'id_bai_thi']
                }
            ]
        });

        console.log("Thông tin bài thi sau khi cập nhật:", examWithQuestions);
        
        res.status(200).json({ 
            message: "Đã thêm câu hỏi và tạo bảng nháp!",
            examUpdatedInfo: examUpdatedInfo,
            data: examWithQuestions        
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [GET] /api/exams/draft/:id_bai_thi
module.exports.getDraftExam = async (req, res) => {
    try {
        const { id_bai_thi } = req.params;
        // Kiểm tra bài thi tồn tại không
        const examWithDraft = await BaiThi.findByPk(id_bai_thi,{
            include: [
                {
                    model: CauHoiBaiThi,
                    as: 'cau_hoi_cua_bai_thi',
                    include: [
                        {
                            model: NganHangCauHoi,
                            as: 'cau_hoi',
                            attributes: ['id_cau_hoi', 'noi_dung', 'dap_an_dung', 'giai_thich', 'muc_do_kho', 'trang_thai'],
                            include: [
                                { model: PhanCauHoi, as: 'phan', attributes: ['id_phan', 'ten_phan', 'loai_phan', 'mo_ta'] },
                                { model: DoanVan, as: 'doan_van', attributes: ['id_doan_van', 'tieu_de', 'noi_dung'] },
                                { model: PhuongTien, as: 'hinh_anh', attributes: ['id_phuong_tien', 'url_phuong_tien'] },
                                { model: PhuongTien, as: 'am_thanh', attributes: ['id_phuong_tien', 'url_phuong_tien'] },
                                { model: LuaChon, as: 'lua_chon', attributes: ['ky_tu_lua_chon', 'noi_dung'] }
                            ]
                        }
                    ], 
                    attributes: ['id_cau_hoi', 'id_bai_thi']
                }
            ]
        });

        if (!examWithDraft) {
            return res.status(400).json({ message: "Bài thi không tồn tại hoặc chưa tạo bản nháp!" });
        }

        res.status(200).json({ 
            message: "Lấy thông tin bản nháp thành công!",
            data: examWithDraft
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
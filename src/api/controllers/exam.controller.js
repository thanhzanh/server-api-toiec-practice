const BaiThi = require('../../models/baiThi.model');
const NganHangCauHoi = require('../../models/nganHangCauHoi.model');
const PhanCauHoi= require('../../models/phanCauHoi.model');
const DoanVan = require('../../models/doanVan.model');
const PhuongTien = require('../../models/phuongTien.model');
const LuaChon = require('../../models/luaChon.model');
const CauHoiBaiThi = require('../../models/cauHoiBaiThi.model');
const BaiLamNguoiDung = require('../../models/baiLamNguoiDung.model');
const DoanVanPhuongTien = require('../../models/doanVanPhuongTien.model');
const MucDoToiec = require('../../models/mucDoToiec.model');
const { createPaginationQuery } = require('../../utils/pagination');
const { listeningScoreTable, readingScoreTable } = require('../../utils/toeicScoreTable');
const { layMucDoDiemToiecTuDiemToiDa, calculateDiemToiDaTheoDoKho } = require('../../utils/toeicUtils');
const { kiemTraNhomCauHoiTheoPart3_4, kiemTraNhomCauHoiTheoPart6_7 } = require('../../utils/toeicQuestionUtils');
const { where, Op } = require('sequelize');
const striptags = require('striptags');

// Số lượng câu hỏi tối đa trong đề thi
const MAX_QUESTION_TEST = 200;

// [GET] /api/exams
module.exports.index = async (req, res) => {
    try {
        const { page, limit, nam_xuat_ban, trang_thai, muc_do_diem } = req.query;
        
        // Điều kiện lọc
        const where = {
            da_xoa: false
        };
        if (nam_xuat_ban) where.nam_xuat_ban = nam_xuat_ban;
        if (trang_thai) where.trang_thai = trang_thai;
        if (muc_do_diem) where.muc_do_diem = muc_do_diem;

        // Đếm tổng số bản ghi
        const count = await BaiThi.count({
            where,
            distinct: true
        });

        // Phân trang
        let initPagination = {
            currentPage: 1,
            limitItem: 10
        };
        const pagination = createPaginationQuery(
            initPagination,
            { page, limit },
            count
        );

        // Lấy danh sách trạng thái
        const dsTrangThai = BaiThi.rawAttributes.trang_thai.values;
        // Lấy danh sách mức độ điểm
        const dsMucDoDiem = BaiThi.rawAttributes.muc_do_diem.values;
        // Lấy danh sách năm xuất bản
        const dsNamXuatBan = await BaiThi.findAll({ 
            attributes: ['nam_xuat_ban'],
            where: { da_xoa: false },
            group: ['nam_xuat_ban'],
            order: [['nam_xuat_ban', 'ASC']]
        });

        // Lấy danh sách đề thi theo bộ lọc
        const exams = await BaiThi.findAll({
            where,
            include: [
                { model: CauHoiBaiThi, as: 'cau_hoi_cua_bai_thi', attributes: ['id_cau_hoi_bai_thi', 'id_bai_thi', 'id_cau_hoi'] }
            ],
            attributes: [
                'id_bai_thi',
                'ten_bai_thi',
                'mo_ta',
                'la_bai_thi_dau_vao',
                'nam_xuat_ban',
                'trang_thai',
                'so_luong_cau_hoi',
                'diem_toi_da',
                'muc_do_diem',
                'loai_bai_thi',
                'thoi_gian_bai_thi',
                'da_hoan_thien',
                'nguoi_tao',
                'thoi_gian_tao',
                'thoi_gian_cap_nhat'
            ],
            order: [['thoi_gian_tao', 'DESC']],
            offset: pagination.skip,
            limit: pagination.limitItem
        });

        res.status(200).json({
            message: "Đã lấy danh sách đề thi thành công.",
            data: exams,
            pagination: {
                page: pagination.currentPage,
                limit: pagination.limitItem,
                total: count,
                totalPages: pagination.totalPages
            },
            dsTrangThai,
            dsMucDoDiem,
            dsNamXuatBan
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [POST] /api/exams/create
module.exports.createExam = async (req, res) => {
    try {
        const { ten_bai_thi, mo_ta, la_bai_thi_dau_vao, thoi_gian_bai_thi, nam_xuat_ban, loai_bai_thi } = req.body;

        if (!ten_bai_thi || !mo_ta || !thoi_gian_bai_thi || !nam_xuat_ban || typeof la_bai_thi_dau_vao !== 'boolean') {
            return res.status(400).json({ message: "Cần nhập đủ thông tin bài thi." });
        }

        if (loai_bai_thi === 'chuan') {
            if (parseInt(thoi_gian_bai_thi) !== 120) {
                return res.status(400).json({ message: "Đề thi ETS TOIEC chuẩn cần thời gian phải là 120p." });
            }
        } else if (loai_bai_thi === 'tu_do') {
            const thoiGian = parseInt(thoi_gian_bai_thi);
            if (thoiGian < 15 || thoiGian > 120) {
                return res.status(400).json({ message: "Thời gian cho đề thi tự do nằm trong khoảng 15 đến 120 phút." });
            }
        }

        // Kiểm tra nam xuất bản
        const currentYear = new Date().getFullYear();
        if (nam_xuat_ban < 2000 || nam_xuat_ban > currentYear){
            return res.status(400).json({ message: "Năm xuất bản không hợp lệ." });
        }

        // Kiểm tra chỉ có một bài thi đầu vào thôi
        if (la_bai_thi_dau_vao === true) {
            const exam = await BaiThi.findOne({
                where: {
                    la_bai_thi_dau_vao: true,
                    da_xoa: false,
                    trang_thai: 'da_xuat_ban'
                }
            });
            if (exam) {
                return res.status(400).json({ message: "Hiện tại đã có bài thi đầu vào cho hệ thống." });
            }
        }

        // Lưu vào database
        const examDraft = await BaiThi.create({ 
            ten_bai_thi,
            mo_ta: striptags(mo_ta),
            thoi_gian_bai_thi,
            la_bai_thi_dau_vao,
            nam_xuat_ban,
            loai_bai_thi: loai_bai_thi,
            trang_thai: "nhap",
            nguoi_tao: req.user.id_nguoi_dung
        });

        // Trả về thông tin đề thi đã tạo
        const examCreated = await BaiThi.findByPk(
            examDraft.id_bai_thi,
            {
                attributes: [
                    'id_bai_thi',
                    'ten_bai_thi',
                    'mo_ta',
                    'la_bai_thi_dau_vao',
                    'thoi_gian_bai_thi',
                    'nam_xuat_ban',
                    'loai_bai_thi',
                    'trang_thai',
                    'so_luong_cau_hoi',
                    'diem_toi_da',
                    'muc_do_diem',
                    'da_hoan_thien',
                    'nguoi_tao',
                    'thoi_gian_tao',
                    'thoi_gian_cap_nhat'
                ]
        });

        res.status(200).json({ 
            message: "Đã tạo đề thi nháp!",
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
                { model: PhanCauHoi, as: 'phan', attributes: ['id_phan','ten_phan', 'loai_phan', 'co_hinh_anh', 'co_am_thanh', 'co_doan_van'] },
                { 
                    model: DoanVan, 
                    as: 'doan_van', 
                    attributes: ['id_doan_van', 'tieu_de','noi_dung', 'loai_doan_van', 'id_phan'],
                    include: [
                        { 
                            model: PhuongTien,
                            as: 'danh_sach_phuong_tien',
                            attributes: ['id_phuong_tien', 'loai_phuong_tien', 'url_phuong_tien']
                        }
                    ]
                },
                { model: PhuongTien, as: 'hinh_anh', attributes: ['id_phuong_tien','url_phuong_tien'] },
                { model: PhuongTien, as: 'am_thanh', attributes: ['id_phuong_tien','url_phuong_tien'] },
                { model: LuaChon, as: 'lua_chon', attributes: ['ky_tu_lua_chon', 'noi_dung'] }
            ],
            attributes: [
                'id_cau_hoi',
                'noi_dung',
                'dap_an_dung',
                'giai_thich',
                'muc_do_kho',
                'trang_thai',
                'id_phuong_tien_hinh_anh',
                'id_phuong_tien_am_thanh',
                'id_phan',
                'id_doan_van',
                'nguon_goc',
                'thoi_gian_tao',
                'thoi_gian_cap_nhat'
            ],
            offset: pagination.skip,
            limit: pagination.limitItem
        });
        
        res.status(200).json({ 
            message: "Lấy danh sách câu hỏi thành công.",
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
        const { ds_cau_hoi } = req.body;
        
        // Kiểm tra đề thi tồn tại không
        const exam = await BaiThi.findByPk(id_bai_thi);
        if (!exam) {
            return res.status(404).json({ message: "Bài thi không tồn tại." });
        }

        // Kiểm tra danh sách câu hỏi có hợp lệ không
        if (ds_cau_hoi.length > MAX_QUESTION_TEST) {
            return res.status(400).json({ message: `Tổng số câu hỏi không được vượt quá ${MAX_QUESTION_TEST} câu.` });
        }

        // Kiểm tra danh sách câu hỏi
        const questions = await NganHangCauHoi.findAll({
            where: {
                id_cau_hoi: ds_cau_hoi,
                da_xoa: false
            }
        });
        if (questions.length !== ds_cau_hoi.length) {
            return res.status(404).json({ message: "Không tìm thấy 1 số câu hỏi." });
        }

        // Kiểm tra Part 3&4, Part 6&7 những câu hỏi khi thêm vào đề thi phải đi cùng nhau
        const thongBaoLoiPart3_4 = await kiemTraNhomCauHoiTheoPart3_4(ds_cau_hoi);
        if (thongBaoLoiPart3_4) return res.status(400).json({ message: thongBaoLoiPart3_4 });

        const thongBaoLoiPart6_7 = await kiemTraNhomCauHoiTheoPart6_7(ds_cau_hoi);
        if (thongBaoLoiPart6_7) return res.status(400).json({ message: thongBaoLoiPart6_7 });

        // Loại đề thi
        const loaiDeThi = exam.loai_bai_thi;

        // Kiểm tra số câu đúng câu trúc của từng Part
        const cauTrucToiec = { 1: 6, 2: 25, 3: 39, 4: 30, 5: 30, 6: 16, 7: 54 };

        if (loaiDeThi === 'chuan') {
            // Đếm số câu theo Part
            const demSoCauTheoPart = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
    
            for (let i = 0; i < ds_cau_hoi.length; i++) {        
                const cauHoi = await NganHangCauHoi.findByPk(ds_cau_hoi[i]);   
                
                const part = cauHoi.id_phan;
                if (demSoCauTheoPart[part] !== undefined) {
                    demSoCauTheoPart[part]++;
                }
            }
    
            for (const part in cauTrucToiec) {
                const soCauThucTe = demSoCauTheoPart[part];
                const soCauChuanPart = cauTrucToiec[part];
    
                if (soCauThucTe !== soCauChuanPart) {
                    return res.status(400).json({ message:`Part ${part} cần ${soCauChuanPart}, nhưng hiện có ${soCauThucTe} câu hỏi.` });
                }
            }
    
        // Kết thúc kiểm tra số câu đúng câu trúc của từng Part
        } else if (loaiDeThi === 'tu_do') {
            if (ds_cau_hoi.length > MAX_QUESTION_TEST) {
                return res.status(400).json({ message:`Tổng số câu hỏi không được vượt quá ${MAX_QUESTION_TEST} câu.` });
            }

            for (const part in cauTrucToiec) {
                if (cauTrucToiec[part] === 0) {
                    return res.status(400).json({ message:`Part ${part} yêu cầu ít nhất 1 câu.` });
                }
            }
        } else {
            return res.status(400).json({ message: `Loại bài thi không hợp lệ: ${loaiDeThi}.` });
        }
        
        // Duyệt qua danh sách câu hỏi
        const questionsToAdd = [];
        for (const question of questions) {
            // Kiểm tra câu hỏi trong đề thi đã tồn tại chưa
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
        const diem_toi_da = await calculateDiemToiDaTheoDoKho(ds_cau_hoi);
        const muc_do_info = await layMucDoDiemToiecTuDiemToiDa(diem_toi_da);
        const muc_do_diem = `${muc_do_info.range[0]}-${muc_do_info.range[1]}`;
        const id_muc_do = muc_do_info.id_muc_do;

        let da_hoan_thien = false;
        if (loaiDeThi === 'chuan') {
            da_hoan_thien = tong_so_cau_hoi === MAX_QUESTION_TEST;
        } else if (loaiDeThi === 'tu_do') {
            da_hoan_thien = true;
        }

        // Cập nhật đề thi với thông tin còn lại
        await BaiThi.update(
            {
                so_luong_cau_hoi: tong_so_cau_hoi,
                diem_toi_da: diem_toi_da,
                muc_do_diem: muc_do_diem,
                id_muc_do: id_muc_do,
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
                                { 
                                    model: DoanVan, 
                                    as: 'doan_van', 
                                    attributes: ['id_doan_van', 'tieu_de', 'noi_dung', 'loai_doan_van', 'id_phan', 'thoi_gian_tao'],
                                    include: [
                                        {
                                            model: PhuongTien,
                                            as: 'danh_sach_phuong_tien',
                                            attributes: ['id_phuong_tien', 'loai_phuong_tien', 'url_phuong_tien']
                                        }
                                    ] 
                                },
                                { model: PhuongTien, as: 'hinh_anh', attributes: ['id_phuong_tien', 'url_phuong_tien', 'loai_phuong_tien'] },
                                { model: PhuongTien, as: 'am_thanh', attributes: ['id_phuong_tien', 'url_phuong_tien', 'loai_phuong_tien'] },
                                { model: LuaChon, as: 'lua_chon', attributes: ['ky_tu_lua_chon', 'noi_dung'] }
                            ]
                        }
                    ], 
                    attributes: ['id_cau_hoi', 'id_bai_thi']
                }
            ]
        });
        
        res.status(200).json({ 
            message: "Đã thêm câu hỏi vào đề thi và tạo bảng nháp.",
            dataa: examWithQuestions
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [GET] /api/exams/draft/:id_bai_thi
module.exports.getDraftExam = async (req, res) => {
    try {
        const { id_bai_thi } = req.params;
        // Kiểm tra đề thi tồn tại không
        const examWithDraft = await BaiThi.findByPk(id_bai_thi,{
            attributes: [
                'id_bai_thi',
                'ten_bai_thi',
                'mo_ta',
                'so_luong_cau_hoi',
                'muc_do_diem',
                'thoi_gian_bai_thi',
                'la_bai_thi_dau_vao',
                'nam_xuat_ban',
                'diem_toi_da',
                'loai_bai_thi',
                'id_muc_do',
                'trang_thai',
                'nguoi_tao',
                'thoi_gian_tao',
                'thoi_gian_cap_nhat'
            ],
            include: [
                {
                    model: CauHoiBaiThi,
                    as: 'cau_hoi_cua_bai_thi',
                    include: [
                        {
                            model: NganHangCauHoi,
                            as: 'cau_hoi',
                            attributes: ['id_cau_hoi', 'noi_dung', 'dap_an_dung', 'giai_thich', 'muc_do_kho', 'trang_thai', 'id_phuong_tien_hinh_anh', 'id_phuong_tien_am_thanh', 'id_phan', 'id_doan_van', 'nguon_goc', 'thoi_gian_tao', 'thoi_gian_cap_nhat'],
                            include: [
                                { model: PhanCauHoi, as: 'phan', attributes: ['id_phan', 'ten_phan', 'loai_phan', 'mo_ta'] },
                                { 
                                    model: DoanVan, 
                                    as: 'doan_van', 
                                    attributes: ['id_doan_van', 'tieu_de', 'noi_dung', 'loai_doan_van', 'id_phan', 'thoi_gian_tao'],
                                    include: [
                                        {
                                            model: PhuongTien,
                                            as: 'danh_sach_phuong_tien',
                                            attributes: ['id_phuong_tien', 'loai_phuong_tien', 'url_phuong_tien']
                                        }
                                    ] 
                                },
                                { model: PhuongTien, as: 'hinh_anh', attributes: ['id_phuong_tien', 'url_phuong_tien', 'loai_phuong_tien'] },
                                { model: PhuongTien, as: 'am_thanh', attributes: ['id_phuong_tien', 'url_phuong_tien', 'loai_phuong_tien'] },
                                { model: LuaChon, as: 'lua_chon', attributes: ['ky_tu_lua_chon', 'noi_dung'] }
                            ]
                        }
                    ], 
                    attributes: ['id_cau_hoi', 'id_bai_thi']
                }
            ]
        });

        if (!examWithDraft) {
            return res.status(400).json({ message: "Đề thi không tồn tại hoặc chưa tạo bản nháp." });
        }

        res.status(200).json({ 
            message: "Lấy thông tin bản nháp thành công.",
            data: examWithDraft
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [POST] /api/exams/approve/:id_bai_thi
module.exports.approveExam = async (req, res) => {
    try {
        const { id_bai_thi } = req.params;
        // Kiểm tra bài thi tồn tại không
        const exam = await BaiThi.findByPk(id_bai_thi);
        if (!exam) {
            return res.status(400).json({ message: "Đề thi không tồn tại." });
        }

        if (exam.trang_thai !== 'nhap') {
            return res.status(400).json({ message: "Chỉ duyệt đề thi ở trạng thái." });
        }

        // Duyệt đề thi
        await BaiThi.update(
            {
                trang_thai: 'da_xuat_ban',
                thoi_gian_cap_nhat: new Date(),
            },
            { where: { id_bai_thi } }
        );

        res.status(200).json({ message: "Đã duyệt đề thi để xuất bản."});

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [DELETE] /api/exams/delete/:id_bai_thi
module.exports.deleteExam = async (req, res) => {
    try {
        const { id_bai_thi } = req.params;

        const exam = await BaiThi.findByPk(id_bai_thi);
        if (!exam) {
            return res.status(404).json({ message: "Đề thi không tồn tại." });
        }

        // Kiểm tra đề thi đã có người dùng làm chưa
        const coNguoiLam = await BaiLamNguoiDung.findOne({
            where: { id_bai_thi: id_bai_thi }
        });
        if (coNguoiLam) {
            return res.status(400).json({ message: "Đề thi đã có người dùng sử dụng. Không xóa được." });
        }

        // Xóa đề thi (xóa mềm)
        await BaiThi.update({
            da_xoa: true,
            trang_thai: 'luu_tru',
            thoi_gian_luu_tru: new Date(),
            thoi_gian_cap_nhat: new Date()
        }, {
            where: { id_bai_thi }
        });

        res.status(200).json({ message: "Đã xóa đề thi chuyển vào kho lưu trữ." });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [PUT] /api/exams/edit/:id_bai_thi
module.exports.editExam = async (req, res) => {
    try {
        // Dữ liệu nhận được
        const { id_bai_thi } = req.params;
        
        // Kiểm tra đề thi tồn tại không
        const exam = await BaiThi.findByPk(id_bai_thi);
        if (!exam) {
            return res.status(404).json({ message: "Đề thi không tồn tại." });
        }

        // Cập nhật thông tin đề thi
        const dataUpdateExam = {};
        if (req.body.ten_bai_thi) dataUpdateExam.ten_bai_thi = req.body.ten_bai_thi;
        if (req.body.mo_ta) dataUpdateExam.mo_ta = striptags(req.body.mo_ta);
        if (req.body.thoi_gian_bai_thi) dataUpdateExam.thoi_gian_bai_thi = req.body.thoi_gian_bai_thi;
        if (req.body.nam_xuat_ban) dataUpdateExam.nam_xuat_ban = req.body.nam_xuat_ban;
        if (req.body.hasOwnProperty('la_bai_thi_dau_vao')) {
            dataUpdateExam.la_bai_thi_dau_vao = req.body.la_bai_thi_dau_vao;
        }
        
        if (Object.keys(dataUpdateExam).length > 0) {
            dataUpdateExam.thoi_gian_cap_nhat = new Date();
            // Cập nhật bảng bai_thi
            await BaiThi.update(
                dataUpdateExam,
                {
                    where: { id_bai_thi: id_bai_thi }
                }
            );
        } 

        res.status(200).json({ 
            message: "Đã chỉnh sửa đề thi thành công."
        });
        
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// [GET] /api/get-all-exam-public
module.exports.getExamTest = async (req, res) => {
    try {
        const { page, limit, nam_xuat_ban } = req.query;

        // Điều kiện lọc
        const where = {
            da_xoa: false,
            trang_thai: 'da_xuat_ban',
            la_bai_thi_dau_vao: false
        };
        if (nam_xuat_ban) where.nam_xuat_ban = nam_xuat_ban;

        // Đếm tổng số bản ghi
        const count = await BaiThi.count({
            where,
            distinct: true
        });

        // Phân trang
        let initPagination = {
            currentPage: 1,
            limitItem: 10
        };
        const pagination = createPaginationQuery(
            initPagination,
            { page, limit },
            count
        );

        // Lấy danh sách năm xuất bản
        const dsNamXuatBan = await BaiThi.findAll({ 
            attributes: ['nam_xuat_ban'],
            where: { da_xoa: false },
            group: ['nam_xuat_ban'],
            order: [['nam_xuat_ban', 'ASC']]
        });

        // Lấy danh sách đề thi theo bộ lọc
        const exams = await BaiThi.findAll({
            where,
            attributes: [
                'id_bai_thi',
                'ten_bai_thi',
                'mo_ta',
                'la_bai_thi_dau_vao',
                'nam_xuat_ban',
                'trang_thai',
                'so_luong_cau_hoi',
                'diem_toi_da',
                'muc_do_diem',
                'loai_bai_thi',
                'thoi_gian_bai_thi',
                'nguoi_tao',
                'thoi_gian_tao',
                'thoi_gian_cap_nhat',
                'id_muc_do'
            ],
            order: [['thoi_gian_tao', 'DESC']],
            offset: pagination.skip,
            limit: pagination.limitItem
        });

        const deThiGoiY = exams.map(exam => {
            const examData = exam.toJSON();
            examData.goi_y_luyen_tap = false;
            return examData;
        })
        
        res.status(200).json({
            message: "Đã lấy danh sách đề thi thành công.",
            data: deThiGoiY,
            pagination: {
                page: pagination.currentPage,
                limit: pagination.limitItem,
                total: count,
                totalPages: pagination.totalPages
            },
            dsNamXuatBan
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [GET] /api/get-all-exam-user
module.exports.getExamTestUser = async (req, res) => {
    try {
        const { page, limit, nam_xuat_ban } = req.query;

        // Điều kiện lọc
        const where = {
            da_xoa: false,
            trang_thai: 'da_xuat_ban',
            la_bai_thi_dau_vao: false
        };
        if (nam_xuat_ban) where.nam_xuat_ban = nam_xuat_ban;

        // Đếm tổng số bản ghi
        const count = await BaiThi.count({
            where,
            distinct: true
        });

        // Phân trang
        let initPagination = {
            currentPage: 1,
            limitItem: 10
        };
        const pagination = createPaginationQuery(
            initPagination,
            { page, limit },
            count
        );

        // Lấy danh sách năm xuất bản
        const dsNamXuatBan = await BaiThi.findAll({ 
            attributes: ['nam_xuat_ban'],
            where: { da_xoa: false },
            group: ['nam_xuat_ban'],
            order: [['nam_xuat_ban', 'ASC']]
        });

        // Lấy danh sách đề thi theo bộ lọc
        const exams = await BaiThi.findAll({
            where,
            attributes: [
                'id_bai_thi',
                'ten_bai_thi',
                'mo_ta',
                'la_bai_thi_dau_vao',
                'nam_xuat_ban',
                'trang_thai',
                'so_luong_cau_hoi',
                'diem_toi_da',
                'muc_do_diem',
                'loai_bai_thi',
                'thoi_gian_bai_thi',
                'nguoi_tao',
                'thoi_gian_tao',
                'thoi_gian_cap_nhat',
                'id_muc_do'
            ],
            include: [
                {
                    model: MucDoToiec,
                    as: 'muc_do',
                    attributes: ['id_muc_do', 'diem_bat_dau', 'diem_ket_thuc']
                }
            ],
            order: [['thoi_gian_tao', 'DESC']],
            offset: pagination.skip,
            limit: pagination.limitItem
        });

        let idNguoiDung = null;
        let mucDoDiemNguoiDung = null;

        // Kiểm tra người dùng đã đăng nhập chưa
        if (req.user) {
            idNguoiDung = req.user.id_nguoi_dung;

            // Lấy bài thi đầu vào của người dùng
            const baiLamDauVao = await BaiLamNguoiDung.findOne({
                where: {
                    id_nguoi_dung: idNguoiDung,
                    da_hoan_thanh: true
                },
                include: [
                    {
                        model: BaiThi,
                        as: 'bai_thi_nguoi_dung',
                        attributes: ['id_bai_thi', 'ten_bai_thi', 'la_bai_thi_dau_vao'],
                        where: {
                            da_xoa: false,
                            trang_thai: 'da_xuat_ban',
                            la_bai_thi_dau_vao: true
                        }
                    }
                ],
            });

            // Nếu người dùng đã làm bài thi đầu vào
            if (baiLamDauVao) {
                const tongDiem = baiLamDauVao.tong_diem; // 230

                // Truy vấn mức độ điểm phù hợp
                mucDoDiemNguoiDung = await MucDoToiec.findOne({
                    where: {
                        diem_bat_dau: { [Op.lte]: tongDiem },
                        diem_ket_thuc: { [Op.gte]: tongDiem }
                    }
                }); // 2
            }
        }

        // Đánh dấu những đề thi gợi ý cần luyện tập
        const deThiGoiY = exams.map(exam => {
            const examData = exam.toJSON(); // Chuyển đổi sang JSON
            if (mucDoDiemNguoiDung && examData.muc_do.diem_bat_dau >= mucDoDiemNguoiDung.diem_bat_dau) {
                examData.goi_y_luyen_tap = true;
            } else {
                examData.goi_y_luyen_tap = false;
            }
            return examData;
        })
        
        res.status(200).json({
            message: "Đã lấy danh sách đề thi thành công.",
            data: deThiGoiY,
            pagination: {
                page: pagination.currentPage,
                limit: pagination.limitItem,
                total: count,
                totalPages: pagination.totalPages
            },
            dsNamXuatBan
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [GET] /api/exams/detail-exam-public/:id_bai_thi
module.exports.detailExamTest = async (req, res) => {
    try {
        const { id_bai_thi } = req.params;

        // Kiểm tra đề thi tồn tại không
        const detailExamTest = await BaiThi.findByPk(id_bai_thi,{
            attributes: [
                'id_bai_thi',
                'ten_bai_thi',
                'mo_ta',
                'so_luong_cau_hoi',
                'muc_do_diem',
                'thoi_gian_bai_thi',
                'la_bai_thi_dau_vao',
                'nam_xuat_ban',
                'diem_toi_da',
                'loai_bai_thi',
                'trang_thai',
                'nguoi_tao',
                'thoi_gian_tao',
                'thoi_gian_cap_nhat'
            ],
            include: [
                {
                    model: CauHoiBaiThi,
                    as: 'cau_hoi_cua_bai_thi',
                    include: [
                        {
                            model: NganHangCauHoi,
                            as: 'cau_hoi',
                            attributes: ['id_cau_hoi', 'noi_dung', 'dap_an_dung', 'giai_thich', 'muc_do_kho', 'trang_thai', 'id_phuong_tien_hinh_anh', 'id_phuong_tien_am_thanh', 'id_phan', 'id_doan_van', 'nguon_goc', 'thoi_gian_tao', 'thoi_gian_cap_nhat'],
                            include: [
                                { model: PhanCauHoi, as: 'phan', attributes: ['id_phan', 'ten_phan', 'loai_phan', 'mo_ta'] },
                                { 
                                    model: DoanVan, 
                                    as: 'doan_van', 
                                    attributes: ['id_doan_van', 'tieu_de', 'noi_dung', 'loai_doan_van', 'id_phan', 'thoi_gian_tao'],
                                    include: [
                                        {
                                            model: PhuongTien,
                                            as: 'danh_sach_phuong_tien',
                                            attributes: ['id_phuong_tien', 'loai_phuong_tien', 'url_phuong_tien']
                                        }
                                    ] 
                                },
                                { model: PhuongTien, as: 'hinh_anh', attributes: ['id_phuong_tien', 'url_phuong_tien', 'loai_phuong_tien'] },
                                { model: PhuongTien, as: 'am_thanh', attributes: ['id_phuong_tien', 'url_phuong_tien', 'loai_phuong_tien'] },
                                { model: LuaChon, as: 'lua_chon', attributes: ['ky_tu_lua_chon', 'noi_dung'] }
                            ]
                        }
                    ], 
                    attributes: ['id_cau_hoi', 'id_bai_thi']
                },
                {
                    model: BaiLamNguoiDung,
                    as: 'bai_lam',
                    attributes: [
                        "id_bai_lam_nguoi_dung",
                        "id_nguoi_dung",
                        "da_hoan_thanh"
                    ],
                },
            ],
        });

        if (!detailExamTest) {
            return res.status(400).json({ message: "Đề thi không tồn tại." });
        }

        res.status(200).json({ 
            message: "Lấy thông tin chi tiết đề thi thành công.",
            data: detailExamTest
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [GET] /api/exams/get-exam-dau-vao
module.exports.getExamDauVao = async (req, res) => {
    try {
        const examDauVao = await BaiThi.findAll({
            where: {
                la_bai_thi_dau_vao: true,
                da_xoa: false,
                trang_thai: 'da_xuat_ban'
            },
            attributes: [
                'id_bai_thi',
                'ten_bai_thi',
                'mo_ta',
                'la_bai_thi_dau_vao',
                'nam_xuat_ban',
                'trang_thai',
                'so_luong_cau_hoi',
                'diem_toi_da',
                'muc_do_diem',
                'loai_bai_thi',
                'thoi_gian_bai_thi',
                'id_muc_do',
                'da_hoan_thien',
                'nguoi_tao',
                'thoi_gian_tao',
                'thoi_gian_cap_nhat'
            ],
        });

        res.status(200).json({ 
            message: "Đã lấy bài thi đầu vào!",
            data: examDauVao
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [PATCH] /api/exams/unset-entry-exam/:id_bai_thi
module.exports.unsetEntryExam = async (req, res) => {
    try {
        const { id_bai_thi } = req.params;

        const exam = await BaiThi.findByPk(id_bai_thi);
        if (!exam || exam.da_xoa || !exam.la_bai_thi_dau_vao) {
            return res.status(404).json({ message: 'Bài thi không tồn tại hoặc không phải bài thi đầu vào.' });
        }

        // Gỡ bài thi đầu vào, thay đổi la_bai_thi_dau_vao
        exam.la_bai_thi_dau_vao = false;
        await exam.save();

        res.status(200).json({ message: "Đã gỡ bài thi đầu vào. Hãy thêm mới 1 bài thi đầu vào mới." });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [GET] /api/exams/detail-entry-exam
module.exports.getDetailEntryExam = async (req, res) => {
    try {
        const baiThiDauVao = await BaiThi.findOne({
            where: {
                la_bai_thi_dau_vao: true,
                da_xoa: false,
                trang_thai: 'da_xuat_ban'
            },
            attributes: [
                'id_bai_thi',
                'ten_bai_thi',
                'mo_ta',
                'so_luong_cau_hoi',
                'muc_do_diem',
                'thoi_gian_bai_thi',
                'la_bai_thi_dau_vao',
                'nam_xuat_ban',
                'diem_toi_da',
                'loai_bai_thi',
                'trang_thai',
                'nguoi_tao',
                'thoi_gian_tao',
                'thoi_gian_cap_nhat'
            ],
        });

        if (!baiThiDauVao) {
            return res.status(404).json({ message: "Không tìm thấy bài thi đầu vào." });
        }

        res.status(200).json({ 
            message: "Lấy thông tin bài thi đầu vào thành công.",
            data: baiThiDauVao
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [POST] /api/exams/check-entry-exam/:id_bai_thi
module.exports.checkEntryExam = async (req, res) => {
    try {
        const { id_bai_thi } = req.params;

        // Lấy thông tin user khi đăng nhập
        const user = req.user;

        // Kiểm tra đề thi
        const exam = await BaiThi.findByPk(id_bai_thi);
        if (!exam) {
            return res.status(404).json({ message: "Đề thi không tồn tại." });
        }

        if (!exam.la_bai_thi_dau_vao) {
            const baiLamDauVao = await BaiLamNguoiDung.findOne({
                where: {
                    id_nguoi_dung: user.id_nguoi_dung,
                    da_hoan_thanh: true,
                },
                include: [
                    {
                        model: BaiThi,
                        as: 'bai_thi_nguoi_dung',
                        where: {
                            da_xoa: false,
                            trang_thai: 'da_xuat_ban',
                            la_bai_thi_dau_vao: true
                        },
                    },
                ],
            });

            if (!baiLamDauVao) {
                return res.status(400).json({ message: "Bạn cần làm bài thi đầu vào để đánh giá năng lực trước khi luyện tập đề." });
            }
        }

        res.status(200).json({ message: "Hãy bắt đầu làm thi." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
const BaiThi = require('../../models/baiThi.model');
const NganHangCauHoi = require('../../models/nganHangCauHoi.model');
const PhanCauHoi= require('../../models/phanCauHoi.model');
const DoanVan = require('../../models/doanVan.model');
const PhuongTien = require('../../models/phuongTien.model');
const LuaChon = require('../../models/luaChon.model');
const CauHoiBaiThi = require('../../models/cauHoiBaiThi.model');
const BaiLamNguoiDung = require('../../models/baiLamNguoiDung.model');
const DoanVanPhuongTien = require('../../models/doanVanPhuongTien.model');
const { createPaginationQuery } = require('../../utils/pagination');
const { where } = require('sequelize');
const striptags = require('striptags');

// Số lượng câu hỏi tối đa trong đề thi
const MAX_QUESTION_TEST = 200;

// Hàm tính điểm tối đa
const calculateMaxScore = (tongSoCauHoi) => {
    return Math.round((tongSoCauHoi / MAX_QUESTION_TEST) * 990);
};

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
            message: "Đã lấy danh sách đề thi thành công!",
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
        const { ten_bai_thi, mo_ta, la_bai_thi_dau_vao, thoi_gian_bai_thi, nam_xuat_ban } = req.body;

        if (!ten_bai_thi || !mo_ta || !thoi_gian_bai_thi || !nam_xuat_ban || typeof la_bai_thi_dau_vao !== 'boolean') {
            return res.status(400).json({ message: "Cần nhập đủ thông tin bài thi!" });
        }

        if (thoi_gian_bai_thi <= 45 || thoi_gian_bai_thi > 120) {
            return res.status(400).json({ message: "Thời gian làm bài thi không hợp lệ. Nẳm trong khoảng 45 đến 120p!" });
        }

        // Kiểm tra nam xuất bản
        const currentYear = new Date().getFullYear();
        if (nam_xuat_ban < 2000 || nam_xuat_ban > currentYear){
            return res.status(400).json({ message: "Năm xuất bản không hợp lệ!" });
        }

        // Lưu vào database
        const examDraft = await BaiThi.create({ 
            ten_bai_thi,
            mo_ta: striptags(mo_ta),
            thoi_gian_bai_thi,
            la_bai_thi_dau_vao,
            nam_xuat_ban,
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
        const { ds_cau_hoi } = req.body;
        
        // Kiểm tra đề thi tồn tại không
        const exam = await BaiThi.findByPk(id_bai_thi);
        if (!exam) {
            return res.status(404).json({ message: "Bài thi không tồn tại!" });
        }

        // Kiểm tra danh sách câu hỏi có hợp lệ không
        if (ds_cau_hoi.length > MAX_QUESTION_TEST) {
            return res.status(400).json({ message: `Tổng số câu hỏi không được vượt quá ${MAX_QUESTION_TEST} câu!` });
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

        // Kiểm tra số câu đúng câu trúc của từng Part
        const cauTrucToiec = { 1: 6, 2: 25, 3: 39, 4: 30, 5: 30, 6: 16, 7: 54 };

        // Đếm số câu theo Part
        const demSoCauTheoPart = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };

        for (let i = 0; i < ds_cau_hoi.length; i++) {        
            const cauHoi = await NganHangCauHoi.findByPk(ds_cau_hoi[i]);   
            
            const part = cauHoi.id_phan;
            if (demSoCauTheoPart[part] !== undefined) {
                demSoCauTheoPart[part]++;
            }
            console.log(`Câu hỏi ${ds_cau_hoi[i]} - Part ${part}`);
        }

        let thongBaoLoi = [];
        for (const part in cauTrucToiec) {
            const soCauThucTe = demSoCauTheoPart[part];
            const soCauChuanPart = cauTrucToiec[part];

            if (soCauThucTe !== soCauChuanPart) {
                thongBaoLoi.push(`Part ${part} cần ${soCauChuanPart}, nhưng hiện có ${soCauThucTe} câu hỏi!`);
            }
        }

        if (thongBaoLoi.length > 0) {
            return res.status(400).json({ message: thongBaoLoi.join('\n') });
        }
        // Kết thúc kiểm tra số câu đúng câu trúc của từng Part
        
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
        const diem_toi_da = calculateMaxScore(tong_so_cau_hoi);
        const muc_do_diem = `0-${diem_toi_da}`;
        const da_hoan_thien = tong_so_cau_hoi === MAX_QUESTION_TEST;

        // Cập nhật đề thi với thông tin còn lại
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

        console.log("Thông tin đề thi sau khi cập nhật:", examWithQuestions);
        
        res.status(200).json({ 
            message: "Đã thêm câu hỏi và tạo bảng nháp!",
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
            return res.status(400).json({ message: "Đề thi không tồn tại hoặc chưa tạo bản nháp!" });
        }

        res.status(200).json({ 
            message: "Lấy thông tin bản nháp thành công!",
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
            return res.status(400).json({ message: "Đề thi không tồn tại!" });
        }

        if (exam.trang_thai !== 'nhap') {
            return res.status(400).json({ message: "Chỉ duyệt đề thi ở trạng thái!" });
        }

        // Duyệt đề thi
        await BaiThi.update(
            {
                trang_thai: 'da_xuat_ban',
                thoi_gian_cap_nhat: new Date(),
            },
            { where: { id_bai_thi } }
        );

        res.status(200).json({ message: "Đã duyệt đề thi để xuất bản!"});

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
            return res.status(404).json({ message: "Đề thi không tồn tại!" });
        }

        // Kiểm tra đề thi đã có người dùng làm chưa
        const coNguoiLam = await BaiLamNguoiDung.findOne({
            where: { id_bai_thi: id_bai_thi }
        });
        if (coNguoiLam) {
            return res.status(400).json({ message: "Đề thi đã có người dùng sử dụng. Không xóa được!" });
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

        res.status(200).json({ message: "Đã xóa đề thi chuyển vào kho lưu trữ!" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [PUT] /api/exams/edit/:id_bai_thi
module.exports.editExam = async (req, res) => {
    try {
        // Dữ liệu nhận được
        const { id_bai_thi } = req.params;
        const { ds_cau_hoi } = req.body;
        console.log("ID de thi: ", id_bai_thi);
        console.log("Data request: ", req.body);
        
        // Kiểm tra đề thi tồn tại không
        const exam = await BaiThi.findByPk(id_bai_thi);
        if (!exam) {
            return res.status(404).json({ message: "Đề thi không tồn tại!" });
        }

        // Kiểm tra đề thi đã có người dùng làm chưa
        const coNguoiLam = await BaiLamNguoiDung.findOne({
            where: { id_bai_thi: id_bai_thi }
        });
        if (coNguoiLam) {
            return res.status(400).json({ message: "Đề thi đã có người dùng sử dụng. Không thể chỉnh sửa trực tiếp!" });
        }

        // Cập nhật thông tin đề thi
        const dataUpdateExam = {};
        if (req.body.ten_bai_thi) dataUpdateExam.ten_bai_thi = req.body.ten_bai_thi;
        if (req.body.mo_ta) dataUpdateExam.mo_ta = striptags(req.body.mo_ta);
        if (req.body.thoi_gian_bai_thi) dataUpdateExam.thoi_gian_bai_thi = thoi_gian_bai_thi;
        if (req.body.nam_xuat_ban) dataUpdateExam.nam_xuat_ban = nam_xuat_ban;
        
        if (Object.keys(dataUpdateExam) > 0) {
            dataUpdateExam.thoi_gian_cap_nhat = new Date();
            // Cập nhật bảng bai_thi
            await BaiThi.update(
                dataUpdateExam,
                {
                    where: { id_bai_thi: id_bai_thi }
                }
            );
        }

        // Xử lý cập nhật thay đổi câu hỏi khác
         

        


        res.status(200).json({ 
            message: "Đã chỉnh sửa đề thi thành ông!",
            data: examUpdated
        });
        
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

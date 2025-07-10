const BaiThi = require("../../models/baiThi.model");
const BaiLamNguoiDung = require("../../models/baiLamNguoiDung.model");
const NganHangCauHoi = require("../../models/nganHangCauHoi.model");
const PhanCauHoi = require("../../models/phanCauHoi.model");
const CauTraLoiNguoiDung = require("../../models/cauTraLoiNguoiDung.model");
const LuaChon = require("../../models/luaChon.model");
const NguoiDung = require("../../models/nguoiDung.model");
const HoSoNguoiDung = require("../../models/hoSoNguoiDung.model");
const CauHoiBaiThi = require("../../models/cauHoiBaiThi.model");
const DoanVan = require("../../models/doanVan.model");
const PhuongTien = require("../../models/phuongTien.model");

const { listeningScoreTable, readingScoreTable } = require('../../utils/toeicScoreTable');
const { createPaginationQuery } = require('../../utils/pagination');

const { Sequelize } = require('sequelize'); // nếu chưa import
// const { sequelize } = require('../models'); 
const sequelize = require('../../config/database'); // đường dẫn config Sequelize

// [POST] /api/results/submit-exam
module.exports.submitExam = async (req, res) => {
    try {      
        const { id_nguoi_dung, id_bai_thi, answers } = req.body;    
            
        // Kiểm tra đề thi
        const exam = await BaiThi.findByPk(id_bai_thi, {
            attributes: ['diem_toi_da', 'so_luong_cau_hoi', 'loai_bai_thi']
        });    
        if (!exam) {
            return res.status(400).json({ message: "Bài thi không tồn tại!" });
        }
    
        const { so_luong_cau_hoi, loai_bai_thi } = exam;
    
        // Lưu vào bảng bai_lam_nguoi_dung
        const submit = await BaiLamNguoiDung.create({
            id_nguoi_dung: id_nguoi_dung,
            id_bai_thi: id_bai_thi,
            thoi_gian_bat_dau: new Date(),
            thoi_gian_ket_thuc: new Date(),
            da_hoan_thanh: true
        });
    
        // Số câu đúng của Listening và Reading
        let correctListening = 0;
        let correctReading = 0;
    
        // Duyệt mảng câu hỏi và câu trả lời
        for (const answer of answers) {
            const { id_cau_hoi, ky_tu_lua_chon } = answer;
    
            // Tìm câu hỏi
            const question = await NganHangCauHoi.findByPk(id_cau_hoi, {
                include: [
                    { model: PhanCauHoi, as: 'phan', attributes: ['loai_phan'] },
                    { model: LuaChon, as: 'lua_chon' }
                ]
            });            
            if (!question) continue;
    
            const loaiPhan = question.phan.loai_phan;

            // Xử lý số câu trả lời đúng, sai, bỏ trống
            let isCorrect = false;
            let daTraLoi = false;
            
            // Tính số câu đúng mỗi phần
            if (ky_tu_lua_chon) {
                daTraLoi = true;
                isCorrect = String(ky_tu_lua_chon).toUpperCase() === question.dap_an_dung ;

                // Đếm số câu đúng
                if (isCorrect) {
                    if (loaiPhan === 'listening') correctListening++;
                    else if (loaiPhan === 'reading') correctReading++;
                }
            }
    
            // Lưu cau_tra_loi_cua_nguoi_dung
            await CauTraLoiNguoiDung.create({
                id_bai_lam_nguoi_dung: submit.id_bai_lam_nguoi_dung,
                id_cau_hoi: id_cau_hoi,
                lua_chon_da_chon: ky_tu_lua_chon || null,
                la_dung: isCorrect,
                da_tra_loi: daTraLoi,
                thoi_gian_tra_loi: new Date()
            });      
        }
    
        // Tổng số câu Listening và Reading
        let maxListeningQuestion = 0;
        let maxReadingQuestion = 0;
    
        // Số lượng câu hỏi Listening và Reading
        // Bài thi chuẩn
        if (loai_bai_thi === 'chuan' && so_luong_cau_hoi === 200) {
            maxListeningQuestion = 100;
            maxReadingQuestion = 100;
        } else {
            // Bài thi tự do
            const questions = await NganHangCauHoi.findAll({
                where: { id_cau_hoi: answers.map(answer => answer.id_cau_hoi) },
                include: [
                    { model: PhanCauHoi, as: 'phan', attributes: ['loai_phan'] }
                ]
            });
    
            const counts = { listening: 0, reading: 0 }
            questions.forEach(question => {
                if (question.phan.loai_phan === 'listening') counts.listening++;
                else if (question.phan.loai_phan === 'reading') counts.reading++;
            });
    
            maxListeningQuestion = counts.listening;
            maxReadingQuestion = counts.reading;           
        }
    
        // Quy đổi điểm thi từng phần
        let listeningScore = 0, readingScore = 0;
        if (loai_bai_thi === 'chuan' && so_luong_cau_hoi === 200) {
            listeningScore = listeningScoreTable[correctListening] || 5;
            readingScore = readingScoreTable[correctReading] || 5;
        } else {
            // Tỉ lệ câu đúng quy về thang 100
            const tiLeCauDungListening = maxListeningQuestion > 0 ? Math.round((correctListening / maxListeningQuestion) * 100) : 0;
            const tiLeCauDungReading = maxReadingQuestion > 0 ? Math.round((correctReading / maxReadingQuestion) * 100) : 0;
    
            // Tính dựa trên thang điểm
            listeningScore = listeningScoreTable[tiLeCauDungListening] || 5;
            readingScore = readingScoreTable[tiLeCauDungReading] || 5;
        }
    
        // Tổng điểm Reading và Listening
        const totalListeningReading = listeningScore + readingScore;
        
        // Cập nhật điểm trong bai_lam_nguoi_dung
        await submit.update({
            tong_diem: totalListeningReading,
            diem_nghe: listeningScore,
            diem_doc: readingScore
        });
        
        res.status(200).json({ 
            message: "Nộp bài thi thành công",
            data: {
                id_bai_lam_nguoi_dung: submit.id_bai_lam_nguoi_dung,
                totalListeningReading,
                listeningScore,
                readingScore
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// module.exports.detail = async (req, res) => {
//     try {
//         const { id_bai_lam_nguoi_dung } = req.params;

//         // 1. Lấy bài làm người dùng + câu trả lời
//         const baiLam = await BaiLamNguoiDung.findByPk(id_bai_lam_nguoi_dung, {
//             include: [
//                 {
//                     model: NguoiDung,
//                     as: 'nguoi_dung_lam_bai',
//                     attributes: ['email', 'ten_dang_nhap'],
//                     include: [
//                         {
//                             model: HoSoNguoiDung,
//                             as: 'ho_so',
//                             attributes: ['ho_ten']
//                         }
//                     ]
//                 },
//                 {
//                     model: CauTraLoiNguoiDung,
//                     as: 'cau_tra_loi',
//                     attributes: ['id_cau_hoi', 'lua_chon_da_chon', 'la_dung', 'da_tra_loi']
//                 },
//                 {
//                     model: BaiThi,
//                     as: 'bai_thi_nguoi_dung',
//                     attributes: ['id_bai_thi', 'ten_bai_thi', 'mo_ta', 'so_luong_cau_hoi', 'muc_do_diem', 'thoi_gian_bai_thi', 'nam_xuat_ban']
//                 }
//             ]
//         });

//         if (!baiLam) {
//             return res.status(404).json({ message: 'Không tìm thấy bài làm người dùng' });
//         }

//         const id_bai_thi = baiLam.bai_thi_nguoi_dung.id_bai_thi;

//         // 2. Lấy riêng danh sách câu hỏi chi tiết
//         const baiThi = await BaiThi.findByPk(id_bai_thi, {
//             attributes: ['id_bai_thi'],
//             include: [
//                 {
//                     model: CauHoiBaiThi,
//                     as: 'cau_hoi_cua_bai_thi',
//                     attributes: ['id_cau_hoi_bai_thi', 'id_cau_hoi'],
//                     include: [
//                         {
//                             model: NganHangCauHoi,
//                             as: 'cau_hoi',
//                             attributes: ['id_cau_hoi', 'noi_dung', 'dap_an_dung', 'giai_thich', 'id_phan', 'id_doan_van', 'id_phuong_tien_hinh_anh', 'id_phuong_tien_am_thanh'],
//                             include: [
//                                 { model: LuaChon, as: 'lua_chon', attributes: ['ky_tu_lua_chon', 'noi_dung'] },
//                                 { model: PhanCauHoi, as: 'phan', attributes: ['loai_phan', 'ten_phan'] },
//                                 {
//                                     model: DoanVan,
//                                     as: 'doan_van',
//                                     attributes: ['tieu_de', 'noi_dung', 'loai_doan_van'],
//                                     include: [
//                                         {
//                                             model: PhuongTien,
//                                             as: 'danh_sach_phuong_tien',
//                                             attributes: ['url_phuong_tien', 'loai_phuong_tien']
//                                         }
//                                     ]
//                                 },
//                                 { model: PhuongTien, as: 'hinh_anh', attributes: ['url_phuong_tien', 'loai_phuong_tien'] },
//                                 { model: PhuongTien, as: 'am_thanh', attributes: ['url_phuong_tien', 'loai_phuong_tien'] }
//                             ]
//                         }
//                     ]
//                 }
//             ],
//             order: [
//                 [{ model: CauHoiBaiThi, as: 'cau_hoi_cua_bai_thi' }, 'id_cau_hoi_bai_thi', 'ASC']
//             ]
//         });

//         return res.status(200).json({
//             message: 'Chi tiết bài làm người dùng',
//             data: {
//                 baiLam,
//                 baiThi
//             }
//         });

//     } catch (error) {
//         console.error('Lỗi API detail:', error);
//         return res.status(500).json({ message: 'Lỗi server: ' + error.message });
//     }
// };

// [POST] /api/results/submit-from-fe-react
module.exports.submitExamFromFE = async (req, res) => {
    try {
        const {
            id_nguoi_dung,
            id_bai_thi,
            diem_nghe,
            diem_doc,
            tong_diem,
            chi_tiet_cau_tra_loi
        } = req.body;

        // 1. Tạo bài làm người dùng
        const submit = await BaiLamNguoiDung.create({
            id_nguoi_dung,
            id_bai_thi,
            thoi_gian_bat_dau: new Date(),
            thoi_gian_ket_thuc: new Date(),
            diem_nghe,
            diem_doc,
            tong_diem,
            da_hoan_thanh: true
        });

        // 2. Ghi câu trả lời
        const dataInsert = chi_tiet_cau_tra_loi.map(item => ({
            id_bai_lam_nguoi_dung: submit.id_bai_lam_nguoi_dung,
            id_cau_hoi: item.id_cau_hoi,
            lua_chon_da_chon: item.lua_chon_da_chon || null,
            la_dung: item.la_dung,
            da_tra_loi: item.da_tra_loi,
            thoi_gian_tra_loi: new Date()
        }));

        await CauTraLoiNguoiDung.bulkCreate(dataInsert);

        return res.status(200).json({
            message: "Lưu bài làm từ frontend thành công!",
            data: {
                id_bai_lam_nguoi_dung: submit.id_bai_lam_nguoi_dung,
                diem_nghe,
                diem_doc,
                tong_diem
            }
        });
    } catch (err) {
        console.error('Lỗi submit-from-fe:', err);
        return res.status(500).json({ message: "Lỗi khi lưu bài làm: " + err.message });
    }
};

// [GET] /api/results/index
module.exports.index = async (req, res) => {
    try {
        const { page, limit, id_nguoi_dung, id_bai_thi } = req.query;

        const where = {};
        // Điều kiện lọc
        if (id_nguoi_dung) where.id_nguoi_dung = id_nguoi_dung;  
        if (id_bai_thi) where.id_bai_thi = id_bai_thi;

        // Đếm tổng số bài làm người dùng
        const count = await BaiLamNguoiDung.count({
            where,
            distinct: true
        });

        // Phân trang
        let initPagination = {
            currentPage: 1,
            limitItem: 20
        };

        const pagination = createPaginationQuery(
            initPagination,
            { page, limit },
            count
        );

        // Lấy tất cả bài làm người dùng
        const records = await BaiLamNguoiDung.findAll({
            where,
            include: [
                { 
                    model: NguoiDung, as: 'nguoi_dung_lam_bai', attributes: ['email', 'ten_dang_nhap'],
                    include: [
                        { model: HoSoNguoiDung, as: 'ho_so', attributes: ['ho_ten'] }
                    ],
                }
            ],
            attributes: ['id_bai_lam_nguoi_dung', 'id_nguoi_dung', 'id_bai_thi', 'thoi_gian_bat_dau', 'thoi_gian_ket_thuc', 'diem_nghe', 'diem_doc', 'tong_diem', 'da_hoan_thanh'],
            order: [['thoi_gian_ket_thuc', 'DESC']],
            offset: pagination.skip,
            limit: pagination.limitItem
        });

        res.status(200).json({ 
            message: 'Danh sách bài làm người dùng',
            data: records,
            pagination: {
                page: pagination.currentPage,
                limit: pagination.limitItem,
                total: count,
                totalPages: pagination.totalPages
            },
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// [GET] /api/results/get-all-exam-submit
module.exports.getAllExamSubmit = async (req, res) => {
    try {
        const { id_nguoi_dung } = req.params;
        const { page, limit } = req.query;
        const nguoiDung = await NguoiDung.findByPk(id_nguoi_dung);
        if (!nguoiDung) {
            return res.status(400).json({ message: 'Người dùng không tồn tại!' });
        }

        // Đếm tổng số bài làm người dùng
        const count = await BaiLamNguoiDung.count({
            where: { id_nguoi_dung },
            distinct: true
        });

        // Phân trang
        let initPagination = {
            currentPage: 1,
            limitItem: 20
        };

        const pagination = createPaginationQuery(
            initPagination,
            { page, limit },
            count
        );

        // Lấy tất cả bài làm người dùng
        const records = await BaiLamNguoiDung.findAll({
            where: { id_nguoi_dung },
            include: [
                { 
                    model: NguoiDung, as: 'nguoi_dung_lam_bai', attributes: ['email', 'ten_dang_nhap'],
                    include: [
                        { model: HoSoNguoiDung, as: 'ho_so', attributes: ['ho_ten'] }
                    ],
                }
            ],
            attributes: ['id_bai_lam_nguoi_dung', 'id_nguoi_dung', 'id_bai_thi', 'thoi_gian_bat_dau', 'thoi_gian_ket_thuc', 'diem_nghe', 'diem_doc', 'tong_diem', 'da_hoan_thanh'],
            order: [['thoi_gian_ket_thuc', 'DESC']],
            offset: pagination.skip,
            limit: pagination.limitItem
        });

        res.status(200).json({ 
            message: 'Danh sách bài làm của người dùng',
            data: records,
            pagination: {
                page: pagination.currentPage,
                limit: pagination.limitItem,
                total: count,
                totalPages: pagination.totalPages
            },
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// [GET] /api/results/detail/:id_bai_lam_nguoi_dung/:part
module.exports.detailPart = async (req, res) => {
    try {
        const { id_bai_lam_nguoi_dung, part } = req.params;
        const phan = parseInt(part);

        const baiLam = await BaiLamNguoiDung.findByPk(id_bai_lam_nguoi_dung, {
            include: [
                { 
                    model: NguoiDung, as: 'nguoi_dung_lam_bai', attributes: ['email', 'ten_dang_nhap'],
                    include: [
                        { model: HoSoNguoiDung, as: 'ho_so', attributes: ['ho_ten'] }
                    ],
                },
                {
                    model: CauTraLoiNguoiDung,
                    as: 'cau_tra_loi',
                    attributes: ['id_cau_tra_loi', 'id_bai_lam_nguoi_dung', 'id_cau_hoi', 'lua_chon_da_chon', 'la_dung', 'da_tra_loi']
                },
                { 
                    model: BaiThi, as: 'bai_thi_nguoi_dung', attributes: ['id_bai_thi','ten_bai_thi'],
                    include: [
                        {
                            model: CauHoiBaiThi, as: 'cau_hoi_cua_bai_thi', attributes: ['id_cau_hoi_bai_thi', 'id_bai_thi', 'id_cau_hoi'],
                            include: [
                                {
                                    model: NganHangCauHoi, 
                                    as: 'cau_hoi', 
                                    attributes: ['id_cau_hoi', 'id_phan', 'id_doan_van', 'noi_dung', 'dap_an_dung', 'giai_thich', 'muc_do_kho', 'id_phuong_tien_hinh_anh', 'id_phuong_tien_am_thanh'],
                                    include: [
                                        {
                                            model: PhanCauHoi, as: 'phan', attributes: ['id_phan', 'ten_phan', 'loai_phan', 'mo_ta'],
                                            where: { id_phan: phan }
                                        }, 
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
                            order: [['id_cau_hoi_bai_thi', 'ASC']]
                        }
                    ]
                }            
            ],
        });
        if (!baiLam) {
            return res.status(400).json({ message: 'Bài làm người dùng không tồn tại!' });
        }

        res.status(200).json({ 
            message: `Chi tiết bài làm Part ${part}`,
            data: baiLam
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// [GET] /api/results/detail-first/:id_bai_lam_nguoi_dung
module.exports.detailFirstPart = async (req, res) => {
  try {
    req.params.part = 1; // mặc định Part 1
    return module.exports.detailPart(req, res); // tái sử dụng API detailPart
  } catch (error) {
    console.error('Lỗi khi lấy Part 1:', error);
    return res.status(500).json({ message: error.message });
  }
};


// [GET] /api/results/detail-part-user/:id_bai_lam_nguoi_dung/:part
module.exports.detailPartUser = async (req, res) => {
    try {
        const { id_bai_lam_nguoi_dung, part } = req.params;
        const phan = parseInt(part);

        const baiLam = await BaiLamNguoiDung.findByPk(id_bai_lam_nguoi_dung, {
            include: [
                {
                    model: CauTraLoiNguoiDung,
                    as: 'cau_tra_loi',
                    attributes: ['id_cau_tra_loi', 'id_cau_hoi', 'lua_chon_da_chon', 'la_dung', 'da_tra_loi']
                },
                { 
                    model: BaiThi, as: 'bai_thi_nguoi_dung', attributes: ['id_bai_thi','ten_bai_thi'],
                    include: [
                        {
                            model: CauHoiBaiThi, as: 'cau_hoi_cua_bai_thi', attributes: ['id_cau_hoi_bai_thi'],
                            required: true,
                            include: [
                                {
                                    model: NganHangCauHoi, 
                                    as: 'cau_hoi', 
                                    attributes: ['id_cau_hoi', 'id_doan_van', 'noi_dung', 'dap_an_dung', 'giai_thich', 'id_phuong_tien_hinh_anh', 'id_phuong_tien_am_thanh'],
                                    required: true,
                                    include: [
                                        {
                                            model: PhanCauHoi, as: 'phan', attributes: ['id_phan'],
                                            where: { id_phan: phan },
                                            required: true
                                        }, 
                                        { 
                                            model: DoanVan, 
                                            as: 'doan_van', 
                                            attributes: ['id_doan_van', 'tieu_de', 'noi_dung', 'loai_doan_van'],
                                            include: [
                                                {
                                                    model: PhuongTien,
                                                    as: 'danh_sach_phuong_tien',
                                                    attributes: ['id_phuong_tien', 'url_phuong_tien']
                                                }
                                            ] 
                                        },
                                        { model: PhuongTien, as: 'hinh_anh', attributes: ['id_phuong_tien', 'url_phuong_tien'] },
                                        { model: PhuongTien, as: 'am_thanh', attributes: ['id_phuong_tien', 'url_phuong_tien'] },
                                        { model: LuaChon, as: 'lua_chon', attributes: ['ky_tu_lua_chon', 'noi_dung'] }
                                    ]
                                }
                            ],
                            order: [['id_cau_hoi_bai_thi', 'ASC']]
                        }
                    ]
                }            
            ],
            attributes: ['id_bai_lam_nguoi_dung', 'tong_diem', 'diem_doc', 'diem_nghe', 'thoi_gian_bat_dau', 'thoi_gian_ket_thuc']
        });
        if (!baiLam) {
            return res.status(400).json({ message: 'Bài làm người dùng không tồn tại!' });
        }

        res.status(200).json({ 
            message: `Chi tiết bài làm Part ${part}`,
            data: baiLam
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// [GET] /api/results/detail-first-user/:id_bai_lam_nguoi_dung
module.exports.detailFirstPartUser = async (req, res) => {
  try {
    req.params.part = 1; // mặc định Part 1
    return module.exports.detailPartUser(req, res); // tái sử dụng API detailPartUser
  } catch (error) {
    console.error('Lỗi khi lấy Part 1:', error);
    return res.status(500).json({ message: error.message });
  }
};

// [GET] /api/results/question-index/:id_bai_lam_nguoi_dung
module.exports.getQuestionIndex = async (req, res) => {
  try {
    const { id_bai_lam_nguoi_dung } = req.params;

    const baiLam = await BaiLamNguoiDung.findByPk(id_bai_lam_nguoi_dung, {
        include: [
            {
                model: BaiThi,
                as: 'bai_thi_nguoi_dung',
                include: [
                    {
                        model: CauHoiBaiThi,
                        as: 'cau_hoi_cua_bai_thi',
                        include: [
                            {
                                model: NganHangCauHoi,
                                as: 'cau_hoi',
                                attributes: ['id_cau_hoi']
                            },
                        ],
                    },
                ],
            },
        ],
    });

    if (!baiLam) {
        return res.status(400).json({ message: "Không tìm thấy bài làm!" });
    }

    const result = baiLam.bai_thi_nguoi_dung.cau_hoi_cua_bai_thi.map((cauHoiBaiThi, index) => ({
        id_cau_hoi: cauHoiBaiThi.cau_hoi.id_cau_hoi,
        thu_tu: index + 1
    }));    

    res.status(200).json({
        message: "Thứ tự câu hỏi",
        data: result
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// [GET] /api/results/avaliable-parts/:id_bai_lam_nguoi_dung
module.exports.getAvaliableParts = async (req, res) => {
  try {
    const { id_bai_lam_nguoi_dung } = req.params;

    const baiLam = await BaiLamNguoiDung.findByPk(id_bai_lam_nguoi_dung, {
        include: [
            {
                model: BaiThi,
                as: 'bai_thi_nguoi_dung',
                include: [
                    {
                        model: CauHoiBaiThi,
                        as: 'cau_hoi_cua_bai_thi',
                        include: [
                            {
                                model: NganHangCauHoi,
                                as: 'cau_hoi',
                                attributes: ['id_phan'],
                                include: [
                                    {
                                        model: PhanCauHoi,
                                        as: 'phan',
                                        attributes: ['id_phan', 'ten_phan'],
                                        order: [['id_phan', 'ASC']]
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    });

    if (!baiLam) {
        return res.status(400).json({ message: "Không tìm thấy bài làm!" });
    }

    const partSet = new Set();
    const arrayParts = [];
    
    const dsCauHoi = baiLam?.bai_thi_nguoi_dung?.cau_hoi_cua_bai_thi;
    
    dsCauHoi.forEach(cauHoi => {
        const phan = cauHoi?.cau_hoi?.phan;
        if (phan && !partSet.has(phan.id_phan)) {
            partSet.add(phan.id_phan);
            arrayParts.push({
                id_phan: phan.id_phan,
                ten_phan: phan.ten_phan
            });
        }
    });
    
    // Sắp xếp tăng dần theo id_phan
    arrayParts.sort((a, b) => a.id_phan - b.id_phan);

    res.status(200).json({
        message: "Danh sách các phần của bài làm",
        parts: arrayParts
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};




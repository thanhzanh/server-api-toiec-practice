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

// [POST] /api/results/submit-exam
module.exports.submitExam = async (req, res) => {
    try {      
        const { id_nguoi_dung, id_bai_thi, answers } = req.body;    
        console.log("Data request: ", req.body);
        
    
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
            readingScore = listeningScoreTable[correctReading] || 5;
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
            data: records
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// [GET] /api/results/detail/:id_bai_lam_nguoi_dung
module.exports.detail = async (req, res) => {
    try {
        const { id_bai_lam_nguoi_dung } = req.params;

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
                    model: BaiThi, as: 'bai_thi_nguoi_dung', attributes: ['id_bai_thi','ten_bai_thi', 'mo_ta', 'so_luong_cau_hoi', 'muc_do_diem', 'thoi_gian_bai_thi', 'nam_xuat_ban'],
                    include: [
                        {
                            model: CauHoiBaiThi, as: 'cau_hoi_cua_bai_thi', attributes: ['id_cau_hoi_bai_thi', 'id_bai_thi', 'id_cau_hoi'],
                            include: [
                                {
                                    model: NganHangCauHoi, 
                                    as: 'cau_hoi', 
                                    attributes: ['id_cau_hoi', 'id_phan', 'id_doan_van', 'noi_dung', 'dap_an_dung', 'giai_thich', 'muc_do_kho', 'id_phuong_tien_hinh_anh', 'id_phuong_tien_am_thanh', 'nguon_goc'],
                                    include: [
                                        {
                                            model: PhanCauHoi, as: 'phan', attributes: ['id_phan', 'ten_phan', 'loai_phan', 'mo_ta']
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
            message: 'Danh sách bài làm người dùng',
            data: baiLam
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
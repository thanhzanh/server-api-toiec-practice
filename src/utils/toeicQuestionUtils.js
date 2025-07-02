const NganHangCauHoi = require('../models/nganHangCauHoi.model');

const kiemTraNhomCauHoiTheoPart3_4 = async (dsCauHoi) => {
    // Truy vấn toàn bộ câu hỏi theo id_cau_hoi
    const questions = await NganHangCauHoi.findAll({
        where: {
            id_cau_hoi: dsCauHoi,
            da_xoa: false,
            trang_thai: 'da_xuat_ban'
        },
        attributes: ['id_cau_hoi', 'id_phan', 'id_phuong_tien_am_thanh']
    });

    const audioMap = {};
    // Duyệt qua mảng câu hỏi
    questions.forEach((question) => {  
        // Kiểm tra Part 3&4 những câu hỏi khi thêm vào đề thi phải đi cùng nhau
        if ([3, 4].includes(question.id_phan)) {
            const id_am_thanh = question.id_phuong_tien_am_thanh;
            if (id_am_thanh) {
                if (!audioMap[id_am_thanh]) {
                    audioMap[id_am_thanh] = []; // Nếu chưa có thì khỏi động mảng
                }
                audioMap[id_am_thanh].push(question.id_cau_hoi);
            }
        }
    });

    for (const id_audio in audioMap) {
        const soLuong = audioMap[id_audio].length;
        if (soLuong !== 3) {
            return `ID âm thanh ${id_audio} phải đủ 3 câu hỏi, hiện tại có ${soLuong} câu!`;
        }
    }
    return null; // Không có lỗi
};

const kiemTraNhomCauHoiTheoPart6_7 = async (dsCauHoi) => {
    // Truy vấn toàn bộ câu hỏi theo id_cau_hoi
    const questions = await NganHangCauHoi.findAll({
        where: { 
            id_cau_hoi: dsCauHoi,
            da_xoa: false,
            trang_thai: 'da_xuat_ban'
        },
        attributes: ['id_cau_hoi', 'id_phan', 'id_doan_van']
    });

    const doanVanMap = {};

    // Duyệt qua toàn bộ câu hỏi

    for (const question of questions) {
        if ([6,7].includes(question.id_phan)) {
            const idDoanVan = question.id_doan_van;
            if (idDoanVan) {
                if (!doanVanMap[idDoanVan]) {
                    doanVanMap[idDoanVan] = [];
                }
                doanVanMap[idDoanVan].push(question.id_cau_hoi);
            }
        }
    }

    // Kiểm tra từng nhóm đoạn văn
    for (const idDoanVan in doanVanMap) {
        const soLuongDaChon = doanVanMap[idDoanVan].length; // Số lượng hiện tại
        const tongSoCauHoi = await NganHangCauHoi.count({
            where: {
                id_doan_van: idDoanVan,
                da_xoa: false,
                trang_thai: 'da_xuat_ban'
            }
        });

        if (soLuongDaChon !== tongSoCauHoi) {
            return `ID đoạn văn ${idDoanVan} cần chọn đủ ${tongSoCauHoi} câu hỏi, hiện tại có ${soLuongDaChon}`;
        }
    }
    return null; // Không có lỗi
};

module.exports = { kiemTraNhomCauHoiTheoPart3_4, kiemTraNhomCauHoiTheoPart6_7 };
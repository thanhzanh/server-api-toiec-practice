const NganHangCauHoi = require("../../models/nganHangCauHoi.model");
const PhanCauHoi = require("../../models/phanCauHoi.model");
const DoanVan = require("../../models/doanVan.model");
const PhuongTien = require("../../models/phuongTien.model");
const LuaChon = require("../../models/luaChon.model");
const CauHoiBaiThi = require("../../models/cauHoiBaiThi.model");
const DoanVanPhuongTien = require("../../models/doanVanPhuongTien.model");
const { createPaginationQuery } = require('../../utils/pagination');
const { upload } = require('../middlewares/uploadCloud.middleware');
const { streamUpload } = require('../middlewares/uploadCloud.middleware')
const striptags = require('striptags');
const { where } = require("sequelize");
const xlsx = require('xlsx');
const axios = require("axios");

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
            limitItem: 20
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
            order: [['thoi_gian_tao', 'DESC']],
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

// [POST] /api/questions/create
module.exports.create = async (req, res) => {
    try {
        let data;
        data = JSON.parse(req.body.data);
        const { id_phan, id_doan_van, noi_dung, dap_an_dung, giai_thich, muc_do_kho, trang_thai, lua_chon } = data;        

        // Validate cho Part
        const phandoanvan = {
            1: { co_hinh_anh: true, co_am_thanh: true, co_doan_van: false, so_lua_chon: 4 },
            2: { co_hinh_anh: false, co_am_thanh: true, co_doan_van: false, so_lua_chon: 3 },
            3: { co_hinh_anh: true, co_am_thanh: true, co_doan_van: false, so_lua_chon: 4, so_cau_hoi: 3 },
            4: { co_hinh_anh: true, co_am_thanh: true, co_doan_van: false, so_lua_chon: 4, so_cau_hoi: 3 },
            5: { co_hinh_anh: false, co_am_thanh: false, co_doan_van: false, so_lua_chon: 4 },
            6: { co_hinh_anh: false, co_am_thanh: false, co_doan_van: true, so_lua_chon: 4 },
            7: { co_hinh_anh: true, co_am_thanh: false, co_doan_van: true, so_lua_chon: 4 },
        };

        const checkPhan = phandoanvan[id_phan];

        // Kiểm tra phần
        if (id_phan) {
            const phan = await PhanCauHoi.findByPk(id_phan);
            if (!phan) {
                return res.status(400).json({ message: "Phần câu hỏi không tồn tạ." });
            }
        }

        // Bắt buộc phải có hình ảnh cho Part 1, 2, 5
        if (checkPhan.co_hinh_anh && !req.body.url_hinh_anh) {
            if ([1, 2, 5].includes(id_phan)) {
                return res.status(400).json({ message: `Part ${id_phan} bắt buộc phải có hình ảnh.` });
            }
        }

        // Bắt buộc phải có âm thanh    
        if (checkPhan.co_am_thanh && !req.body.url_am_thanh) {
            return res.status(400).json({ message: `Part ${id_phan} bắt buộc phải có âm thanh.` });
        }

        // Bắt buộc có đoạn văn
        if (!id_doan_van && checkPhan.co_doan_van) {
            return res.status(400).json({ message: `Part ${id_phan} bắt buộc phải có đoạn văn.` });
        }
        if (id_doan_van) {
            const doanvan = await DoanVan.findByPk(id_doan_van);
            if (!doanvan) {
                return res.status(400).json({ message: "Đoạn văn không tồn tại." });
            }
        }

        // Validate cho Lua chon
        switch(id_phan) {
            case 1:
            case 5:
                // Kiểm tra phải nhập lựa chọn
                for (const lc of lua_chon) {
                    if (!lc.noi_dung || !lc.noi_dung.trim()) {
                        return res.status(400).json({ message: "Bắt buộc phải nhập nội dung lựa chọn." });
                    }
                }

                // Kiểm tra đáp án đúng
                if (!['A', 'B', 'C', 'D'].includes(dap_an_dung)) {
                    return res.status(400).json({ message: "Phải chọn duy nhất một đáp án đúng A, B, C hoặc D." });
                }
                break;
            case 2:
                // Kiểm tra phải nhập lựa chọn
                for (const lc of lua_chon) {
                    if (!lc.noi_dung || !lc.noi_dung.trim()) {
                        return res.status(400).json({ message: "Bắt buộc phải nhập nội dung lựa chọn." });
                    }
                }

                // Kiểm tra đáp án đúng
                if (!['A', 'B', 'C', 'D'].includes(dap_an_dung)) {
                    return res.status(400).json({ message: "Phải chọn duy nhất một đáp án đúng A, B, C hoặc D." });
                }
                break;
            case 3:
            case 4:
                if (!Array.isArray(noi_dung) && noi_dung && noi_dung.length !== checkPhan.so_cau_hoi) {
                    return res.status(400).json({ message: `Part ${id_phan} bắt buộc phải có ${checkPhan.so_cau_hoi} câu hỏi.` });
                }
                for (let i = 0; i < checkPhan.so_cau_hoi; i++) {
                    const luachon = lua_chon[i];
                    if (!Array.isArray(luachon) && luachon.length !== checkPhan.so_lua_chon) {
                        return res.status(400).json({ message: `Part ${id_phan} bắt buộc phải có ${checkPhan.so_lua_chon} lựa chọn.` });
                    }   

                    for (const lc of luachon) {
                        if (!lc.ky_tu_lua_chon || !lc.noi_dung || !lc.noi_dung.trim()) {
                            return res.status(400).json({ message: `Bắt buộc phải nhập nội dung lựa chọn cho câu hỏi ${i + 1}.` });
                        }
                    }

                    // Kiểm tra đáp án đúng
                    const dapAn = dap_an_dung[i];
                    if (!['A', 'B', 'C', 'D'].includes(dapAn)) {
                        return res.status(400).json({ message: ` Câu hỏi ${i + 1} phải chọn duy nhất một đáp án đúng A, B, C hoặc D.` });
                    }
                }
                break;
            case 6:
            case 7:
                for (let i = 0; i < noi_dung.length; i++) {
                    const luachon = lua_chon[i];

                    for (const lc of luachon) {
                        if (!lc.ky_tu_lua_chon || !lc.noi_dung || !lc.noi_dung.trim()) {
                            return res.status(400).json({ message: `Bắt buộc phải nhập nội dung lựa chọn cho câu hỏi ${i + 1}.` });
                        }
                    }

                    // Kiểm tra đáp án đúng
                    const dapAn = dap_an_dung[i];
                    if (!['A', 'B', 'C', 'D'].includes(dapAn)) {
                        return res.status(400).json({ message: ` Câu hỏi ${i + 1} phải chọn duy nhất một đáp án đúng A, B, C hoặc D.` });
                    }
                }
                break;
            default:
                break;
        }    
        // End validate cho Part

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
        let questions = []; // Lưu câu hỏi theo từng Part
        if ([3, 4, 6, 7].includes(id_phan)) {
            for (let i = 0; i < noi_dung.length; i++) {
                const question = await NganHangCauHoi.create({
                    id_phan: id_phan,
                    id_doan_van: id_doan_van || null,
                    noi_dung: striptags(noi_dung[i]) || null,
                    dap_an_dung: dap_an_dung[i],
                    giai_thich: striptags(giai_thich[i]) || null,
                    muc_do_kho: muc_do_kho,
                    id_phuong_tien_hinh_anh,
                    id_phuong_tien_am_thanh,
                    trang_thai: trang_thai
                });
                questions.push(question);

                // Tạo lựa chọn
                const luaChonDapAn = lua_chon[i].map((item) => ({
                    id_cau_hoi: question.id_cau_hoi,
                    ky_tu_lua_chon: item.ky_tu_lua_chon,
                    noi_dung: item.noi_dung
                }));
                
                // Lưu vào database lua_chon
                await LuaChon.bulkCreate(luaChonDapAn);
            }
        } else {
            const question = await NganHangCauHoi.create({
                id_phan: id_phan,
                id_doan_van: id_doan_van || null,
                noi_dung: striptags(noi_dung) || null,
                dap_an_dung: dap_an_dung,
                giai_thich: striptags(giai_thich) || null,
                muc_do_kho: muc_do_kho,
                id_phuong_tien_hinh_anh,
                id_phuong_tien_am_thanh,
                trang_thai: trang_thai
            });
            questions.push(question);

            // Tạo lựa chọn
            const luaChonDapAn = lua_chon.map((item) => ({
                id_cau_hoi: question.id_cau_hoi,
                ky_tu_lua_chon: item.ky_tu_lua_chon,
                noi_dung: item.noi_dung
            }));

            // Lưu vào database lua_chon
            await LuaChon.bulkCreate(luaChonDapAn);
        }
        
        // Lấy dữ liệu câu hỏi trả về
        const dataQuestion = await Promise.all(
            questions.map((q) => {
                return NganHangCauHoi.findByPk(q.id_cau_hoi, {
                    include: [
                        { model: PhanCauHoi, as: 'phan', attributes: ['ten_phan', 'loai_phan'] },
                        { model: DoanVan, as: 'doan_van', attributes: ['noi_dung'] },
                        { model: PhuongTien, as: 'hinh_anh', attributes: ['url_phuong_tien'] },
                        { model: PhuongTien, as: 'am_thanh', attributes: ['url_phuong_tien'] },
                        { model: LuaChon, as: 'lua_chon', attributes: ['ky_tu_lua_chon', 'noi_dung'] },
                    ]
                })
            })
        );
                
        res.status(200).json({ 
            message: "Tạo câu hỏi thành công.",
            data: dataQuestion
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: error.message });
    }
};

// [POST] /api/questions/import-excel
module.exports.importExcel = async (req, res) => {
    try {
        // Kiểm tra file Excel
        if (!req.file) {
            return res.status(400).json({ message: "Vui lòng tải lên tệp Excel." });
        }
        if (!req.file.mimetype.includes('spreadsheet')) {
            return res.status(400).json({ message: "Tệp tải lên phải là file Excel." });
        }

        // Đọc file Excel
        const workbook = xlsx.read(req.file.buffer, { cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const workSheet = workbook.Sheets[sheetName];
        const results = xlsx.utils.sheet_to_json(workSheet);

        if (results.length === 0) {
            return res.status(400).json({ message: "File Excel không chứa dữ liệu." });
        }

        const questionToAdd = [];
        const phuongTienCache = new Map();
        const doanVanCache = new Map();        

        try {
            // Xử lý đoạn văn trước
            const doanVanToCreate = [];
            const uniqueDoanVanKeys = new Set();
            for (const row of results) {
                const { tieu_de_doan_van, noi_dung_doan_van, loai_doan_van, id_phan } = row;
                if (tieu_de_doan_van || noi_dung_doan_van) {
                    const key = `${tieu_de_doan_van || ''}|${noi_dung_doan_van || ''}|${loai_doan_van || ''}`;
                    if (!uniqueDoanVanKeys.has(key)) {
                        uniqueDoanVanKeys.add(key);
                        doanVanToCreate.push({
                            id_phan: parseInt(id_phan),
                            tieu_de: tieu_de_doan_van || null,
                            noi_dung: noi_dung_doan_van || null,
                            loai_doan_van: loai_doan_van || null,
                            thoi_gian_tao: new Date()
                        });
                    }
                }
            }

            // Tạo hoặc lấy đoạn văn
            for (const doanVan of doanVanToCreate) {
                const [record, created] = await DoanVan.findOrCreate({
                    where: {
                        tieu_de: doanVan.tieu_de,
                        noi_dung: doanVan.noi_dung,
                        loai_doan_van: doanVan.loai_doan_van
                    },
                    defaults: doanVan,
                });
                doanVanCache.set(
                    `${doanVan.tieu_de || ''}|${doanVan.noi_dung || ''}|${doanVan.loai_doan_van || ''}`,
                    record.id_doan_van
                );
            }

            // Xử lý phương tiện (hình ảnh và âm thanh)
            const allMediaUrls = new Set();
            results.forEach(row => {
                if (row.url_hinh_anh) {
                    row.url_hinh_anh.split(';').map(url => url.trim()).forEach(url => allMediaUrls.add(url));
                }
                if (row.url_am_thanh) {
                    allMediaUrls.add(row.url_am_thanh.trim());
                }
            });

            const mediaPromises = Array.from(allMediaUrls).map(async (url) => {
                if (phuongTienCache.has(url)) return;
                const fileId = url.match(/\/d\/(.*?)\//)?.[1];
                if (!fileId) {
                    return;
                }
                const isAudio = url === results.find(row => row.url_am_thanh === url)?.url_am_thanh;
                const downloadUrl = isAudio
                    ? `https://drive.usercontent.google.com/download?id=${fileId}&export=download`
                    : `https://drive.google.com/uc?export=download&id=${fileId}`;
                try {
                    const response = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
                    const buffer = Buffer.from(response.data);
                    const result = await streamUpload(buffer, isAudio ? 'video' : 'image');
                    const media = await PhuongTien.create({
                        url_phuong_tien: result.secure_url,
                        loai_phuong_tien: isAudio ? 'am_thanh' : 'hinh_anh',
                        thoi_gian_tao: new Date()
                    });
                    phuongTienCache.set(url, media.id_phuong_tien);
                } catch (error) {
                    console.log(`Lỗi tải phương tiện ${url}: ${error.message}`);
                }
            });
            await Promise.all(mediaPromises);

            // Xử lý câu hỏi và lựa chọn
            const luaChonToCreate = [];
            for (const row of results) {
                const { id_phan, noi_dung, dap_an_dung, giai_thich, muc_do_kho, trang_thai, tieu_de_doan_van, noi_dung_doan_van, loai_doan_van, lua_chon_A, lua_chon_B, lua_chon_C, lua_chon_D, url_hinh_anh, url_am_thanh } = row;

                const part = parseInt(id_phan);
                if (isNaN(part) || part < 1 || part > 7) {
                    console.log(`Bỏ qua dòng ${results.indexOf(row) + 2}: Part phải từ 1 đến 7.`);
                    continue;
                }

                // Cho phép part 1 không cần noi_dung, nhưng phải có ít nhất một lựa chọn hoặc phương tiện
                if (part !== 1 && !noi_dung && !tieu_de_doan_van && !noi_dung_doan_van) {
                    console.log(`Bỏ qua dòng ${results.indexOf(row) + 2}: Thiếu nội dung câu hỏi hoặc đoạn văn.`);
                    continue;
                }

                const newQuestion = {
                    id_phan: part,
                    noi_dung: part === 1 ? null : (striptags(noi_dung) || null),
                    dap_an_dung,
                    giai_thich: striptags(giai_thich) || null,
                    muc_do_kho,
                    trang_thai,
                    nguon_goc: 'nhap_excel',
                    thoi_gian_tao: new Date(),
                    da_xoa: false
                };

                // Gán id_doan_van cho part 6 và 7
                if (tieu_de_doan_van || noi_dung_doan_van) {
                    const key = `${tieu_de_doan_van || ''}|${noi_dung_doan_van || ''}|${loai_doan_van || ''}`;
                    const id_doan_van = doanVanCache.get(key);
                    if (id_doan_van && [6, 7].includes(part)) {
                        newQuestion.id_doan_van = id_doan_van;
                    }
                }

                // Gán phương tiện
                if (url_hinh_anh) {
                    const dsHinhAnh = url_hinh_anh.split(';').map(url => url.trim()); // Duyệt qua nhiều hình ảnh cho Part 7
                    const id_phuong_tien = phuongTienCache.get(dsHinhAnh[0]);
                    if (id_phuong_tien && part !== 7) {
                        newQuestion.id_phuong_tien_hinh_anh = id_phuong_tien;
                    }
                    if (newQuestion.id_doan_van) {
                        for (const url of dsHinhAnh) {
                            const id_phuong_tien = phuongTienCache.get(url);
                            if (id_phuong_tien) {
                                await DoanVanPhuongTien.findOrCreate({
                                    where: {
                                        id_doan_van: newQuestion.id_doan_van,
                                        id_phuong_tien
                                    },
                                    defaults: { id_doan_van: newQuestion.id_doan_van, id_phuong_tien },
                                });
                            }
                        }
                    }
                }

                if (url_am_thanh) {
                    const id_phuong_tien = phuongTienCache.get(url_am_thanh.trim());
                    if (id_phuong_tien) {
                        newQuestion.id_phuong_tien_am_thanh = id_phuong_tien;
                    }
                }

                // Lưu câu hỏi
                const savedQuestion = await NganHangCauHoi.create(newQuestion);
                questionToAdd.push(savedQuestion);

                // Lưu lựa chọn
                const luaChon = [
                    { ky_tu_lua_chon: 'A', noi_dung: lua_chon_A },
                    { ky_tu_lua_chon: 'B', noi_dung: lua_chon_B },
                    { ky_tu_lua_chon: 'C', noi_dung: lua_chon_C },
                    { ky_tu_lua_chon: 'D', noi_dung: lua_chon_D },
                ].filter(lc => lc.noi_dung);

                if (luaChon.length > 0) {
                    luaChonToCreate.push(...luaChon.map(lc => ({
                        ...lc,
                        id_cau_hoi: savedQuestion.id_cau_hoi
                    })));
                }
            }

            // Lưu toàn bộ lựa chọn
            if (luaChonToCreate.length > 0) {
                await LuaChon.bulkCreate(luaChonToCreate);
            }

            return res.status(200).json({
                message: `Import thành công ${questionToAdd.length} câu hỏi`,
                data: questionToAdd
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: `Lỗi khi nhập Excel: ${error.message}` });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: `Lỗi khi nhập Excel: ${error.message}` });
    }
};

// [GET] /api/questions/detail/:id_cau_hoi
module.exports.detail = async (req, res) => {
    try {
        const { id_cau_hoi } = req.params;
        const question = await NganHangCauHoi.findByPk(id_cau_hoi);
        if (!question) {
            return res.status(400).json({ message: "ID câu hỏi không hợp lệ." });
        }
        // Lấy thông tin câu hỏi
        const questionDetail = await NganHangCauHoi.findByPk(
            id_cau_hoi,
            {
                include: [
                    { model: PhanCauHoi, as: 'phan', attributes: ['id_phan', 'ten_phan', 'loai_phan', 'mo_ta'] },
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
                    'nguon_goc',
                    'thoi_gian_tao'
                ]
            }
        );        
                
        res.status(200).json({ 
            message: "Lấy chi tiết câu hỏi thành công.",
            data: questionDetail
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [DELETE] /api/questions/delete/:id_cau_hoi
module.exports.delete = async (req, res) => {
    try {
        
        const { id_cau_hoi } = req.params;
        
        const question = await NganHangCauHoi.findByPk(id_cau_hoi);
        if (!question) {
            return res.status(400).json({ message: "Câu hỏi không tồn tại." });
        }

        // Kiểm tra xem câu hỏi đã được sử dụng chưa
        const daSuDung = await CauHoiBaiThi.findOne({
            where: { id_cau_hoi: parseInt(id_cau_hoi) }
        });
        if (daSuDung) {
            return res.status(400).json({ message: "Câu hỏi đã được sử dụng trong bài thi. Không được xóa." });
        }

        // Xóa mềm trong database chuyển sang trạng thái lưu trữ
        await question.update({ 
            trang_thai: "luu_tru",
            da_xoa: true
        });

        res.status(200).json({
            message: "Đã xóa câu hỏi và chuyển sang kho lưu trữ."
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: error.message });
    }
};

// [PUT] /api/questions/edit/:id_cau_hoi
module.exports.edit = async (req, res) => {
    try {
        const { id_cau_hoi } = req.params;

        let data = JSON.parse(req.body.data);
        
        // Kiểm tra câu hỏi tồn tại không
        const existingQuestion = await NganHangCauHoi.findByPk(id_cau_hoi);
        
        if (!existingQuestion) {
            return res.status(400).json({ message: "Câu hỏi không tồn tại." });
        }

        // Lấy id_phan để kiểm tra dữ liệu khi cập nhật
        const id_phan = existingQuestion.id_phan;

        switch (id_phan) {
            case 1:
                // Kiểm tra hình ảnh và âm thanh gửi lên thì chặn lại
                const coHinhAnh = existingQuestion.id_phuong_tien_hinh_anh ?
                await PhuongTien.findByPk(existingQuestion.id_phuong_tien_hinh_anh) : null;
                const coAmThanh = existingQuestion.id_phuong_tien_am_thanh ?
                await PhuongTien.findByPk(existingQuestion.id_phuong_tien_am_thanh) : null;
                
                if (coHinhAnh && req.body.url_hinh_anh && coHinhAnh.url_phuong_tien !== req.body.url_hinh_anh) {
                    return res.status(400).json({ message: "Không được phép cập nhật hình ảnh Part 1." });
                }

                if (coAmThanh && req.body.url_am_thanh && coHinhAnh.url_phuong_tien !== req.body.url_am_thanh) {
                    return res.status(400).json({ message: "Không được phép cập nhật âm thanh Part 1." });
                }
                break;
            case 2:
                // Kiểm tra âm thanh gửi lên thì chặn lại
                const coAmThanhP2 = existingQuestion.id_phuong_tien_am_thanh ?
                await PhuongTien.findByPk(existingQuestion.id_phuong_tien_am_thanh) : null;
                if (coAmThanhP2 && req.body.url_am_thanh && coAmThanhP2.url_phuong_tien !== req.body.url_am_thanh) {
                    return res.status(400).json({ message: "Không được phép cập nhật âm thanh Part 2." });
                }
                break;
            case 3:
            case 4:
                // Kiểm tra hình ảnh và âm thanh gửi lên thì chặn lại
                const coHinhAnhP34 = existingQuestion.id_phuong_tien_hinh_anh ?
                await PhuongTien.findByPk(existingQuestion.id_phuong_tien_hinh_anh) : null;
                const coAmThanhP34 = existingQuestion.id_phuong_tien_am_thanh ?
                await PhuongTien.findByPk(existingQuestion.id_phuong_tien_am_thanh) : null;

                if (coHinhAnhP34 && req.body.url_hinh_anh && coHinhAnhP34.url_phuong_tien !== req.body.url_hinh_anh) {
                    return res.status(400).json({ message: `Không được phép cập nhật hình ảnh Part ${id_phan}.` });
                }

                if (coAmThanhP34 && req.body.url_am_thanh && coAmThanhP34.url_phuong_tien !== req.body.url_am_thanh) {
                    return res.status(400).json({ message: `Không được phép cập nhật hình ảnh Part ${id_phan}.` });
                }
                break;
            case 5:
                break;
            case 6:
            case 7:
                // Kiểm tra đoạn văn gửi lên thì chặn lại
                if (existingQuestion.id_doan_van && req.body.id_doan_van && existingQuestion.id_doan_van !== req.body.id_doan_van) {
                    return res.status(400).json({ message: `Không được phép cập nhật đoạn văn Part ${id_phan}.` });
                }
        }

        // Cập nhật các trường cho câu hỏi (Tùy trường nào nếu muốn)
        const dataUpdate = {};
        if (data.noi_dung !== existingQuestion.noi_dung && data.noi_dung !== undefined) dataUpdate.noi_dung = striptags(data.noi_dung) || existingQuestion.noi_dung;
        if (data.dap_an_dung !== existingQuestion.dap_an_dung && data.dap_an_dung !== undefined) dataUpdate.dap_an_dung = data.dap_an_dung || existingQuestion.dap_an_dung;
        if (data.giai_thich !== existingQuestion.giai_thich && data.giai_thich !== undefined) dataUpdate.giai_thich = striptags(data.giai_thich) || existingQuestion.giai_thich;
        if (data.muc_do_kho !== existingQuestion.muc_do_kho && data.muc_do_kho !== undefined) dataUpdate.muc_do_kho = data.muc_do_kho || existingQuestion.muc_do_kho;
        if (data.trang_thai !== existingQuestion.trang_thai && data.trang_thai !== undefined) dataUpdate.trang_thai = data.trang_thai || existingQuestion.trang_thai;

        // Khi có thay đổi thì cập nhật
        if (Object.keys(dataUpdate).length > 0) {
            dataUpdate.thoi_gian_cap_nhat = new Date();

            // Cập nhật table ngan_hang_cau_hoi
            await NganHangCauHoi.update(
                dataUpdate,
                {
                    where: { id_cau_hoi: id_cau_hoi }
                }
            );
        }

        // Cập nhật lựa chọn hủy lựa chọn cũ, thêm lựa chọn mới
        if (data.lua_chon && Array.isArray(data.lua_chon) && data.lua_chon.length > 0) {
            // Xóa lựa chọn cũ
            await LuaChon.destroy({ where: { id_cau_hoi: id_cau_hoi } });
            // Tạo lựa chọn mới
            const luaChonDapAn = data.lua_chon.map((lc) => ({
                id_cau_hoi: id_cau_hoi,
                ky_tu_lua_chon: lc.ky_tu_lua_chon?.toUpperCase(),
                noi_dung: striptags(lc.noi_dung?.trim())
            }));
            
            // Lưu vào table lua_chon
            await LuaChon.bulkCreate(luaChonDapAn);
        }   

        res.status(200).json({
            message: "Đã chỉnh sửa câu hỏi.",
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: error.message });
    }
};
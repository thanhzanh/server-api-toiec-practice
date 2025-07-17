const PhanCauHoi = require('../../models/phanCauHoi.model');
const DoanVan = require('../../models/doanVan.model');
const NganHangCauHoi = require('../../models/nganHangCauHoi.model');
const { createPaginationQuery } = require('../../utils/pagination');
const striptags = require('striptags');
const PhuongTien = require('../../models/phuongTien.model');
const { streamUpload } = require('../middlewares/uploadCloud.middleware');
const DoanVanPhuongTien = require('../../models/doanVanPhuongTien.model');

// [GET] /api/passages
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
        
        // Danh sách câu hỏi theo bộ lọc phần, trạng thái, mức độ
        const dsDoanVan = await DoanVan.findAll({
            where,
            attributes: [
                'id_doan_van',
                'tieu_de',
                'noi_dung',
                'id_phan',
                'loai_doan_van',
                'thoi_gian_tao',
                'thoi_gian_cap_nhat'
            ],
            order: [['thoi_gian_tao', 'DESC']],
            offset: pagination.skip,
            limit: pagination.limitItem
        });

        // Lấy danh sách phần câu hỏi
        const dsPhanCauHoi = await PhanCauHoi.findAll({
                where: { id_phan : [6, 7] },
                order: [['id_phan', 'ASC']],
                attributes: ['id_phan', 'ten_phan']
        });
        
        res.status(200).json({ 
            message: "Lấy danh sách đoạn văn thành công.",
            data: dsDoanVan,
            pagination: {
                page: pagination.currentPage,
                limit: pagination.limitItem,
                total: count,
                totalPages: pagination.totalPages
            },
            dsPhanCauHoi
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [POST] /api/passages/create
module.exports.create = async (req, res) => {
    try {        
        const { tieu_de, noi_dung, id_phan, loai_doan_van } = req.body;

        // Kiểm tra phần tồn tại không
        const phan = await PhanCauHoi.findByPk(id_phan);
        if (!phan) {
            return res.status(400).json({ message: "Phần câu hỏi không tồn tại." });
        }

        // Chỉ cho phép đoạn văn cho Part 6 và Part 7
        if (![6, 7].includes(parseInt(id_phan))) {
            return res.status(400).json({ message: "Phần câu hỏi không tồn tại." });
        }

        // Kiểm tra phải có tiêu đề và nội dung
        if (!tieu_de) {
            return res.status(400).json({ message: "Tiêu đề đoạn văn không được để trống." });
        }

        // Lưu doan_van vào database
        const doanVan = await DoanVan.create({ 
            tieu_de,
            noi_dung: noi_dung ? striptags(noi_dung) : null,
            id_phan: parseInt(id_phan),
            loai_doan_van,
        });

        // Xử lý lưu hình ảnh
        if (req.files?.hinh_anh?.length > 0) {
            for (const file of req.files.hinh_anh) {
                const result = await streamUpload(file.buffer, 'image');

                // Lưu vào bảng phuong_tien
                const media = await PhuongTien.create({
                    url_phuong_tien: result.secure_url,
                    loai_phuong_tien: 'hinh_anh',
                    thoi_gian_tao: new Date()
                });

                // Lưu vào bảng doan_van_phuong_tien
                await DoanVanPhuongTien.create({
                    id_doan_van: doanVan.id_doan_van,
                    id_phuong_tien: media.id_phuong_tien
                });
            }
        }

        // Lấy dữ liệu trả về
        const dataCreated = await DoanVan.findByPk(doanVan.id_doan_van, {
            include: [
                {
                    model: PhuongTien,
                    as: 'danh_sach_phuong_tien',
                    attributes: ['id_phuong_tien', 'url_phuong_tien'],
                    through: { attributes: [] }, // Loại bỏ dữ liệu trung gian
                    where: { loai_phuong_tien: 'hinh_anh' },
                    required: false // loại bỏ lỗi nếu chưa có hình
                }
            ]
        });
        
        res.status(200).json({ 
            message: "Tạo đoạn văn thành công.",
            data: dataCreated
        });
    } catch (error) {
        console.error("Lỗi tạo đoạn văn:", error);
        res.status(500).json({ message: error.message });
    }
};

// [PUT] /api/passages/edit/:id_doan_van
module.exports.edit = async (req, res) => {
    try {        
        const { id_doan_van } = req.params;
        const { tieu_de, noi_dung, loai_doan_van } = req.body;

        // Kiểm tra phần tồn tại không
        const doanvan = await DoanVan.findByPk(id_doan_van);
        if (!doanvan) {
            return res.status(400).json({ message: "Đoạn văn không hợp lệ." });
        }

        const updateData = {};
        if (tieu_de !== doanvan.tieu_de && tieu_de !== undefined) updateData.tieu_de = tieu_de || doanvan.tieu_de;
        if (noi_dung !== doanvan.noi_dung && noi_dung !== undefined) updateData.noi_dung = striptags(noi_dung) || doanvan.noi_dung;
        if (loai_doan_van !== doanvan.loai_doan_van && loai_doan_van !== undefined) updateData.loai_doan_van = loai_doan_van || doanvan.loai_doan_van;

        // Cập nhật thời gian
        updateData.thoi_gian_cap_nhat = new Date();

        const data = await doanvan.update(updateData);        

        res.status(200).json({ 
            message: "Đã chỉnh sửa đoạn văn thành công.",
            data: data
        });
    } catch (error) {
        console.error("Lỗi chỉnh sửa đoạn văn:", error);
        res.status(500).json({ message: error.message });
    }
};

// [DELETE] /api/passages/delete/:id_doan_van
module.exports.delete = async (req, res) => {
    try {        
        const { id_doan_van } = req.params;
        
        // Kiểm tra đoạn văn
        const doanVan = await DoanVan.findByPk(id_doan_van);
        if (!doanVan) {
            return res.status(400).json({ message: "Đoạn văn không tồn tại." });
        }

        // Kiểm tra đoạn văn đã được sử dụng trong ngân hàng câu hỏi chưa
        // const doanVanTrongCauHoi = await NganHangCauHoi.findOne({ where: { id_doan_van, da_xoa: false } });
        
        // if (doanVanTrongCauHoi) {
        //     return res.status(400).json({ message: "Đoạn văn đã được sử dụng trong câu hỏi. Không xóa được!" });
        // } 

        await doanVan.update({ da_xoa: true });

        res.status(200).json({ 
            message: "Đã xóa đoạn văn thành công."
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [GET] /api/passages/detail/:id_doan_van
module.exports.detail = async (req, res) => {
    try {        
        const { id_doan_van } = req.params;
        
        // Kiểm tra đoạn văn
        const doanVan = await DoanVan.findByPk(id_doan_van);
        if (!doanVan) {
            return res.status(400).json({ message: "Đoạn văn không tồn tại." });
        }

        const data = await DoanVan.findByPk(
            id_doan_van,
            {
                attributes: ['id_doan_van', 'tieu_de', 'noi_dung', 'id_phan', 'thoi_gian_tao', 'thoi_gian_cap_nhat'],
                include: [
                    {
                        model: PhuongTien,
                        as: 'danh_sach_phuong_tien',
                        attributes: ['id_phuong_tien', 'url_phuong_tien', 'loai_phuong_tien'],
                        where: { loai_phuong_tien: 'hinh_anh' },
                        through: { attributes: [] },
                        required: false
                    }
                ]
            }
        );

        res.status(200).json({ 
            message: "Lấy chi tiết đoạn văn thành công.",
            data: data
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
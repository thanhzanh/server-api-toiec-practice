const PhanCauHoi = require('../../models/phanCauHoi.model');
const DoanVan = require('../../models/doanVan.model');
const NganHangCauHoi = require('../../models/nganHangCauHoi.model');
const { createPaginationQuery } = require('../../helpers/pagination');

// [GET] /api/passages
module.exports.index = async (req, res) => {
    try {        
        
        res.status(200).json({ 
            message: "Lấy danh sách đoạn văn thành công",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [POST] /api/passages/create
module.exports.create = async (req, res) => {
    try {        
        const { tieu_de, noi_dung, id_phan } = req.body;

        // Kiểm tra phần tồn tại không
        const phan = await PhanCauHoi.findByPk(id_phan);
        if (!phan) {
            return res.status(400).json({ message: "Phần câu hỏi không tồn tại!" });
        }

        // Chỉ cho phép đoạn văn cho Part 6 và Part 7
        if (![6, 7].includes(parseInt(id_phan))) {
            return res.status(400).json({ message: "Phần câu hỏi không tồn tại!" });
        }

        // Lưu doan_van vào database
        const doanvan = await DoanVan.create({ tieu_de, noi_dung, id_phan });

        res.status(200).json({ 
            message: "Tạo đoạn văn thành công",
            data: doanvan
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
        const { tieu_de, noi_dung } = req.body;

        // Kiểm tra phần tồn tại không
        const doanvan = await DoanVan.findByPk(id_doan_van);
        if (!doanvan) {
            return res.status(400).json({ message: "Đoạn văn không hợp lệ!" });
        }

        const updateData = {};
        if (tieu_de !== doanvan.tieu_de) updateData.tieu_de = tieu_de || doanvan.tieu_de;
        if (noi_dung !== doanvan.noi_dung) updateData.noi_dung = noi_dung || doanvan.noi_dung;

        const data = await doanvan.update(updateData);        

        res.status(200).json({ 
            message: "Đã chỉnh sửa đoạn văn thành công",
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
            return res.status(400).json({ message: "Đoạn văn không tồn tại!" });
        }

        // Kiểm tra đoạn văn đã được sử dụng trong ngân hàng câu hỏi chưa
        const doanVanTrongCauHoi = await NganHangCauHoi.findOne({ where: { id_doan_van } });
        
        if (doanVanTrongCauHoi) {
            return res.status(400).json({ message: "Đoạn văn đã được sử dụng trong câu hỏi. Không xóa được!" });
        } 

        await doanVan.update({ da_xoa: true });

        res.status(200).json({ 
            message: "Đã xóa đoạn văn thành công!"
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
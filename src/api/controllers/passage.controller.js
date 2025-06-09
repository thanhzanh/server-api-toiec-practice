const PhanCauHoi = require('../../models/phanCauHoi.model');
const DoanVan = require('../../models/doanVan.model');
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
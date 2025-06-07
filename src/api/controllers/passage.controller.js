const PhanCauHoi = require('../../models/phanCauHoi.model');
const DoanVan = require('../../models/phanCauHoi.model');
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
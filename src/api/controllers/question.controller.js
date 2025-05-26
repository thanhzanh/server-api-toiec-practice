const NganHangCauHoi = require('../../models/nganHangCauHoi.model');
const PhanCauHoi = require('../../models/phanCauHoi.model');
const DoanVan = require('../../models/doanVan.model');
const PhuongTien = require('../../models/phuongTien.model');
const LuaChon = require('../../models/luaChon.model');

module.exports.getAllQuestions = async (req, res) => {
    // const { page, limit, search, id_phan, muc_do_kho, trang_thai } = req.query;
    const listQuestion = await NganHangCauHoi.findAll({
        where: { da_xoa: false },
        include: [
            { model: PhanCauHoi, attributes: ['id_phan', 'ten_phan', 'loai_phan', 'mo_ta'] }
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
    });
    
    res.status(200).json({ 
        message: "Lấy danh sách câu hỏi thành công",
        data: listQuestion
    });
};
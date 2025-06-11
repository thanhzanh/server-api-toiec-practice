const NguoiDung = require('../models/nguoiDung.model');
const HoSoNguoiDung = require('../models/hoSoNguoiDung.model');
const MaXacMinhEmail = require('../models/maXacMinhEmail.model');
const NganHangCauHoi = require('../models/nganHangCauHoi.model');
const LuaChon = require('../models/luaChon.model');
const DoanVan = require('../models/doanVan.model');
const PhuongTien = require('../models/phuongTien.model');
const PhanCauHoi = require('../models/phanCauHoi.model');
const CauHoiBaiThi = require('../models/cauHoiBaiThi.model');
const BaiThi = require('../models/baiThi.model');

const setupAssociations = () => {
    console.log('Đang thiết lập mối quan hệ...');
    
    // HoSoNguoiDung relationships
    HoSoNguoiDung.belongsTo(NguoiDung, { foreignKey: 'id_nguoi_dung', as: 'nguoi_dung' });
    NguoiDung.hasOne(HoSoNguoiDung, { foreignKey: 'id_nguoi_dung', as: 'ho_so' });

    // MaXacMinhEmail relationships
    MaXacMinhEmail.belongsTo(NguoiDung, { foreignKey: 'id_nguoi_dung', as: 'nguoi_dung' });

    // NganHangCauHoi relationships
    NganHangCauHoi.belongsTo(PhanCauHoi, { foreignKey: 'id_phan', as: 'phan' });
    NganHangCauHoi.belongsTo(DoanVan, { foreignKey: 'id_doan_van', as: 'doan_van' });
    NganHangCauHoi.belongsTo(PhuongTien, { foreignKey: 'id_phuong_tien_hinh_anh', as: 'hinh_anh', targetKey: 'id_phuong_tien' });
    NganHangCauHoi.belongsTo(PhuongTien, { foreignKey: 'id_phuong_tien_am_thanh', as: 'am_thanh', targetKey: 'id_phuong_tien' });
    NganHangCauHoi.hasMany(LuaChon, { foreignKey: 'id_cau_hoi', as: 'lua_chon' });

    // LuaChon relationships
    LuaChon.belongsTo(NganHangCauHoi, { foreignKey: 'id_cau_hoi', as: 'cau_hoi' });

    // DoanVan relationships
    DoanVan.belongsTo(PhanCauHoi, { foreignKey: 'id_phan', as: 'phan' });

    // CauHoiBaiThi relationships
    CauHoiBaiThi.belongsTo(NganHangCauHoi, { foreignKey: 'id_cau_hoi', as: 'cau_hoi' });
    CauHoiBaiThi.belongsTo(BaiThi, { foreignKey: 'id_bai_thi', as: 'bai_thi' });

    console.log('Tất cả các mối quan hệ đã được thiết lập thành công!');
};

module.exports = setupAssociations;

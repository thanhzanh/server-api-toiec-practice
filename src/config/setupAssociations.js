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
const DoanVanPhuongTien = require('../models/doanVanPhuongTien.model');
const BaiLamNguoiDung = require('../models/baiLamNguoiDung.model');
const CauTraLoiNguoiDung = require('../models/cauTraLoiNguoiDung.model');

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

    // BaiThi relationships
    BaiThi.belongsTo(NguoiDung, { foreignKey: 'nguoi_tao', targetKey: 'id_nguoi_dung', as: 'nguoi_tao_bai_thi' });
    BaiThi.hasMany(CauHoiBaiThi, { foreignKey: 'id_bai_thi', as: 'cau_hoi_cua_bai_thi' });

    // CauHoiBaiThi relationships
    CauHoiBaiThi.belongsTo(NganHangCauHoi, { foreignKey: 'id_cau_hoi', as: 'cau_hoi' });
    CauHoiBaiThi.belongsTo(BaiThi, { foreignKey: 'id_bai_thi', as: 'bai_thi_toiec' });

    // DoanVanPhuongTien relationships
    DoanVan.belongsToMany(PhuongTien, { through: DoanVanPhuongTien, foreignKey: 'id_doan_van', otherKey: 'id_phuong_tien', as: 'danh_sach_phuong_tien'  });
    PhuongTien.belongsToMany(DoanVan, { through: DoanVanPhuongTien, foreignKey: 'id_phuong_tien', otherKey: 'id_doan_van', as: 'danh_sach_doan_van'  });

    // BaiLamNguoiDung realationships
    BaiLamNguoiDung.belongsTo(NguoiDung, { foreignKey: 'id_nguoi_dung', as: 'nguoi_dung_lam_bai' });
    BaiLamNguoiDung.belongsTo(BaiThi, { foreignKey: 'id_bai_thi', as: 'bai_thi_nguoi_dung' });
    BaiLamNguoiDung.hasMany(CauTraLoiNguoiDung, { foreignKey: 'id_bai_lam_nguoi_dung', as: 'cau_tra_loi' });

  
    console.log('Tất cả các mối quan hệ đã được thiết lập thành công!');
};

module.exports = setupAssociations;

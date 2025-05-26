module.exports = (db) => {
    const { NganHangCauHoi, LuaChon, DoanVan, PhuongTien, PhanCauHoi } = db;

    // NganHangCauHoi
    NganHangCauHoi.belongsTo(PhanCauHoi, { foreignKey: 'id_phan' });
    NganHangCauHoi.belongsTo(DoanVan, { foreignKey: 'id_doan_van' });
    NganHangCauHoi.belongsTo(PhuongTien, { foreignKey: 'id_phuong_tien_hinh_anh', as: 'hinh_anh' });
    NganHangCauHoi.belongsTo(PhanCauHoi, { foreignKey: 'id_phuong_tien_am_thanh', as: 'am_thanh' });

    // LuaChon
    LuaChon.belongsTo(NganHangCauHoi, { foreignKey: 'id_cau_hoi' });
    NganHangCauHoi.hasMany(LuaChon, { foreignKey: 'id_cau_hoi' });

    // DoanVan
    PhanCauHoi.belongsTo(PhanCauHoi, { foreignKey: 'id_phan' });
    PhanCauHoi.belongsTo(PhuongTien, { foreignKey: 'id_phuong_tien_am_thanh', as: 'am_thanh' })
};
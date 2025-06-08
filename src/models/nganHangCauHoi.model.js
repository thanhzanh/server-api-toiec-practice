const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const NganHangCauHoi = sequelize.define(
  "NganHangCauHoi",
  {
    id_cau_hoi: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_phan: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_doan_van: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    noi_dung: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    dap_an_dung: {
      type: DataTypes.CHAR(1),
      allowNull: false,
    },
    giai_thich: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    muc_do_kho: {
      type: DataTypes.ENUM("de", "trung_binh", "kho"),
      defaultValue: "trung_binh",
    },
    trang_thai: {
      type: DataTypes.ENUM("da_xuat_ban", "luu_tru"),
      defaultValue: "da_xuat_ban",
    },
    id_phuong_tien_hinh_anh: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_phuong_tien_am_thanh: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nguon_goc: {
      type: DataTypes.ENUM("thu_cong", "nhap_excel"),
      defaultValue: "thu_cong",
    },
    thoi_gian_tao: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    thoi_gian_cap_nhat: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    da_xoa: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "ngan_hang_cau_hoi",
    timestamps: false,
  }
);

module.exports = NganHangCauHoi;

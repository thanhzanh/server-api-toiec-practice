const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const BaiThi = sequelize.define(
  "BaiThi",
  {
    id_bai_thi: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ten_bai_thi: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    mo_ta: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    so_luong_cau_hoi: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    muc_do_diem: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    la_bai_thi_dau_vao: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    trang_thai: {
        type: DataTypes.ENUM('nhap', 'da_xuat_ban', 'luu_tru'),
        defaultValue: 'nhap'
    },
    ngay_luu_tru: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
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
    tableName: "bai_thi",
    timestamps: false,
  }
);

module.exports = BaiThi;
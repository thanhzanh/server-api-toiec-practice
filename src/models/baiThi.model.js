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
      allowNull: true,
      defaultValue: 0
    },
    muc_do_diem: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: '0-0'
    },
    diem_toi_da: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    la_bai_thi_dau_vao: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    loai_bai_thi: {
      type: DataTypes.ENUM('tu_do', 'chuan'),
      defaultValue: 'chuan'
    },
    id_muc_do: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    trang_thai: {
      type: DataTypes.ENUM('nhap', 'da_xuat_ban', 'luu_tru'),
      defaultValue: 'nhap'
    },
    ngay_luu_tru: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    nam_xuat_ban: {
      type: DataTypes.INTEGER,
    },
    thoi_gian_bai_thi: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    da_hoan_thien: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    nguoi_tao: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
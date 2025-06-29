const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const NguoiDung = sequelize.define(
  "NguoiDung",
  {
    id_nguoi_dung: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    ten_dang_nhap: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
    mat_khau: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    id_google: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    vai_tro: {
      type: DataTypes.ENUM("nguoi_dung", "quan_tri_vien"),
      defaultValue: "nguoi_dung",
    },
    trang_thai: {
      type: DataTypes.ENUM("hoat_dong", "khong_hoat_dong"),
      defaultValue: "hoat_dong",
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
    tableName: "nguoi_dung",
    timestamps: false,
  }
);

module.exports = NguoiDung;
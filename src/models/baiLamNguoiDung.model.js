const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const BaiLamNguoiDung = sequelize.define(
  "BaiLamNguoiDung",
  {
    id_bai_lam_nguoi_dung: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_nguoi_dung: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    id_bai_thi: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    thoi_gian_bat_dau: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: true,
    },
    thoi_gian_ket_thuc: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    tong_diem: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    diem_nghe: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    diem_doc: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    da_hoan_thanh: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    },
  },
  {
    tableName: "bai_lam_nguoi_dung",
    timestamps: false,
  }
);

module.exports = BaiLamNguoiDung;
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ThoiGianBaiThi = sequelize.define(
  "ThoiGianBaiThi",
  {
    id_thoi_gian: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_bai_thi: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    thoi_gian_phut: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    loai_thoi_gian: {
      type: DataTypes.ENUM('kiem_tra_dau_vao', 'binh_thuong'),
      allowNull: true,
    },
  },
  {
    tableName: "thoi_gian_bai_thi",
    timestamps: false,
  }
);

module.exports = ThoiGianBaiThi;
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const BinhLuan = sequelize.define(
  "BinhLuan",
  {
    id_binh_luan: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_nguoi_dung: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_bai_viet: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    noi_dung: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    danh_gia: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    thoi_gian_tao: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    thoi_gian_cap_nhat: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "binh_luan",
    timestamps: false,
  }
);

module.exports = BinhLuan;
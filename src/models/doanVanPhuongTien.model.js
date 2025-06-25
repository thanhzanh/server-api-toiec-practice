const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DoanVanPhuongTien = sequelize.define(
  "DoanVanPhuongTien",
  {
    id_doan_van: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_phuong_tien: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "doan_van_phuong_tien",
    timestamps: false,
  }
);

module.exports = DoanVanPhuongTien;
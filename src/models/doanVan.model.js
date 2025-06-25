const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DoanVan = sequelize.define(
  "DoanVan",
  {
    id_doan_van: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tieu_de: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    noi_dung: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    loai_doan_van: {
      type: DataTypes.ENUM('single', 'double', 'triple'),
      defaultValue: 'single',
      allowNull: false,
    },
    id_phan: {
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
    tableName: "doan_van",
    timestamps: false,
  }
);

module.exports = DoanVan;
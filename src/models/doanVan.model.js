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
      allowNull: false,
    },
    id_phan: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "doan_van",
    timestamps: false,
  }
);

module.exports = DoanVan;
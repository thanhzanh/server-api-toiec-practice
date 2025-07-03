const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PhanQuyenVaiTro = sequelize.define(
  "PhanQuyenVaiTro",
  {
    id_vai_tro: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    id_quyen: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
  },
  {
    tableName: "phan_quyen_vai_tro",
    timestamps: false,
  }
);

module.exports = PhanQuyenVaiTro;
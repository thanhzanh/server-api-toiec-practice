const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const VaiTro = sequelize.define(
  "VaiTro",
  {
    id_vai_tro: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ten_vai_tro: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    mo_ta: {
      type: DataTypes.TEXT,
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
    da_xoa: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "vai_tro",
    timestamps: false,
  }
);

module.exports = VaiTro;
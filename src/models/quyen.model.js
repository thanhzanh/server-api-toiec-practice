const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Quyen = sequelize.define(
  "Quyen",
  {
    id_quyen: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ten_quyen: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    ma_quyen: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
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
    tableName: "quyen",
    timestamps: false,
  }
);

module.exports = Quyen;
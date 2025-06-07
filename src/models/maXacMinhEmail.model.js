const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const MaXacMinhEmail = sequelize.define(
  "MaXacMinhEmail",
  {
    id_ma: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_nguoi_dung: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    otp_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    thoi_gian_het_han: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    thoi_gian_tao: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "ma_xac_minh_email",
    timestamps: false,
  }
);

module.exports = MaXacMinhEmail;

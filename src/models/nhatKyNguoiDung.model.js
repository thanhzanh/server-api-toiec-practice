const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const NhatKyNguoiDung = sequelize.define(
  "NhatKyNguoiDung",
  {
    id_nhat_ky: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_nguoi_dung: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    hanh_dong: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    dia_chi_ip: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    mo_ta: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    thoi_gian_tao: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: true,
    }
  },
  {
    tableName: "nhat_ky_nguoi_dung",
    timestamps: false,
  }
);

module.exports = NhatKyNguoiDung;
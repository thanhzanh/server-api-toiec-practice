const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const HoSoNguoiDung = sequelize.define(
  "HoSoNguoiDung",
  {
    id_nguoi_dung: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    ho_ten: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    so_dien_thoai: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    url_hinh_dai_dien: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    dia_chi: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    ngay_sinh: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    gioi_thieu: {
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
  },
  {
    tableName: "ho_so_nguoi_dung",
    timestamps: false,
  }
);

module.exports = HoSoNguoiDung;

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TaiLieuNguPhap = sequelize.define(
  "TaiLieuNguPhap",
  {
    id_tai_lieu: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nguoi_tao: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_danh_muc: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tieu_de: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    noi_dung: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    vi_du: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ghi_chu: {
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
    tableName: "tai_lieu_ngu_phap",
    timestamps: false,
  }
);

module.exports = TaiLieuNguPhap;
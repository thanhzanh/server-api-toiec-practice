const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DanhMucBaiViet = sequelize.define(
  "DanhMucBaiViet",
  {
    id_danh_muc: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ten_danh_muc: {
      type: DataTypes.STRING(255),
      allowNull: false,
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
    tableName: "danh_muc_bai_viet",
    timestamps: false,
  }
);

module.exports = DanhMucBaiViet;
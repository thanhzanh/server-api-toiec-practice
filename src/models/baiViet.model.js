const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const BaiViet = sequelize.define(
  "BaiViet",
  {
    id_bai_viet: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_nguoi_dung: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    id_phuong_tien_hinh_anh: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    blog_status: {
      type: DataTypes.ENUM('cho_phe_duyet', 'da_xuat_ban', 'luu_tru'),
      defaultValue: 'cho_phe_duyet',
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
    tableName: "bai_viet",
    timestamps: false,
  }
);

module.exports = BaiViet;
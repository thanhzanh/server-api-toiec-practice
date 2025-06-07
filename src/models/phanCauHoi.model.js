const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PhanCauHoi = sequelize.define(
  "PhanCauHoi",
  {
    id_phan: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ten_phan: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    loai_phan: {
      type: DataTypes.ENUM("listening", "reading"),
      allowNull: false,
    },
    mo_ta: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    co_hinh_anh: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    co_am_thanh: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    co_doan_van: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "phan_cau_hoi",
    timestamps: false,
  }
);

module.exports = PhanCauHoi;
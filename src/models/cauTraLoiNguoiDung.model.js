const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CauTraLoiNguoiDung = sequelize.define(
  "CauTraLoiNguoiDung",
  {
    id_cau_tra_loi: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_bai_lam_nguoi_dung: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_cau_hoi: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    lua_chon_da_chon: {
      type: DataTypes.CHAR(1),
      allowNull: true,
    },
    la_dung: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    da_tra_loi: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    },
    thoi_gian_tra_loi: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "cau_tra_loi_nguoi_dung",
    timestamps: false,
  }
);

module.exports = CauTraLoiNguoiDung;
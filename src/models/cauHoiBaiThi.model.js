const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CauHoiBaiThi = sequelize.define(
  "CauHoiBaiThi",
  {
    id_cau_hoi_bai_thi: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_bai_thi: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_cau_hoi: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "cau_hoi_bai_thi",
    timestamps: false,
  }
);

module.exports = CauHoiBaiThi;
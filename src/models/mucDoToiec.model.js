const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const MucDoToiec = sequelize.define(
  "MucDoToiec",
  {
    id_muc_do: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    diem_bat_dau: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 990,
      },
    },
    diem_ket_thuc: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 990,
      },
    },
    cap_do: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mo_ta: {
      type: DataTypes.TEXT,
      allowNull: false,
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
    tableName: "muc_do_toiec",
    timestamps: false, 
  }
);

module.exports = MucDoToiec;

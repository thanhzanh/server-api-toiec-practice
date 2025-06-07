const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const LuaChon = sequelize.define(
  "LuaChon",
  {
    id_lua_chon: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_cau_hoi: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ky_tu_lua_chon: {
      type: DataTypes.CHAR(1),
      allowNull: false,
    },
    noi_dung: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "lua_chon",
    timestamps: false,
  }
);

module.exports = LuaChon;

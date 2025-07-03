const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Quyen = sequelize.define(
  "Quyen",
  {
    id_quyen: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ten_quyen: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    ma_quyen: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
  },
  {
    tableName: "quyen",
    timestamps: false,
  }
);

module.exports = Quyen;
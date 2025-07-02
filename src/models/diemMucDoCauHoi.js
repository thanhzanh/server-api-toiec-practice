const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DiemMucDoCauHoi = sequelize.define("DiemMucDoCauHoi", {
  muc_do_kho: {
    type: DataTypes.ENUM("de", "trung_binh", "kho"),
    primaryKey: true,
  },
  diem: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: "diem_muc_do_cau_hoi",
  timestamps: false,
});

module.exports = DiemMucDoCauHoi;

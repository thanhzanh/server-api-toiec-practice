const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const NganHangCauHoi = require('../models/nganHangCauHoi.model');

const LuaChon = sequelize.define('LuaChon', {
    id_lua_chon: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_cau_hoi: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ky_tu_lua_chon: {
        type: DataTypes.CHAR(1),
        allowNull: false
    },
    noi_dung: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'lua_chon',
    timestamps: fasle,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
});

LuaChon.belongsTo(NganHangCauHoi, { foreignKey: 'id_cau_hoi' });

module.exports = LuaChon;
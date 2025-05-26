const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const PhanCauHoi = require('./phanCauHoi.model');
const PhuongTien = require('./phuongTien.model');

const DoanVan = sequelize.define('DoanVan', {
    id_doan_van: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    noi_dung: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    id_phan: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_phuong_tien_am_thanh: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'doan_van',
    timestamps: false
});

PhanCauHoi.belongsTo(PhanCauHoi, { foreignKey: 'id_phan' });
PhanCauHoi.belongsTo(PhuongTien, { foreignKey: 'id_phuong_tien_am_thanh', as: 'am_thanh' })

module.exports = DoanVan;
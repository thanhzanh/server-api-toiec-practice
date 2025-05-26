const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PhuongTien = sequelize.define('PhuongTien', {
    id_phuong_tien: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    url_phuong_tien: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    loai_phuong_tien: {
        type: DataTypes.ENUM('hinh_anh', 'am_thanh'),
        allowNull: false
    },
    thoi_gian_tao: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'phuong_tien',
    timestamps: fasle
});

module.exports = PhuongTien;
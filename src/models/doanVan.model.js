const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const DoanVan = sequelize.define('DoanVan', {
        id_doan_van: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
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

    return DoanVan;
};
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const NguoiDung = require('./nguoiDung.model');

const MaXacMinhEmail = sequelize.define('MaXacMinhEmail', {
    id_ma: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    id_nguoi_dung: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: NguoiDung,
            key: 'id_nguoi_dung'
        }
    },
    otp_code: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    thoi_gian_het_han: {
        type: DataTypes.DATE,
        allowNull: false
    },
    thoi_gian_tao: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
}, {
    tableName: 'ma_xac_minh_email',
    timestamps: false
});

MaXacMinhEmail.belongsTo(NguoiDung, { foreignKey: 'id_nguoi_dung' });

module.exports = MaXacMinhEmail;
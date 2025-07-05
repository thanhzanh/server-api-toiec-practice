const VaiTro = require('../../models/vaiTro.model');
const Quyen = require('../../models/quyen.model');

const authorizePermission = (maQuyen) => {
    return async (req, res, next) => {
        try {
            const vaiTro = await VaiTro.findByPk(req.user.id_vai_tro, {
                include: [
                    {
                        model: Quyen,
                        as: 'ds_quyen',
                        attributes: ['ma_quyen']
                    }
                ]
            });

            const dsQuyen = vaiTro.ds_quyen.map(quyen => quyen.ma_quyen);

            if (!dsQuyen.includes(maQuyen)) {
                return res.status(403).json({ message: "Bạn không có quyền truy cập chức năng này!" });
            }

            next();

        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    };
};

module.exports = { authorizePermission };
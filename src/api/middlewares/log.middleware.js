const NhatKyNguoiDung = require('../../models/nhatKyNguoiDung.model');

const logAction = (action, description) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id_nguoi_dung;
            const ipAddress = req.ip || req.connection.remoteAdress || req.headers['x-forwarded-for'] || req.socket.remoteAdress;

            // Ghi nhật ký hành động
            await NhatKyNguoiDung.create({
                id_nguoi_dung: userId,
                hanh_dong: description,
                dia_chi_ip: ipAddress,
                thoi_gian_tao: new Date()
            });

            next();

        } catch (error) {
            console.error("Lỗi khi ghi nhật ký hành động:", error);
            return res.status(500).json({ message: "Lỗi khi ghi nhật ký hành động." });
        }
    }
}

module.exports = logAction;
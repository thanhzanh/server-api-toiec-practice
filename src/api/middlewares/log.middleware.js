const NhatKyNguoiDung = require('../../models/nhatKyNguoiDung.model');

const logAction = (action, description = () => null) => {
    return async (req, res, next) => {

        const originalSend = res.send;

        res.send = function (body) {
            // Gọi hàm gốc để gửi phản hồi
            originalSend.call(this, body);

            // Ghi nhật ký hành động sau phản hồi
            setImmediate(async () => {
                try {
                    const userId = req.user?.id_nguoi_dung;
                    
                    if (!userId) {
                        return next();
                    }
                    const ipAddress = req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
                    console.log(`Ghi nhật ký hành động: ${action} - Người dùng ID: ${userId} - IP: ${ipAddress}`);
                    
                    // Ghi nhật ký hành động
                    await NhatKyNguoiDung.create({
                        id_nguoi_dung: userId,
                        hanh_dong: action,
                        mo_ta: description(req) || null,
                        dia_chi_ip: ipAddress,
                        thoi_gian_tao: new Date()
                    });

                } catch (error) {
                    console.error("Lỗi khi ghi nhật ký hành động:", error);
                }
            });
        };
        next();
        
    }
}

module.exports = logAction;
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Truy cập bị từ chối" });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: "Token không hợp lệ" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Lưu thông tin người dùng vào request
        next();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const authorizeRole = (roles) => {
    return (req, res, next) => {        
        if(!roles.includes(req.user.vai_tro)) {
            return res.status(403).json({ message: "Bạn không có quyền truy cập" })
        }
        next();
    };
};

module.exports = { authenticateUser, authorizeRole };
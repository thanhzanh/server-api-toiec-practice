const { body, validationResult } = require('express-validator');
const NguoiDung = require("../../models/nguoiDung.model");

// Middleware xử lý lỗi validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation cho đăng ký
const registerValidation = [
    body('email')
        .isEmail().withMessage('Email không hợp lệ')
        .notEmpty().withMessage('Email là bắt buộc')
        .custom(async (value) => {
            const existingUser = await NguoiDung.findOne({ where: { email: value } });
            if (existingUser) {
                throw new Error('Email đã được sử dụng');
            }
            return true;
        }),
    body('ten_dang_nhap')
        .isLength({ min: 5, max: 30 }).withMessage('Tên đăng nhập từ 5 đến 30 ký tự')
        .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Tên đăng nhập phải chứa chữ cái, số, dấu gạch dưới hoặc dấu gạch ngang')
        .notEmpty().withMessage('Tên đăng nhập là bắt buộc')
        .custom(async (value) => {
            const user = await NguoiDung.findOne({ where: { email: value } });
            if (user) {
                throw new Error('Tên đăng nhập đã được sử dụng');
            }
            return true;
        }),
    body('mat_khau')
        .isLength({ min: 8 }).withMessage('Mật khẩu phải ít nhất ký tự')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).withMessage('Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt')
        .notEmpty().withMessage('Mật khẩu là bắt buộc'),
        validate
];

module.exports = { registerValidation };


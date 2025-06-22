const multer = require("multer");

const storage = multer.memoryStorage(); // lưu file trong RAM

const uploadExcel = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel"
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file Excel (.xlsx, .xls)"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = uploadExcel;

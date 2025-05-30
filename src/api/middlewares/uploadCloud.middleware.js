const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const multer = require('multer');
require('dotenv').config();

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET
});

// Cấu hình multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'audio/mpeg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file JPG, PNG hoặc MP3'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Hàm upload lên Cloudinary (sử dụng async/await)
const streamUpload = (buffer, resourceType) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// Middleware
module.exports.upload = (req, res, next) => {
  // Cấu hình upload cho question routes
  const uploadHandler = upload.fields([
    { name: 'data' },        // Text field cho JSON
    { name: 'hinh_anh', maxCount: 1 }, // Hình ảnh
    { name: 'am_thanh', maxCount: 1 } // Âm thanh
  ]);

  if (!req.headers['content-type']?.includes('multipart/form-data')) {
    return next(); // Không phải form-data, bỏ qua
  }

  uploadHandler(req, res, async (err) => {
    if (err) {
      console.log('Lỗi khi upload:', err.message);
      return res.status(400).json({ message: err.message });
    }

    // Xử lý upload lên Cloudinary với async/await
    try {
      if (req.files?.hinh_anh?.[0]) {
        console.log("Lỗi khi upload hình ảnh:", req.files.hinh_anh[0].originalname);
        const result = await streamUpload(req.files.hinh_anh[0].buffer, 'image');
        req.body.url_hinh_anh = result.secure_url;
      }

      if (req.files?.am_thanh?.[0]) {
        console.log("Lỗi khi upload âm thanh:", req.files.am_thanh[0].originalname);
        const result = await streamUpload(req.files.am_thanh[0].buffer, 'video');
        req.body.url_am_thanh = result.secure_url;
      }

      next();
    } catch (error) {
      console.log('Upload failed:', error.message);
      res.status(500).json({ message: "Upload file thất bại", error: error.message });
    }
  });
};
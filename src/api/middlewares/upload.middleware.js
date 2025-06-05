const multer = require('multer');
const { streamUpload } = require('../middlewares/uploadCloud.middleware');

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

// Tạo middleware upload file lên Cloudinary
// fields: Mảng gồm các { name, type } dùng để cấu hình từng file field
// Ví dụ: [{ name: 'avatar', type: 'image' }, { name: 'audio', type: 'video' }]

const uploadCloudinary = (fields) => {
    const multerFields = fields.map(f => ({ name: f.name, maxCount: 1 }));
    const uploadHandler = upload.fields(multerFields);

    return (req, res, next) => {
        if (!req.headers['content-type']?.includes('multipart/form-data')) return next();
        
        uploadHandler(req, res, async (err) => {
            if (err) {
              return res.status(400).json({ message: err.message });
            }

            try {
                for (f of fields) {
                    const file = req?.files?.[f.name]?.[0];
                    if (file) {
                        const resourceType = f.type;
                        const result = await streamUpload(file.buffer, resourceType);
                        req.body[`url_${f.name}`] = result.secure_url;
                    }
                }
                next();
            } catch (error) {
                res.status(500).json({ message: 'Upload thất bại', error: error.message });
            }

        });
    };
}

module.exports = { uploadCloudinary };
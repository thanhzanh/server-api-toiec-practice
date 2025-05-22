const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier');
require('dotenv').config();

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_KEY, 
    api_secret: process.env.CLOUD_SECRET // Click 'View API Keys' above to copy your API secret
});

module.exports.upload = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(); // Không có file, bỏ qua upload
        }
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                    }
                );

                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        let result = await streamUpload(req);
        console.log(result.secure_url);
        req.body.url_hinh_dai_dien = result.secure_url;
        return next();
    } catch (error) {
        console.error("Lỗi upload:", error);
        res.status(500).json({ message: "Upload ảnh thất bại", error });
    }
};
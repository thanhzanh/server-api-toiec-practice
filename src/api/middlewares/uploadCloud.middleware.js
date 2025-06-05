const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
require('dotenv').config();

// Cấu hình kết nối Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET
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

module.exports = { streamUpload };

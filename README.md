# Toiec Master - Hệ thống Ôn và Luyện Toiec

# Server api: https://server-api-toiec-practice.onrender.com

Hệ thống website ôn luyện thi TOEIC, được xây dựng bằng Node.js và Express.js. Hệ thống sử dụng MySQL làm cơ sở dữ liệu và Sequelize làm ORM để tương tác với database một cách hiệu quả.

# Tài khoản admin
Tài khoản: admin
Mật khẩu: Admin@123

# Tính năng chính:
1.Quản lý người dùng: Đăng ký, đăng nhập, xác thực bằng JWT (JSON Web Tokens).
2.Quản lý ngân hàng câu hỏi: Thêm, sửa, xóa các câu hỏi TOEIC theo từng phần (Part 1, Part 2, ..., Part 7), import câu hỏi vào ngân hàng câu hỏi.
3.Quản lý đề thi: Tạo các bộ đề thi hoàn chỉnh từ ngân hàng câu hỏi.
4.Làm bài thi & Chấm điểm: Ghi nhận câu trả lời của người dùng và chấm điểm tự động
5.Lịch sử luyện tập: Lưu lại kết quả các bài thi đã làm của người dùng.
6.Quản lý bài viết
7.Quản lý vai trò, quyền, phân quyền

# Công nghệ sử dụng:
1.Nền tảng: Node.js
2.Framework: Express.js
3.Cơ sở dữ liệu: MySQL
4.ORM: Sequelize
5.Xác thực: JSON Web Token (jsonwebtoken)
6.Mã hóa mật khẩu: bcrypt
7.Quản lý biến môi trường: dotenv
8.Validation: express-validator
9.Lưu hình ảnh âm thanh: cloudinary
10.Gửi email: nodemailer

# Hướng dẫn cài đặt:
1.Cài Node.js (phiên bản 18.x trở lên) và cài npm
2.Cài project về máy
    git clone https://github.com/thanhzanh/server-api-toiec-practice.git
    cd your-project-directory
3.Cài dependencies
    npm install
4.Tạo file .env thư mục gốc và tạo các biến như sau
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=toiec_db
DB_PORT=3306

JWT_SECRET=
SECRET_KEY=my_super_secret_key
REFRESH_TOKEN_SECRET=
ACCESS_TOKEN_SECRET=

NODE_ENV=development

EMAIL_USER=
EMAIL_PASS=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

CLOUD_NAME=
CLOUD_KEY=
CLOUD_SECRET=
5.Khởi chạy server
    npm run dev

# Cấu trúc Database
https://drive.google.com/drive/folders/1bDZuVXf45es08_cGH_GEkndwwNfS7vkz?usp=drive_link







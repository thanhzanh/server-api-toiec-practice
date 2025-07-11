const DanhMucBaiViet = require("../../models/danhMucBaiViet.model");
const BaiViet = require("../../models/baiViet.model");
const PhuongTien = require("../../models/phuongTien.model");
const NguoiDung = require("../../models/nguoiDung.model");
const striptags = require('striptags');
const { createPaginationQuery } = require('../../utils/pagination');

// [POST] /api/blogs/create/:id_nguoi_dung
module.exports.createBlog = async (req, res) => {
    try {
        const id_nguoi_dung = req.user.id_nguoi_dung;
        const { id_danh_muc, tieu_de, noi_dung, url_hinh_anh } = req.body;
        const noiDungStriptag = striptags(noi_dung);
        const idDanhMuc = parseInt(id_danh_muc);   
    
        if (!tieu_de || !noiDungStriptag || !idDanhMuc) {
            return res.status(400).json({ messsage: "Cần nhập đủ thông tin!" });
        }
    
        if (!url_hinh_anh) {
            return res.status(400).json({ messsage: "Hình ảnh không hợp lệ" });
        }

        // Kiểm tra người dùng
        const user = await NguoiDung.findByPk(parseInt(id_nguoi_dung));
        if (!user) {
            return res.status(404).json({ messsage: "Người dùng không tồn tại!" });
        }

        // Kiểm tra danh mục
        const category = await DanhMucBaiViet.findByPk(idDanhMuc);
        if (!category) {
            return res.status(404).json({ messsage: "Danh mục không tồn tại!" });
        }
    
        // Lưu ảnh vào phuong_tien
        const media = await PhuongTien.create({
            url_phuong_tien: url_hinh_anh,
            loai_phuong_tien: 'hinh_anh'
        });
    
        const blog = await BaiViet.create({
            id_nguoi_dung: id_nguoi_dung,
            id_danh_muc: category.id_danh_muc,
            tieu_de: tieu_de,
            noi_dung: noiDungStriptag,
            id_phuong_tien_hinh_anh: media.id_phuong_tien,
            blog_status: 'cho_phe_duyet',
            thoi_gian_tao: new Date()
        });
    
        res.status(200).json({
            messsage: "Tạo bài viết thành công, chờ phê duyệt",
            data: blog
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ messsage: error.messsage });
    }
};

// [GET] /api/blogs/user
module.exports.getUserBlogs = async (req, res) => {
    try {
        const id_nguoi_dung = req.user.id_nguoi_dung;

        const blogs = await BaiViet.findAll({
            where: {
                id_nguoi_dung: id_nguoi_dung,
                da_xoa: false
            },
            include: [
                {
                    model: DanhMucBaiViet,
                    as: 'danh_muc_bai_viet',
                    attributes: ['id_danh_muc', 'ten_danh_muc', 'mo_ta']
                },
                {
                    model: PhuongTien,
                    as: 'hinh_anh',
                    attributes: ['id_phuong_tien', 'url_phuong_tien']
                }
            ],
        });
        
        res.status(200).json({
            messsage: "Danh sách bài viết của người dùng",
            data: blogs
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ messsage: error.messsage });
    }
};





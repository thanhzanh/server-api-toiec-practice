const DanhMucBaiViet = require("../../models/danhMucBaiViet.model");
const BaiViet = require("../../models/baiViet.model");
const PhuongTien = require("../../models/phuongTien.model");
const NguoiDung = require("../../models/nguoiDung.model");
const HoSoNguoiDung = require("../../models/hoSoNguoiDung.model");
const striptags = require('striptags');
const { createPaginationQuery } = require('../../utils/pagination');

// [POST] /api/blogs/create/:id_nguoi_dung
module.exports.createUserBlog = async (req, res) => {
    try {
        const id_nguoi_dung = req.user.id_nguoi_dung;
        const { id_danh_muc, tieu_de, noi_dung, url_hinh_anh } = req.body;
        const noiDungStriptag = striptags(noi_dung);
        const idDanhMuc = parseInt(id_danh_muc);   
    
        if (!tieu_de || !noiDungStriptag || !idDanhMuc) {
            return res.status(400).json({ messsage: "Cần nhập đủ thông tin." });
        }
    
        if (!url_hinh_anh) {
            return res.status(400).json({ messsage: "Hình ảnh không hợp lệ." });
        }

        // Kiểm tra người dùng
        const user = await NguoiDung.findByPk(parseInt(id_nguoi_dung));
        if (!user) {
            return res.status(404).json({ messsage: "Người dùng không tồn tại." });
        }

        // Kiểm tra danh mục
        const category = await DanhMucBaiViet.findByPk(idDanhMuc);
        if (!category) {
            return res.status(404).json({ messsage: "Danh mục không tồn tại." });
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
            messsage: "Tạo bài viết thành công, chờ phê duyệt.",
            data: blog
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ messsage: error.message });
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
                    model: NguoiDung,
                    as: 'nguoi_dung',
                    attributes: ['id_nguoi_dung', 'email', 'ten_dang_nhap'],
                    include: [
                        {
                            model: HoSoNguoiDung,
                            as: 'ho_so',
                            attributes: ['ho_ten', 'url_hinh_dai_dien']
                        }
                    ]
                },
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
        res.status(500).json({ messsage: error.message });
    }
};

// [GET] /api/blogs/public
module.exports.getPublicBlogs = async (req, res) => {
    try {
        const { page, limit, id_danh_muc } = req.query;

        // Điều kiện lọc
        const where = {
            da_xoa: false,
            blog_status: 'da_xuat_ban'
        };
        if (id_danh_muc) { where.id_danh_muc = parseInt(id_danh_muc) };

        // Đếm tổng số bản ghi
        const count = await BaiViet.count({
            where,
            distinct: true
        });

        // Phân trang
        let initPagination = {
            currentPage: 1,
            limitItem: 10
        }
        const pagination = createPaginationQuery(
            initPagination,
            { page, limit },
            count
        );

        // Lấy danh sách danh mục bài viết
        const categoryBlogs = await DanhMucBaiViet.findAll({
            attributes: ['id_danh_muc', 'ten_danh_muc', 'mo_ta']
        })

        const blogs = await BaiViet.findAll({
            where,
            include: [
                {
                    model: NguoiDung,
                    as: 'nguoi_dung',
                    attributes: ['id_nguoi_dung', 'email', 'ten_dang_nhap'],
                    include: [
                        {
                            model: HoSoNguoiDung,
                            as: 'ho_so',
                            attributes: ['ho_ten', 'url_hinh_dai_dien']
                        }
                    ]
                },
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
            order: [['thoi_gian_tao', 'DESC']],
            offset: pagination.skip,
            limit: pagination.limitItem
        });
        
        res.status(200).json({
            messsage: "Danh sách bài viết hiển thị ngoài blog",
            data: blogs,
            pagination: {
                page: pagination.currentPage,
                limit: pagination.limitItem,
                total: count,
                totalPages: pagination.totalPages
            },
            categoryBlogs
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ messsage: error.message });
    }
};

// [PATCH] /api/blogs/update/:id_bai_viet
module.exports.updateUserBlog = async (req, res) => {
    try {
        const id_bai_viet = req.params.id_bai_viet;
        const id_nguoi_dung = req.user.id_nguoi_dung;
        const { tieu_de, noi_dung, id_danh_muc, url_hinh_anh } = req.body;

        const blog = await BaiViet.findOne({
            where: {
                id_bai_viet,
                id_nguoi_dung,
                da_xoa: false,
            },
            include: [
                {
                    model: PhuongTien,
                    as: 'hinh_anh',
                }
            ]
        });        

        if (!blog) {
            return res.status(404).json({ message: "Không tìm thấy bài viết hoặc chưa được xuất bản." });
        }

        // Cập nhật hình ảnh nếu có
        if (url_hinh_anh) {
            blog.hinh_anh.url_phuong_tien = url_hinh_anh;
            await blog.hinh_anh.save();
        }

        blog.tieu_de = striptags(tieu_de) || blog.tieu_de;
        blog.noi_dung = striptags(noi_dung) || blog.noi_dung;
        blog.id_danh_muc = id_danh_muc || blog.id_danh_muc;
        blog.thoi_gian_cap_nhat = new Date();

        await blog.save();

        res.status(200).json({
            message: "Cập nhật bài viết thành công.",
            data: blog
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// [DELETE] /api/blogs/delete/:id_bai_viet
module.exports.deleteUserBlog = async (req, res) => {
    try {
        const id_bai_viet = req.params.id_bai_viet;

        const blog = await BaiViet.findByPk(id_bai_viet);        

        if (!blog) {
            return res.status(404).json({ message: "Không tìm thấy bài viết." });
        }

        // Cập nhật lại csdl
        await blog.update({
            blog_status: 'luu_tru',
            da_xoa: true
        });

        res.status(200).json({
            message: "Đã gỡ bài viết thành công.",
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// [GET] /api/blogs/detail/:id_bai_viet
module.exports.getUserBlogsDetail = async (req, res) => {
    try {
        const { id_bai_viet } = req.params;

        const blog = await BaiViet.findByPk(id_bai_viet, {
            include: [
                {
                    model: NguoiDung,
                    as: 'nguoi_dung',
                    attributes: ['id_nguoi_dung', 'email', 'ten_dang_nhap'],
                    include: [
                        {
                            model: HoSoNguoiDung,
                            as: 'ho_so',
                            attributes: ['ho_ten', 'url_hinh_dai_dien']
                        }
                    ]
                },
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
            messsage: "Xem chi tiết bài viết của người dùng.",
            data: blog

        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ messsage: error.message });
    }
};

// [GET] /api/blogs/detail-public/:id_bai_viet
module.exports.getBlogsDetailPublic = async (req, res) => {
    try {
        const { id_bai_viet } = req.params;

        const blog = await BaiViet.findByPk(id_bai_viet, {
            include: [
                {
                    model: NguoiDung,
                    as: 'nguoi_dung',
                    attributes: ['id_nguoi_dung', 'email', 'ten_dang_nhap'],
                    include: [
                        {
                            model: HoSoNguoiDung,
                            as: 'ho_so',
                            attributes: ['ho_ten', 'url_hinh_dai_dien']
                        }
                    ]
                },
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
            messsage: "Xem chi tiết bài viết công khai.",
            data: blog
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ messsage: error.message });
    }
};

// [GET] /api/blogs/pending
module.exports.getAdminPendingBlogs = async (req, res) => {
    try {
        const { page, limit } = req.query;

        // Điều kiện lọc
        const where = {
            blog_status: 'cho_phe_duyet',
            da_xoa: false
        };

        // Đếm tổng số bản ghi
        const count = await BaiViet.count({
            where,
            distinct: true
        });

        // Phân trang
        let initPagination = {
            currentPage: 1,
            limitItem: 10
        }
        const pagination = createPaginationQuery(
            initPagination,
            { page, limit },
            count
        );

        // Danh sách bài viết chờ phê duyệt
        const blogs = await BaiViet.findAll({
            where,
            include: [
                {
                    model: NguoiDung,
                    as: 'nguoi_dung',
                    attributes: ['id_nguoi_dung', 'email', 'ten_dang_nhap'],
                    include: [
                        {
                            model: HoSoNguoiDung,
                            as: 'ho_so',
                            attributes: ['ho_ten', 'url_hinh_dai_dien']
                        }
                    ]
                },
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
            order: [['thoi_gian_tao', 'DESC']],
            offset: pagination.skip,
            limit: pagination.limitItem
        });
        
        res.status(200).json({
            messsage: "Danh sách bài viết chờ phê duyệt.",
            data: blogs,
            pagination: {
                page: pagination.currentPage,
                limit: pagination.limitItem,
                total: count,
                totalPages: pagination.totalPages
            }
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ messsage: error.message });
    }
};

// [GET] /api/blogs/index
module.exports.index = async (req, res) => {
    try {
        const { page, limit } = req.query;

        // Điều kiện lọc
        const where = {
            da_xoa: false,
            blog_status: 'da_xuat_ban'
        };

        // Đếm tổng số bản ghi
        const count = await BaiViet.count({
            where,
            distinct: true
        });

        // Phân trang
        let initPagination = {
            currentPage: 1,
            limitItem: 10
        }
        const pagination = createPaginationQuery(
            initPagination,
            { page, limit },
            count
        );

        // Danh sách trạng thái bài viết
        const blogStatuses = BaiViet.rawAttributes.blog_status.values;

        // Danh sách bài viết chờ phê duyệt
        const blogs = await BaiViet.findAll({
            where,
            include: [
                {
                    model: NguoiDung,
                    as: 'nguoi_dung',
                    attributes: ['id_nguoi_dung', 'email', 'ten_dang_nhap'],
                    include: [
                        {
                            model: HoSoNguoiDung,
                            as: 'ho_so',
                            attributes: ['ho_ten', 'url_hinh_dai_dien']
                        }
                    ]
                },
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
            order: [['thoi_gian_tao', 'DESC']],
            offset: pagination.skip,
            limit: pagination.limitItem
        });
        
        res.status(200).json({
            messsage: "Danh sách bài viết",
            data: blogs,
            pagination: {
                page: pagination.currentPage,
                limit: pagination.limitItem,
                total: count,
                totalPages: pagination.totalPages
            },
            blogStatuses
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ messsage: error.message });
    }
};

// [PATCH] /api/blogs/approve/:id_bai_viet
module.exports.approveAdminBlog = async (req, res) => {
    try {
        const id_bai_viet = req.params.id_bai_viet;
        const blog = await BaiViet.findByPk(id_bai_viet);
        if (!blog) {
            return res.status(400).json({ message: "Bài viết không tồn tại." });
        }

        // Cập nhật trạng thái bài viết
        blog.blog_status = 'da_xuat_ban';
        blog.thoi_gian_cap_nhat = new Date();
        await blog.save();
        
        res.status(200).json({
            messsage: "Đã duyệt bài viết.",
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ messsage: error.message });
    }
};

// [PATCH] /api/blogs/reject/:id_bai_viet
module.exports.rejectAdminBlog = async (req, res) => {  
    try {
        const id_bai_viet = req.params.id_bai_viet;
        const blog = await BaiViet.findByPk(id_bai_viet);
        if (!blog) {
            return res.status(400).json({ message: "Bài viết không tồn tại." });
        }

        // Cập nhật trạng thái bài viết
        blog.blog_status = 'tu_choi';
        blog.thoi_gian_cap_nhat = new Date();
        await blog.save();
        
        res.status(200).json({
            messsage: "Đã từ chối bài viết.",
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ messsage: error.message });
    }
}

// [DELETE] /api/blogs/admin-delete/:id_bai_viet
module.exports.deleteAdminBlog = async (req, res) => {
    try {
        const id_bai_viet = req.params.id_bai_viet;
        const blog = await BaiViet.findByPk(id_bai_viet);
        if (!blog) {
            return res.status(400).json({ message: "Bài viết không tồn tại." });
        }

        // Xóa khỏi cơ sở dữ liệu
        await blog.destroy();

        res.status(200).json({
            messsage: "Đã xóa bài viết thành công.",
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ messsage: error.message });
    }
}

// [GET] /api/blogs/admin-detail/:id_bai_viet
module.exports.getAdminBlogsDetail = async (req, res) => {
    try {
        const { id_bai_viet } = req.params;

        const blog = await BaiViet.findByPk(id_bai_viet, {
            include: [
                {
                    model: NguoiDung,
                    as: 'nguoi_dung',
                    attributes: ['id_nguoi_dung', 'email', 'ten_dang_nhap'],
                    include: [
                        {
                            model: HoSoNguoiDung,
                            as: 'ho_so',
                            attributes: ['ho_ten', 'url_hinh_dai_dien']
                        }
                    ]
                },
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

        if (!blog) {
            return res.status(404).json({ messsage: "Không tìm thấy bài viết." });
        }
        
        res.status(200).json({
            messsage: "Chi tiết bài viết của quản trị viên",
            data: blog
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ messsage: error.message });
    }
}

// [PATCH] /api/blogs/admin-update/:id_bai_viet
module.exports.updateAdminBlog = async (req, res) => {
    try {
        const id_bai_viet = req.params.id_bai_viet;
        const { tieu_de, noi_dung, id_danh_muc, url_hinh_anh } = req.body;

        const blog = await BaiViet.findByPk(id_bai_viet, {
            include: [
                {
                    model: PhuongTien,
                    as: 'hinh_anh',
                }
            ]
        });

        if (!blog) {
            return res.status(404).json({ message: "Không tìm thấy bài viết." });
        }

        // Cập nhật hình ảnh nếu có
        if (url_hinh_anh) {
            blog.hinh_anh.url_phuong_tien = url_hinh_anh;
            await blog.hinh_anh.save();
        }

        blog.tieu_de = striptags(tieu_de) || blog.tieu_de;
        blog.noi_dung = striptags(noi_dung) || blog.noi_dung;
        blog.id_danh_muc = id_danh_muc || blog.id_danh_muc;
        blog.thoi_gian_cap_nhat = new Date();

        await blog.save();

        res.status(200).json({
            message: "Cập nhật bài viết thành công.",
            data: blog
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}








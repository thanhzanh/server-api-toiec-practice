const BinhLuan = require('../../models/binhLuan.model');
const BaiViet = require('../../models/baiViet.model');
const NguoiDung = require('../../models/nguoiDung.model');
const HoSoNguoiDung = require('../../models/hoSoNguoiDung.model');

// [POST] /api/comments/create
module.exports.createComment = async (req, res) => {
    try {
        const { id_bai_viet, noi_dung, id_binh_luan_cha } = req.body;
        const id_nguoi_dung = req.user.id_nguoi_dung;

        // Bắt buộc nhập nội dung
        if (!noi_dung || noi_dung.trim() === '') {
            return res.status(400).json({ message: 'Nội dung bình luận không được để trống' });
        }

        // Kiểm tra bài viết có tồn tại không
        const baiViet = await BaiViet.findByPk(id_bai_viet);
        if (!baiViet) {
            return res.status(404).json({ message: 'Bài viết không tồn tại' });
        }

        // Tạo mới bình luận 
        const newComment = await BinhLuan.create({
            id_nguoi_dung,
            id_bai_viet,
            noi_dung,
            id_binh_luan_cha: id_binh_luan_cha || null // Nếu không có bình luận cha thì để null
        });

        res.status(200).json({ 
            message: 'Tạo bình luận thành công',
            data: newComment
        });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

// [GET] /api/comments/list/:id_bai_viet
module.exports.getCommentsByBlogId = async (req, res) => {
    try {
        const { id_bai_viet } = req.params;
        const comments = await BinhLuan.findAll({
            where: { id_bai_viet, id_binh_luan_cha: null }, // Lấy bình luận gốc (không phải phản hồi)
            include: [
                {
                    model: BinhLuan,
                    as: 'phan_hoi', 
                    include: [
                        {
                            model: NguoiDung,
                            attributes: ['id_nguoi_dung', 'ten_dang_nhap'],
                            as: 'nguoi_dung',
                            include: [
                                {
                                    model: HoSoNguoiDung,
                                    attributes: ['url_hinh_dai_dien'],
                                    as: 'ho_so'
                                }
                            ]
                        }
                    ],
                },
            ],
            order: [['thoi_gian_tao', 'DESC']]
        });

        res.status(200).json({
            message: 'Lấy danh sách bình luận thành công',
            data: comments
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};
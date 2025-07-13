const DanhMucNguPhap = require("../../models/danhMucNguPhap.model");
const TaiLieuNguPhap = require("../../models/taiLieuNguPhap.model");
const striptags = require("striptags");
const { createPaginationQuery } = require("../../utils/pagination");

// [POST] /api/grammars/create
module.exports.createGrammar = async (req, res) => {
  try {
    const { id_danh_muc, tieu_de, noi_dung, ghi_chu, vi_du } = req.body;

    const idDanhMuc = parseInt(id_danh_muc);

    // Kiểm tra dữ liệu đầu vào
    if (!idDanhMuc || !tieu_de || !noi_dung || !ghi_chu || !vi_du) {
      return res.status(400).json({ message: "Cần nhập đủ thông tin!" });
    }

    // Kiểm tra xem danh mục ngữ pháp có tồn tại không
    const danhMuc = await DanhMucNguPhap.findOne({
      where: {
        id_danh_muc: idDanhMuc,
        da_xoa: false,
      },
    });

    // Tạo ngữ pháp mới
    const newGrammar = await TaiLieuNguPhap.create({
      nguoi_tao: req.user.id_nguoi_dung,
      id_danh_muc: danhMuc.id_danh_muc,
      tieu_de: striptags(tieu_de),
      noi_dung: striptags(noi_dung),
      ghi_chu: striptags(ghi_chu),
      vi_du: striptags(vi_du),
    });

    res.status(200).json({
      message: "Tạo pháp thành công",
      data: newGrammar,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// [GET] /api/grammars/detail/:id_tai_lieu
module.exports.detailGrammar = async (req, res) => {
  try {
    const idTaiLieu = parseInt(req.params.id_tai_lieu);

    // Kiểm tra dữ liệu đầu vào
    if (!idTaiLieu) {
      return res.status(400).json({ message: "Cần nhập đủ thông tin!" });
    }

    // Lấy chi tiết ngữ pháp
    const grammar = await TaiLieuNguPhap.findOne({
      where: {
        id_tai_lieu: idTaiLieu,
        da_xoa: false,
      },
      include: [
        {
          model: DanhMucNguPhap,
          as: "danh_muc_ngu_phap",
        },
      ],
    });

    if (!grammar) {
      return res.status(404).json({ message: "Ngữ pháp không tồn tại!" });
    }

    res.status(200).json({
      message: "Lấy chi tiết ngữ pháp thành công",
      data: grammar,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// [PUT] /api/grammars/update/:id_tai_lieu
module.exports.updateGrammar = async (req, res) => {
    try {
        const id_tai_lieu = req.params.id_tai_lieu;
        const { tieu_de, noi_dung, ghi_chu, vi_du } = req.body;

        // Kiểm tra ngữ pháp có tồn tại không
        const grammar = await TaiLieuNguPhap.findByPk(id_tai_lieu);
        if (!grammar) {
            return res.status(404).json({ message: "Ngữ pháp không tồn tại!" });
        }

        // Kiểm tra danh mục ngữ pháp
        const danhMuc = await DanhMucNguPhap.findOne({
            where: {
                id_danh_muc: grammar.id_danh_muc,
                da_xoa: false,
            },
        });
        if (!danhMuc) {
            return res.status(404).json({ message: "Danh mục ngữ pháp không tồn tại!" });
        }

        // Cập nhật ngữ pháp
        const updatedData = {};
        if (tieu_de !== grammar.tieu_de && tieu_de !== undefined) {
            updatedData.tieu_de = striptags(tieu_de) || grammar.tieu_de;
        }
        if (noi_dung !== grammar.noi_dung && noi_dung !== undefined) {
            updatedData.noi_dung = striptags(noi_dung) || grammar.noi_dung;
        }
        if (ghi_chu !== grammar.ghi_chu && ghi_chu !== undefined) {
            updatedData.ghi_chu = striptags(ghi_chu) || grammar.ghi_chu;
        }
        if (vi_du !== grammar.vi_du && vi_du !== undefined) {
            updatedData.vi_du = striptags(vi_du) || grammar.vi_du;
        }

        updatedData.thoi_gian_cap_nhat = new Date();
        await grammar.update(updatedData);

        res.status(200).json({ message: "Cập nhật ngữ pháp thành công!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

// [DELETE] /api/grammars/delete/:id_tai_lieu
module.exports.deleteGrammar = async (req, res) => {    
    try {
        const id_tai_lieu = req.params.id_tai_lieu;

        // Kiểm tra ngữ pháp có tồn tại không
        const grammar = await TaiLieuNguPhap.findByPk(id_tai_lieu);
        if (!grammar) {
            return res.status(404).json({ message: "Ngữ pháp không tồn tại!" });
        }

        // Đánh dấu ngữ pháp là đã xóa
        await grammar.update({ da_xoa: true });

        res.status(200).json({ message: "Xóa ngữ pháp thành công!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

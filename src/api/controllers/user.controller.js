const NguoiDung = require("../../models/nguoiDung.model");
const HoSoNguoiDung = require("../../models/hoSoNguoiDung.model");
const VaiTro = require("../../models/vaiTro.model");
const { createPaginationQuery } = require('../../utils/pagination');
const { createSearchQuery } = require('../../utils/search');
const { Op, where, or } = require('sequelize');
const dayjs = require("dayjs");

// [GET] /api/users
module.exports.index = async(req, res) => {
    try {
        const { page, limit, search } = req.query;

        // Query tìm kiếm theo ten_dang_nhap và email
        const userSearch = createSearchQuery(search, ['email', 'ten_dang_nhap']);

        // Đếm tổng số bản ghi
        const count = await NguoiDung.count({
            where: {
                ...userSearch,
                da_xoa: false
            },
            distinct: true
        });

        // Query pagination
        let initPagination = {
            currentPage: 1,
            limitItem: 10
        }
        const pagination = createPaginationQuery(
            initPagination,
            { page, limit },
            count
        );

        // Xây dựng query
        const query = {
            offset: pagination.skip,
            limit: pagination.limitItem,
            where: {
                ...userSearch,
                da_xoa: false
            },
            attributes: ['id_nguoi_dung', 'email', 'ten_dang_nhap', 'id_vai_tro', 'trang_thai'],
            order: [['thoi_gian_tao', 'DESC']],
        }

        // Lấy danh sách người dùng
        const users = await NguoiDung.findAll(query);

        res.status(200).json({
            message: "Danh sách người dùng.",
            data: users,
            pagination: {
                page: pagination.currentPage,
                limit: pagination.limitItem,
                total: count,
                totalPages: pagination.totalPage
            }
        });
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [GET] /api/users/me
module.exports.getMe = async(req, res) => {
    try {
        const id_nguoi_dung = req.user.id_nguoi_dung;

        // Tìm người dùng
        const user = await NguoiDung.findByPk(id_nguoi_dung, { attributes: { exclude: ['mat_khau'] } });
        
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại." });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [GET] /api/users/detail/:id_nguoi_dung
module.exports.detailUser = async(req, res) => {
    try {
        const id_nguoi_dung = req.params.id_nguoi_dung;        

        // Lấy thông tin cá nhân
        let profile = await HoSoNguoiDung.findByPk(
            id_nguoi_dung, 
            {
                include: [
                    {
                        model: NguoiDung,
                        as: 'nguoi_dung',
                        attributes: ['email', 'ten_dang_nhap', 'id_vai_tro', 'trang_thai'],
                    },
                ],
            },
        );

        // Nếu chưa có hồ sơ thì lấy thông tin người dùng cơ bản
        if (!profile) {
            const nguoiDung = await NguoiDung.findByPk(id_nguoi_dung, {
                attributes: ['id_nguoi_dung', 'email', 'ten_dang_nhap', 'id_vai_tro', 'trang_thai']
            });

            if (!nguoiDung) {
                return res.status(404).json({ message: "Người dùng không tồn tại." });
            }

            // Trả về thông tin hồ sơ null
            profile = {
                id_nguoi_dung,
                ho_ten: null,
                so_dien_thoai: null,
                url_hinh_dai_dien: null,
                dia_chi: null,
                ngay_sinh: null,
                gioi_thieu: null,
                thoi_gian_tao: null,
                thoi_gian_cap_nhat: null,
                nguoi_dung: nguoiDung
            };
        }

        // Lấy danh sách trạng thái
        const listStatus = NguoiDung.rawAttributes.trang_thai.values;

        res.status(200).json({ 
            message: "Thông tin cá nhân người dùng." ,
            data: {
                user: profile,
                listStatus
            }
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// [GET] /api/users/detail-admin/:id_nguoi_dung
module.exports.detailAdmin = async(req, res) => {
    try {
        const id_nguoi_dung = req.params.id_nguoi_dung;        

        // Lấy thông tin cá nhân
        let profile = await HoSoNguoiDung.findByPk(
            id_nguoi_dung, 
            {
                include: [
                    {
                        model: NguoiDung,
                        as: 'nguoi_dung',
                        attributes: ['email', 'ten_dang_nhap', 'id_vai_tro', 'trang_thai'],
                    },
                ],
            },
        );

        // Nếu chưa có hồ sơ thì lấy thông tin người dùng cơ bản
        if (!profile) {
            const nguoiDung = await NguoiDung.findByPk(id_nguoi_dung, {
                attributes: ['id_nguoi_dung', 'email', 'ten_dang_nhap', 'id_vai_tro', 'trang_thai']
            });

            if (!nguoiDung) {
                return res.status(404).json({ message: "Người dùng không tồn tại." });
            }

            // Trả về thông tin hồ sơ null
            profile = {
                id_nguoi_dung,
                ho_ten: null,
                so_dien_thoai: null,
                url_hinh_dai_dien: null,
                dia_chi: null,
                ngay_sinh: null,
                gioi_thieu: null,
                thoi_gian_tao: null,
                thoi_gian_cap_nhat: null,
                nguoi_dung: nguoiDung
            };
        }

        // Lấy danh sách trạng thái
        const listStatus = NguoiDung.rawAttributes.trang_thai.values;

        res.status(200).json({ 
            message: "Thông tin cá nhân người dùng." ,
            data: {
                user: profile,
                listStatus
            }
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// [DELETE] /api/users/delete/:id_nguoi_dung
module.exports.deleteUser = async(req, res) => {
    try {
        const { id_nguoi_dung } = req.params;

        const user = await NguoiDung.findByPk(id_nguoi_dung);
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại." });
        }
        // Nếu là tài khoản quản trị viên thì không được xóa
        if (user.vai_tro === "quan_tri_vien") {
            return res.status(404).json({ message: "Đây là tài khoản quản trị viên không xóa được." });
        }

        // Xóa mềm trong database
        await user.update({ 
            da_xoa: true,
            trang_thai: 'khong_hoat_dong'
        });

        res.status(200).json({ message: "Đã xóa thành công." });
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [PATCH] /api/users/edit/:id_nguoi_dung
module.exports.editUser = async(req, res) => {
    try {
        const { ten_dang_nhap, ho_ten, so_dien_thoai, url_hinh_dai_dien, dia_chi, ngay_sinh, gioi_thieu, trang_thai } = req.body;        

        // id_nguoi_dung
        const { id_nguoi_dung } = req.params;

        // Kiểm tra người dùng
        const user = await NguoiDung.findByPk(id_nguoi_dung);
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại." });
        }

        // Cập nhật ten_dang_nhap, trang_thai từ bảng NguoiDung
        const userUpdateData = {};
        if (ten_dang_nhap && ten_dang_nhap !== user.ten_dang_nhap) {
            userUpdateData.ten_dang_nhap = ten_dang_nhap;
        }
        if (trang_thai !== undefined && trang_thai !== user.trang_thai) {
            userUpdateData.trang_thai = trang_thai;
        }
        // Khi có thay đổi thì cập nhật
        if (Object.keys(userUpdateData).length > 0) {
            userUpdateData.thoi_gian_cap_nhat = new Date();
            await user.update(userUpdateData);
        }

        const parseDate = (dateStr) => {
            const date = dayjs(dateStr, 'YYYY-MM-DD', true);
            return date.isValid() ? date.toDate() : null;
        }
            
        // Cập nhật hồ sơ người dùng
        let profile = await HoSoNguoiDung.findByPk(id_nguoi_dung);
        if (!profile) {
            // Tạo mới profile nếu chưa có
            profile = await HoSoNguoiDung.create({
                id_nguoi_dung: parseInt(id_nguoi_dung),
                ho_ten: ho_ten === "" ? null : ho_ten,
                so_dien_thoai: so_dien_thoai === "" ? null : so_dien_thoai,
                url_hinh_dai_dien: url_hinh_dai_dien === "" ? null : url_hinh_dai_dien,
                dia_chi: dia_chi === "" ? null : dia_chi,
                ngay_sinh: ngay_sinh === "" ? null : ngay_sinh,
                gioi_thieu: gioi_thieu === "" ? null : gioi_thieu,
            });
        } else {
            // Cập nhật profile đã có - chỉ cập nhật field có giá trị
            const updateData = {};
            if (ho_ten !== undefined) updateData.ho_ten = ho_ten === "" ? null : ho_ten;
            if (so_dien_thoai !== undefined) updateData.so_dien_thoai = so_dien_thoai === "" ? null : so_dien_thoai;
            if (url_hinh_dai_dien !== undefined) updateData.url_hinh_dai_dien = url_hinh_dai_dien ===  "" ? null : url_hinh_dai_dien;
            if (dia_chi !== undefined) updateData.dia_chi = dia_chi === "" ? null : dia_chi;
            if (ngay_sinh !== undefined) updateData.ngay_sinh = ngay_sinh === "" ? null : parseDate(ngay_sinh);
            if (gioi_thieu !== undefined) updateData.gioi_thieu = gioi_thieu === "" ? null : gioi_thieu;

            // Chỉ update nếu có dữ liệu thay đổi
            if (Object.keys(updateData).length > 0) {
                updateData.thoi_gian_cap_nhat = new Date();
                await profile.update(updateData);
            }
        }

        // Trả về thông tin người dùng
        const userProfile = await NguoiDung.findByPk(
            id_nguoi_dung,
            {
                attributes: ['id_nguoi_dung', 'ten_dang_nhap', 'trang_thai', 'id_vai_tro'],
                include: [
                    {
                        model: HoSoNguoiDung,
                        as: 'ho_so',
                        attributes: [
                            'ho_ten',
                            'so_dien_thoai',
                            'url_hinh_dai_dien',
                            'dia_chi',
                            'ngay_sinh',
                            'gioi_thieu'
                        ],
                    },
                ],
            },
        );        

        res.status(200).json({ 
            message: "Đã cập nhật thông tin cá nhân.",
            data: userProfile
        });
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [PATCH] /api/users/edit-admin/:id_nguoi_dung
module.exports.editAdmin = async(req, res) => {
    try {
        const { ten_dang_nhap, ho_ten, so_dien_thoai, url_hinh_dai_dien, dia_chi, ngay_sinh, gioi_thieu, trang_thai } = req.body;        

        // id_nguoi_dung
        const { id_nguoi_dung } = req.params;

        // Kiểm tra người dùng
        const user = await NguoiDung.findByPk(id_nguoi_dung);
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại." });
        }

        // Cập nhật ten_dang_nhap, trang_thai từ bảng NguoiDung
        const userUpdateData = {};
        if (ten_dang_nhap && ten_dang_nhap !== user.ten_dang_nhap) {
            userUpdateData.ten_dang_nhap = ten_dang_nhap;
        }
        if (trang_thai !== undefined && trang_thai !== user.trang_thai) {
            userUpdateData.trang_thai = trang_thai;
        }
        // Khi có thay đổi thì cập nhật
        if (Object.keys(userUpdateData).length > 0) {
            userUpdateData.thoi_gian_cap_nhat = new Date();
            await user.update(userUpdateData);
        }

        const parseDate = (dateStr) => {
            const date = dayjs(dateStr, 'YYYY-MM-DD', true);
            return date.isValid() ? date.toDate() : null;
        }
            
        // Cập nhật hồ sơ người dùng
        let profile = await HoSoNguoiDung.findByPk(id_nguoi_dung);
        if (!profile) {
            // Tạo mới profile nếu chưa có
            profile = await HoSoNguoiDung.create({
                id_nguoi_dung: parseInt(id_nguoi_dung),
                ho_ten: ho_ten === "" ? null : ho_ten,
                so_dien_thoai: so_dien_thoai === "" ? null : so_dien_thoai,
                url_hinh_dai_dien: url_hinh_dai_dien === "" ? null : url_hinh_dai_dien,
                dia_chi: dia_chi === "" ? null : dia_chi,
                ngay_sinh: ngay_sinh === "" ? null : ngay_sinh,
                gioi_thieu: gioi_thieu === "" ? null : gioi_thieu,
            });
        } else {
            // Cập nhật profile đã có - chỉ cập nhật field có giá trị
            const updateData = {};
            if (ho_ten !== undefined) updateData.ho_ten = ho_ten === "" ? null : ho_ten;
            if (so_dien_thoai !== undefined) updateData.so_dien_thoai = so_dien_thoai === "" ? null : so_dien_thoai;
            if (url_hinh_dai_dien !== undefined) updateData.url_hinh_dai_dien = url_hinh_dai_dien ===  "" ? null : url_hinh_dai_dien;
            if (dia_chi !== undefined) updateData.dia_chi = dia_chi === "" ? null : dia_chi;
            if (ngay_sinh !== undefined) updateData.ngay_sinh = ngay_sinh === "" ? null : parseDate(ngay_sinh);
            if (gioi_thieu !== undefined) updateData.gioi_thieu = gioi_thieu === "" ? null : gioi_thieu;

            // Chỉ update nếu có dữ liệu thay đổi
            if (Object.keys(updateData).length > 0) {
                updateData.thoi_gian_cap_nhat = new Date();
                await profile.update(updateData);
            }
        }

        // Trả về thông tin người dùng
        const userProfile = await NguoiDung.findByPk(
            id_nguoi_dung,
            {
                attributes: ['id_nguoi_dung', 'ten_dang_nhap', 'trang_thai', 'id_vai_tro'],
                include: [
                    {
                        model: HoSoNguoiDung,
                        as: 'ho_so',
                        attributes: [
                            'ho_ten',
                            'so_dien_thoai',
                            'url_hinh_dai_dien',
                            'dia_chi',
                            'ngay_sinh',
                            'gioi_thieu'
                        ],
                    },
                ],
            },
        );        

        res.status(200).json({ 
            message: "Đã cập nhật thông tin cá nhân.",
            data: userProfile
        });
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [PUT] /api/users/change-status/:id_nguoi_dung
module.exports.changeStatus = async(req, res) => {
    try {
        const { id_nguoi_dung } = req.params;
        const { trang_thai } = req.body;

        const user = await NguoiDung.findByPk(id_nguoi_dung);
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại." });
        }

        // Vai trò
        const role = await VaiTro.findOne({ where: { ten_vai_tro: 'quan_tri_vien' } });
        if (role) {
            return res.status(404).json({ message: "Không cập nhật trạng thái cho quản trị viên được." });
        }
        

        // Cập nhật trạng thái
        await user.update({ trang_thai: trang_thai });

        res.status(200).json({ message: "Thay đổi trạng thái thành công." });
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [PATCH] /api/users/update-profile
module.exports.updateProfile = async(req, res) => {
    try {
        
        const { ten_dang_nhap, ho_ten, so_dien_thoai, url_hinh_dai_dien, dia_chi, ngay_sinh, gioi_thieu } = req.body;

        // id_nguoi_dung
        const id_nguoi_dung = req.user.id_nguoi_dung;

        // Kiểm tra người dùng
        const user = await NguoiDung.findByPk(id_nguoi_dung);
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại." });
        }

        // Cập nhật ten_dang_nhap, trang_thai từ bảng NguoiDung
        const userUpdateData = {};
        if (ten_dang_nhap && ten_dang_nhap !== user.ten_dang_nhap) {
            userUpdateData.ten_dang_nhap = ten_dang_nhap;
        }
        // Khi có thay đổi thì cập nhật
        if (Object.keys(userUpdateData).length > 0) {
            userUpdateData.thoi_gian_cap_nhat = new Date();
            await user.update(userUpdateData);
        }

        const parseDate = (dateStr) => {
            const date = dayjs(dateStr, 'YYYY-MM-DD', true);
            return date.isValid() ? date.toDate() : null;
        }
            
        // Cập nhật hồ sơ người dùng
        let profile = await HoSoNguoiDung.findByPk(id_nguoi_dung);
        if (!profile) {
            // Tạo mới profile nếu chưa có
            profile = await HoSoNguoiDung.create({
                id_nguoi_dung: parseInt(id_nguoi_dung),
                ho_ten: ho_ten === "" ? null : ho_ten,
                so_dien_thoai: so_dien_thoai === "" ? null : so_dien_thoai,
                url_hinh_dai_dien: url_hinh_dai_dien === "" ? null : url_hinh_dai_dien,
                dia_chi: dia_chi === "" ? null : dia_chi,
                ngay_sinh: ngay_sinh === "" ? null : ngay_sinh,
                gioi_thieu: gioi_thieu === "" ? null : gioi_thieu,
            });
        } else {
            // Cập nhật profile đã có - chỉ cập nhật field có giá trị
            const updateData = {};
            if (ho_ten !== undefined) updateData.ho_ten = ho_ten === "" ? null : ho_ten;
            if (so_dien_thoai !== undefined) updateData.so_dien_thoai = so_dien_thoai === "" ? null : so_dien_thoai;
            if (url_hinh_dai_dien !== undefined) updateData.url_hinh_dai_dien = url_hinh_dai_dien ===  "" ? null : url_hinh_dai_dien;
            if (dia_chi !== undefined) updateData.dia_chi = dia_chi === "" ? null : dia_chi;
            if (ngay_sinh !== undefined) updateData.ngay_sinh = ngay_sinh === "" ? null : parseDate(ngay_sinh);
            if (gioi_thieu !== undefined) updateData.gioi_thieu = gioi_thieu === "" ? null : gioi_thieu;

            // Chỉ update nếu có dữ liệu thay đổi
            if (Object.keys(updateData).length > 0) {
                updateData.thoi_gian_cap_nhat = new Date();
                await profile.update(updateData);
            }
        }

        // Trả về thông tin người dùng
        const userProfile = await NguoiDung.findByPk(
            id_nguoi_dung,
            {
                attributes: ['id_nguoi_dung', 'ten_dang_nhap'],
                include: [
                    {
                        model: HoSoNguoiDung,
                        as: 'ho_so',
                        attributes: [
                            'ho_ten',
                            'so_dien_thoai',
                            'url_hinh_dai_dien',
                            'dia_chi',
                            'ngay_sinh',
                            'gioi_thieu'
                        ],
                    },
                ],
            },
        );

        res.status(200).json({ 
            message: "Đã cập nhật thông tin cá nhân.",
            data: userProfile
        });
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [GET] /api/users/profile
module.exports.getProfile = async(req, res) => {
    try {
        const id_nguoi_dung = req.user.id_nguoi_dung;        

        // Lấy thông tin cá nhân
        let profile = await NguoiDung.findByPk(
            id_nguoi_dung, 
            {
                include: [
                    {
                        model: HoSoNguoiDung,
                        as: 'ho_so',
                        attributes: { exclude: ['thoi_gian_cap_nhat'] },
                    },
                ],
                attributes: ['ten_dang_nhap', 'email', 'id_vai_tro', 'trang_thai']
            },
        );

        res.status(200).json({ 
            message: "Thông tin cá nhân người dùng." ,
            data: profile
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// [PATCH] /api/users/set-role/:id_nguoi_dung
module.exports.setUserRole = async(req, res) => {
    try {
        const { id_nguoi_dung } = req.params;
        const { id_vai_tro } = req.body;        

        // Kiểm tra người dùng tồn tại không
        const user = await NguoiDung.findByPk(id_nguoi_dung);
        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại." });
        }

        // Ràng buộc không cho cấp quyền quản trị viên
        const role = await VaiTro.findByPk(id_vai_tro);
        if (!role) {
            return res.status(404).json({ message: "Vai trò không tồn tại." });
        }
        if (role.ten_vai_tro === "quan_tri_vien") {
            return res.status(403).json({ message: "Không được phép cấp quyền quản trị viên." });
        }

        // Cập nhật id_vai_tro
        user.id_vai_tro = id_vai_tro;
        await user.save();  

        res.status(200).json({ 
            message: "Cập nhật vai trò thành công." ,
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
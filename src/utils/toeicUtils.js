const sequelize = require('../config/database');
const DiemMucDoCauHoi = require('../models/diemMucDoCauHoi');
const MucDoToiec = require('../models/mucDoToiec');
const NganHangCauHoi = require('../models/nganHangCauHoi.model');
const { Sequelize } = require('sequelize');

const layMucDoDiemToiecTuDiemToiDa = async (diem_toi_da) => {
  if (typeof diem_toi_da !== 'number') diem_toi_da = parseInt(diem_toi_da);
  if (diem_toi_da < 0) diem_toi_da = 0;
  if (diem_toi_da > 990) diem_toi_da = 990;
  
  // Lấy mức độ phù hợp
  const [rows] = await sequelize.query(`
      SELECT * FROM muc_do_toiec
      WHERE ? BETWEEN diem_bat_dau AND diem_ket_thuc
      LIMIT 1
  `, { replacements: [diem_toi_da] }
  );

  const level = rows?.[0];
  console.log("LEVEL: ", level);
  
  if (!level) {
      return {
        id_muc_do: 1,
        level: 'Cơ bản',
        mo_ta: 'Không thể sử dụng Tiếng Anh hiệu quả',
        range: [0, 100]
      }
  }

  return {
    id_muc_do: level.id_muc_do,
    level: level.muc_do,
    muc_do: level.mo_ta,
    range: [level.diem_bat_dau, level.diem_ket_thuc]
  };
};

const calculateDiemToiDaTheoDoKho  = async (dsCauHoi) => {
  // Lấy danh sách câu hỏi với mức độ khó
  const questions = await NganHangCauHoi.findAll({
    attributes: ['muc_do_kho'],
    where: {
      id_cau_hoi: dsCauHoi,
      da_xoa: false,
      trang_thai: 'da_xuat_ban'
    }
  });

  // Đếm số lượng mỗi mức độ
  const count = { de: 0, trung_binh: 0, kho: 0 };
  questions.forEach(question => {
    if (question.muc_do_kho) {
      count[question.muc_do_kho]++;
    }
  });

  // Lấy điểm tương ứng với điểm trong bảng muc_do_diem
  const rows = await DiemMucDoCauHoi.findAll();
  const diemMucDo = {};
  rows.forEach(row => {
    diemMucDo[row.muc_do_kho] = row.diem;
  });

  // Tỉnh điểm tối đa
  const diem_toi_da = count.de * diemMucDo.de + count.trung_binh * diemMucDo.trung_binh + count.kho * diemMucDo.kho;
  return diem_toi_da;

};

module.exports = { layMucDoDiemToiecTuDiemToiDa, calculateDiemToiDaTheoDoKho };
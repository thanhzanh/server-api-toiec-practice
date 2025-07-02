const sequelize = require('../config/database');
const MucDoToiec = require('../models/mucDoToiec');
const NganHangCauHoi = require('../models/nganHangCauHoi.model');
const { Sequelize } = require('sequelize');

const layMucDoToiec = async (diem_toi_da) => {
    if (diem_toi_da < 0) diem_toi_da = 0;
    if (diem_toi_da > 990) diem_toi_da = 990;
    
    // Lấy mức độ phù hợp
    const [result] = await sequelize.query(`
        SELECT * FROM muc_do_toiec
        WHERE ${diem_toi_da} BETWEEN diem_bat_dau AND diem_ket_thuc
        LIMIT 1
    `);

    const level = result[0];

    if (!level) {
        return {
            level: 'Cơ bản',
            mo_ta: 'Không thể sử dụng Tiếng Anh hiệu quả',
            range: [0, 100]
        }
    }

    return {
        level: level.muc_do,
        muc_do: level.mo_ta,
        range: [level.diem_bat_dau, level.diem_ket_thuc]
    };
};

const calculateMucDoDiem = async (questionIds) => {
  const questions = await NganHangCauHoi.findAll({
    where: { id_cau_hoi: questionIds, da_xoa: false },
    attributes: ['muc_do_kho'],
  });

  // Đếm số câu hỏi theo muc_do_kho
  const levelCounts = {
    'Dễ': 0,
    'Trung bình': 0,
    'Khó': 0,
  };
  questions.forEach((q) => {
    const level = q.muc_do_kho;
    levelCounts[level]++;
  });

  // Ánh xạ muc_do_kho sang cap_do và điểm trung bình
  const levelMapping = {
    'Dễ': { id_toeic_level: 2, score: (100 + 300) / 2 }, // Rất hạn chế
    'Trung bình': { id_toeic_level: 3, score: (300 + 450) / 2 }, // Trung bình
    'Khó': { id_toeic_level: 5, score: (650 + 850) / 2 }, // Tốt
  };

  // Tìm mức độ chiếm đa số (≥ 101 câu)
  let dominantLevelId = null;
  let maxCount = 0;
  for (const [level, count] of Object.entries(levelCounts)) {
    if (count > maxCount && count >= 101) {
      maxCount = count;
      dominantLevelId = levelMapping[level].id_toeic_level;
    }
  }

  // Nếu không có mức chiếm đa số, tính trung bình có trọng số
  if (!dominantLevelId) {
    let totalWeight = 0;
    let totalScore = 0;
    for (const [level, count] of Object.entries(levelCounts)) {
      if (count > 0) {
        const { score } = levelMapping[level];
        totalScore += score * count;
        totalWeight += count;
      }
    }
    const avgScore = totalWeight > 0 ? totalScore / totalWeight : 50; // Mặc định Cơ bản nếu không có câu
    const toeicLevel = await MucDoToiec.findOne({
      where: {
        diem_bat_dau: { [Sequelize.Op.lte]: avgScore },
        diem_ket_thuc: { [Sequelize.Op.gte]: avgScore },
      },
    });
    dominantLevelId = toeicLevel ? toeicLevel.id : 1; // Mặc định Cơ bản
  }

  const toeicLevel = await MucDoToiec.findByPk(dominantLevelId);
  return {
    id_muc_do: toeicLevel.id,
    muc_do_diem: `${toeicLevel.diem_bat_dau}-${toeicLevel.diem_ket_thuc}`,
  };
};

module.exports = { layMucDoToiec, calculateMucDoDiem };
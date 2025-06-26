
// [POST] /api/exams/submit-exam
module.exports.submitExam = async (req, res) => {
    console.log("Dữ liệu gửi lên: ", req.body);

    res.status(200).json({ message: "Nộp bài thi thành công" });
};
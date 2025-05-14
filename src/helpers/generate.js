module.exports.generateRandomNumber = (length) => {
    const ky_tu = "0123456789";

    let ket_qua = "";

    for (let i = 0; i < length; i++) {
        ket_qua += ky_tu.charAt(Math.floor(Math.random() * ky_tu.length));
    }
    return ket_qua;
};
const qr = require('qrcode');

const generateQrCode = async (url) => {
    let urlJson = JSON.stringify(url);
    try {
        const code = await qr.toDataURL(urlJson);
        return code;
    } catch (err) {
        console.log("Erro ao gerar QR code:", err);
        return null;
    }
};

module.exports = {
    generateQrCode,
};

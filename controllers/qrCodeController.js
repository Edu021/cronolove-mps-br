const qr = require('qrcode');

const generateQrCode = async (url) => {
    try {
        const code = await qr.toDataURL(url); // Usa a URL diretamente
        return code;
    } catch (err) {
        console.log("Erro ao gerar QR code:", err);
        return null;
    }
};

module.exports = {
    generateQrCode,
};

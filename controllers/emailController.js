const nodemailer = require('nodemailer')
const qrcode = require('./qrCodeController')

const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'cronolove.suporte@gmail.com',
        pass: process.env.EMAIL_APP_PASS,
    }
});

const sendEmail = async (url, email) => {
    base64code = await qrcode.generateQrCode(url);
    const htmlBody = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sua página está pronta!</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background-color: #ff6961; padding: 20px;">
                <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Sua página está pronta!</h1>
            </div>

            <!-- QR Code Section -->
            <div style="padding: 20px;">
                <p style="font-size: 18px; color: #333333; margin: 0 0 20px;">Aqui está o QR code para acessar sua página:</p>
                <div>
                    <img src="cid:qrcode" alt="QR Code" style="max-width: 100%; height: auto;"/>
                </div>
            </div>

            <!-- Footer Section -->
            <div style="background-color: #f4f4f4; padding: 20px;">
                <p style="color: #666666; font-size: 14px; margin: 0 0 10px;">
                    A equipe <strong>CronoLove</strong> agradece pela sua compra! Se tiver alguma dúvida, pedido ou sugestão, entre em contato respondendo este e-mail ou por esse Instagram diretamente com o desenvolvedor:
                </p>
                <a href="https://instagram.com/kizuedu" style="text-decoration: none;">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="Instagram" style="width: 30px; height: 30px;"/>
                </a>
                <p style="color: #666666; font-size: 14px; margin-top: 20px;">
                    Atenciosamente,<br>
                    <strong>CronoLove</strong>
                </p>
            </div>
        </div>
    </body>
    </html>`;

    transport.sendMail({
        from: 'CronoLove <cronolove.suporte@gmail.com>',
        to: email,
        subject: 'Sua página está pronta',
        html: htmlBody,
        attachments: [
            {
                filename: 'qrcode.png',
                content: base64code.split(',')[1],
                encoding: 'base64',
                cid: 'qrcode'
            }
        ]
    })
    .then(() => console.log('Email enviado com sucesso!'))
    .catch((err) => console.log("erro ao enviar email: " + err));


};

module.exports = {
    sendEmail,
};

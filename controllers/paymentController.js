const { MercadoPagoConfig, Preference } = require('mercadopago');
const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const PageModel = require('../models/page');
const emailController = require('./emailController');

const tempDir = path.join(__dirname, '..', 'temp');

if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

const mercadoPagoClient = new MercadoPagoConfig({
    sandbox: true,
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

const paymentController = {
    async createCheckoutSession(req, res) {
        console.log('Dados do formulário:', req.body);
        console.log('Arquivos enviados:', req.files);

        const { coupleName, started_at, plan, message, music, email } = req.body;
        let productName, price;

        switch (plan) {
            case 'basic':
                productName = 'Nosso site: 1 ano, 3 fotos e sem música';
                price = 1990;
                break;
            case 'premium':
                productName = 'Nosso site: Para sempre, 7 fotos e com música';
                price = 3990;
                break;
            default:
                productName = 'Especial :D';
                price = 199999;
                break;
        }

        try {
            // Criar preferência de pagamento
            const preference = new Preference(mercadoPagoClient);
            const response = await preference.create({
                body: {
                    items: [
                      {
                        title: `Página - ${coupleName}`,
                        description: `Mensagem: ${message}\nInício: ${started_at}\nMúsica: ${music}`,
                        picture_url: 'https://www.cronolove.com.br/images/corazon.png',
                        unit_price: plan === 'premium' ? 29.90 : 19.90,
                        quantity: 1,
                      },
                    ],
                    payer: {
                      email,
                    },
                    back_urls: {
                      success: `${process.env.BASE_URL}/complete`,
                      failure: `${process.env.BASE_URL}/failure`,
                      pending: `${process.env.BASE_URL}/pending`,
                    },
                    auto_return: "approved",
                }
            });

            const preferenceId = response.id;

            // Salvar imagens temporárias
            if (req.files && req.files.length > 0) {
                req.files.forEach((file) => {
                    let randomSuffix = Math.random().toString(36).substring(2, 11);
                    const uniqueFileName = `${randomSuffix}${Date.now()}`;
                    const tempFilePath = path.join(tempDir, uniqueFileName);

                    fs.renameSync(file.path, tempFilePath);

                    const query = `
                        INSERT INTO temp_images 
                        (session_id, image_name, coupleName, music, message, started_at, email, plan) 
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `;
                    db.query(query, [preferenceId, uniqueFileName, coupleName, music, message, started_at, plan], (err) => {
                        if (err) {
                            console.error('Erro ao salvar imagem temporária no banco:', err);
                        } else {
                            console.log('Imagem temporária registrada:', uniqueFileName);
                        }
                    });
                });
            }

            res.redirect(303, response.init_point);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Erro ao criar preferência', details: error.message });
        }
    },

    async completePayment(req, res) {
        const preferenceId = req.query.preference_id;

        if (preferenceId) {
            try {
                // Recuperar informações da preferência (se necessário)
                const query = 'SELECT image_name, coupleName, music, message, started_at, plan FROM temp_images WHERE session_id = ?';
                db.query(query, [preferenceId], (err, imageResults) => {
                    if (err) {
                        console.error('Erro ao recuperar imagens temporárias:', err);
                        return res.status(500).send('Erro ao recuperar imagens temporárias.');
                    }

                    if (imageResults.length > 0) {
                        const uploadsDir = path.join(__dirname, '..', 'uploads');

                        if (!fs.existsSync(uploadsDir)) {
                            fs.mkdirSync(uploadsDir);
                        }

                        const imageNames = [];
                        imageResults.forEach((image) => {
                            const tempImagePath = path.join(tempDir, image.image_name);
                            const finalImagePath = path.join(uploadsDir, image.image_name);

                            if (fs.existsSync(tempImagePath)) {
                                fs.renameSync(tempImagePath, finalImagePath);
                                console.log(`Imagem movida para uploads: ${image.image_name}`);
                                imageNames.push(image.image_name);
                            } else {
                                console.error(`Arquivo não encontrado: ${tempImagePath}`);
                            }
                        });

                        const imageString = imageNames.join(',');

                        const deleteQuery = 'DELETE FROM temp_images WHERE session_id = ?';
                        db.query(deleteQuery, [preferenceId], (err) => {
                            if (err) {
                                console.error('Erro ao apagar registros temporários:', err);
                            } else {
                                console.log('Registros temporários apagados.');
                            }
                        });

                        const { coupleName, music, message, started_at, plan } = imageResults[0];

                        PageModel.createPage(coupleName, imageString, music, message, started_at, plan, (err, result) => {
                            if (err) {
                                return res.status(500).json({ error: err.message });
                            }
                            const sanitizedName = coupleName.replace(/\s+/g, '-').toLowerCase();
                            emailController.sendEmail(`${process.env.BASE_URL}/${result.insertId}/${sanitizedName}`, req.body.email);
                            res.redirect(`${process.env.BASE_URL}/${result.insertId}/${sanitizedName}`);
                        });
                    } else {
                        res.send('Nenhuma imagem temporária encontrada.');
                    }
                });
            } catch (error) {
                console.error('Erro durante a finalização do pagamento:', error);
                res.status(500).send('Erro ao processar a finalização do pagamento.');
            }
        } else {
            res.status(400).send('preference_id é obrigatório.');
        }
    },

    paymentNotify(req, res) {
        const data = req.body;
    
        // Verifique se o tipo do evento é "payment"
        if (data.type === 'payment') {
            const paymentId = data.data.id;
            console.log('Payment ID recebido:', paymentId);

            // Use a configuração com MercadoPagoConfig
            const { MercadoPagoConfig, Payment } = require('mercadopago');
            const mercadoPagoClient = new MercadoPagoConfig({
                accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
            });
    
            // Recupere os detalhes do pagamento
            const paymentClient = new Payment(mercadoPagoClient);
    
            paymentClient.get(paymentId)
                .then(response => {
                    const paymentInfo = response.body;
                    const status = paymentInfo.status;
    
                    if (status === 'approved') {
                        const { payer: { email: payer_email }, metadata } = paymentInfo;
    
                        console.log(`Pagamento aprovado: ${paymentInfo.id} - ${payer_email}`);
    
                        // Extrair informações do metadata (personalizadas na preferência)
                        const { coupleName, message, music, started_at, plan } = metadata;
    
                        // Registrar a página da pessoa no banco de dados
                        PageModel.createPage(coupleName, music, message, started_at, plan, (err, result) => {
                            if (err) {
                                console.error('Erro ao criar página:', err);
                                return res.status(500).send('Erro ao criar página');
                            }
    
                            const sanitizedName = coupleName.replace(/\s+/g, '-').toLowerCase();
                            const pageUrl = `${process.env.BASE_URL}/${result.insertId}/${sanitizedName}`;
    
                            emailController.sendEmail(pageUrl, payer_email);
    
                            // Responda com sucesso ao Mercado Pago
                            res.status(200).send('Pagamento aprovado, página criada');
                        });
                    } else if (status === 'pending') {
                        console.log('Pagamento pendente');
                        res.status(200).send('Pagamento pendente');
                    } else {
                        console.log('Pagamento falhou');
                        res.status(200).send('Pagamento falhou');
                    }
                })
                .catch(error => {
                    console.error('Erro ao recuperar o pagamento:', error);
                    res.status(500).send('Erro ao processar pagamento');
                });
        } else {
            res.status(400).send('Evento desconhecido');
        }
    }
    
    

};

module.exports = paymentController;

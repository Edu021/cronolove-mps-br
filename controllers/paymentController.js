const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const PageModel = require('../models/page');
const emailController = require('./emailController')

const tempDir = path.join(__dirname, '..', 'temp');

if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

const paymentController = {
    async createCheckoutSession(req, res) {
        console.log('Dados do formulário:', req.body);
        console.log('Arquivos enviados:', req.files);
    
        const { coupleName, started_at, plan, message, music } = req.body;
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
            const session = await stripe.checkout.sessions.create({
                line_items: [{
                    price_data: {
                        currency: 'brl',
                        product_data: {
                            name: productName
                        },
                        unit_amount: price
                    },
                    quantity: 1
                }],
                mode: 'payment',
                success_url: `${process.env.BASE_URL}/complete?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.BASE_URL}/cancel`,
            });
    
            if (req.files && req.files.length > 0) {
                req.files.forEach((file) => {
                    let randomSuffix = Math.random().toString(36).substring(2, 11);

                    const uniqueFileName = `${randomSuffix}${Date.now()}`;
                    const tempFilePath = path.join(tempDir, uniqueFileName);
    
                    fs.renameSync(file.path, tempFilePath);
    
                    const query = 'INSERT INTO temp_images (session_id, image_name, coupleName, music, message, started_at, plan) VALUES (?, ?, ?, ?, ?, ?, ?)';
                    db.query(query, [session.id, uniqueFileName, coupleName, music, message, started_at, plan], (err, result) => {
                        if (err) {
                            console.error('Erro ao salvar imagem temporária no banco:', err);
                        } else {
                            console.log('Imagem temporária registrada:', uniqueFileName);
                        }
                    });
                });
            }
    
            res.redirect(303, session.url);
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao criar sessão de pagamento.');
        }
    },
    
    async completePayment(req, res) {
        const session_id = req.query.session_id;
    
        if (session_id) {
            try {
                const result = await Promise.all([
                    stripe.checkout.sessions.retrieve(String(session_id), { expand: ['payment_intent.payment_method'] }),
                    stripe.checkout.sessions.listLineItems(String(session_id))
                ]);
                const name = result[0].customer_details.name;
                const email = result[0].customer_details.email;
                if (result && result.length > 0) {
                    console.log('Cadastrando usuario...');
                    const query = 'INSERT INTO grawe_user (name, email) VALUES (?, ?)';
                    db.query(query, [name, email], (err, results) => {
                        if (err) {
                            console.error(err);
                        } else {
                            console.log('Usuário cadastrado');
                        }
                    });
    
                    const imageQuery = 'SELECT image_name, coupleName, music, message, started_at, plan FROM temp_images WHERE session_id = ?';
                    db.query(imageQuery, [session_id], (err, imageResults) => {
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
                            db.query(deleteQuery, [session_id], (err, deleteResult) => {
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
                                const sanitazedName = coupleName.replace(/\s+/g, '-').toLowerCase();
                                console.log(sanitazedName + result.insertId)
                                emailController.sendEmail(`${process.env.BASE_URL}/${result.insertId}/${sanitazedName}`, email)
                                res.redirect(`${process.env.BASE_URL}/${result.insertId}/${sanitazedName}`)
                                                            });
                        } else {
                            res.send('Nenhuma imagem temporária encontrada.');
                        }
                    });
                } else {
                    res.send('Você não pagou');
                }
            } catch (error) {
                console.error('Erro durante a finalização do pagamento:', error);
                if (error.type === 'StripeInvalidRequestError') {
                    res.status(400).send('Sessão de pagamento inválida. Verifique o session_id fornecido.');
                } else {
                    res.status(500).send('Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.');
                }
            }
        } else {
            res.status(400).send('session_id é obrigatório.');
        }
    }
    
};

module.exports = paymentController;

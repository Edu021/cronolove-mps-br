const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../config/db');
const PageModel = require('../models/page');
const fs = require('fs');
const path = require('path');

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

            res.redirect(303, session.url);
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao criar sessão de pagamento.');
        }
    },

    async completePayment(req, res) {
        if (req.query.session_id) {
            try {
                const result = await Promise.all([
                    stripe.checkout.sessions.retrieve(String(req.query.session_id), { expand: ['payment_intent.payment_method'] }),
                    stripe.checkout.sessions.listLineItems(String(req.query.session_id))
                ]);

                if (result && result.length > 0) {
                    console.log('Cadastrando usuario...');
                    const query = 'INSERT INTO grawe_user (name, email) VALUES (?, ?)';
                    db.query(query, [result[0].customer_details.name, result[0].customer_details.email], (err, results) => {
                        if (err) {
                            console.error(err);
                        } else {
                            console.log('Usuário cadastrado');
                        }
                    });

                    console.log('Cadastrando site...');

                    const coupleName = result[1].data.coupleName;
                    const music = result[1].data.music;
                    const message = result[1].data.message;
                    const started_at = result[1].data.started_at;
                    const plan = result[1].data.plan;

                    const imageFiles = req.files;

                    const imageNames = imageFiles.map(file => file.filename);

                    const imageString = imageNames.join(',');

                    PageModel.createPage(coupleName, imageString, music, message, started_at, plan, (err, result) => {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }
                        res.status(201).json({ message: 'Página criada com sucesso', id: result.insertId });
                    });

                    console.log(result[1].data);
                    res.send('Pagamento realizado com sucesso!');
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

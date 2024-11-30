const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const QRCode = require('qrcode');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const db = require('./config/db');
const upload = require('./middleware/upload');
const paymentController = require('./controllers/paymentController');
const pageController = require('./controllers/pageController');

const pageModel = require('./models/page');
const { stringify } = require('querystring');

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, '/views/images')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/html/', 'form.html'));
});

app.get('/teste', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/html/', 'teste.html'));
});
app.get('/form.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/css/', 'form.css'));
});

app.get('/template.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/css/', 'template.css'));
});

app.get('/footer.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/css/', 'footer.css'));
});
app.get('/teste.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/css/', 'teste.css'));
});

// API

app.post('/checkout', upload.array('image', 10), paymentController.createCheckoutSession);
app.get('/complete', upload.array('image', 10), paymentController.completePayment);
app.post('/pages', pageController.createPage);
app.get('/pages/:id', pageController.getPageById);

app.get('/cancel', (req, res) => {
    res.redirect('/')
})

app.get('/:id/:couple', (req, res) => {
    const id = parseInt(req.params.id);

    pageModel.getPageById(id, (err, page) => {
        if (err) {
            if (err.message === 'Page not found') {
                return res.status(404).json({ error: 'Página não encontrada' });
            }
            return res.status(500).json({ error: err.message });
        }

        const coupleSlug = req.params.couple;
        const coupleNameFromDb = page.couple_name.replace(/\s+/g, '-').toLowerCase();

        if (coupleSlug !== coupleNameFromDb) {
            return res.status(404).json({ error: 'URL não corresponde ao nome do casal' });
        }

        res.sendFile(path.join(__dirname, '/views/html/template.html'));
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

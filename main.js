const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const db = require('./config/db');
const pageController = require('./controllers/pageController');
const pageModel = require('./models/page');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, '/views/images')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/html/', 'form.html'));
});

app.get('/form.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/css/', 'form.css'));
});

app.get('/template.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/css/', 'template.css'));
});

// API

app.post('/pages', pageController.createPage);
app.get('/pages/:id', pageController.getPageById);

app.get('/:id/:couple', (req, res) => {
    const id = parseInt(req.params.id);  // Obter o ID do casal

    // Buscar os dados do casal no banco de dados pelo ID
    pageModel.getPageById(id, (err, page) => {
        if (err) {
            if (err.message === 'Page not found') {
                return res.status(404).json({ error: 'Página não encontrada' });
            }
            return res.status(500).json({ error: err.message });
        }

        // Verifica se o nome do casal na URL corresponde ao salvo no banco de dados
        const coupleSlug = req.params.couple;
        const coupleNameFromDb = page.couple_name.replace(/\s+/g, '-').toLowerCase();

        if (coupleSlug !== coupleNameFromDb) {
            return res.status(404).json({ error: 'URL não corresponde ao nome do casal' });
        }

        // Renderizar o template HTML e deixar o front-end carregar os dados via JS
        res.sendFile(path.join(__dirname, '/views/html/template.html'));
    });
});


// app.put('/pages/:id', pageController.updatePage);

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

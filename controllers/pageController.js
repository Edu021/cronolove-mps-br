const PageModel = require('../models/page');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: path.resolve(__dirname, '../uploads/'),
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 20000000 },
}).array('image', 7);

const createPage = (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao fazer upload das imagens' });
        }
        const { coupleName, music, message, started_at, plan } = req.body;
        const images = req.files ? req.files.map(file => file.filename) : [];
        const imageString = images.join(',');
        PageModel.createPage(coupleName, imageString, music, message, started_at, plan, (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Página criada com sucesso, retorna o ID da nova página
            res.status(201).json({ message: 'Página criada com sucesso', id: result.insertId });
        });
    });
};

const getPageById = (req, res) => {
    const id = parseInt(req.params.id);

    PageModel.getPageById(id, (err, page) => {
        if (err) {
            if (err.message === 'Page not found') {
                return res.status(404).json({ error: 'Página não encontrada' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.json(page);
    });
};

module.exports = {
    createPage,
    getPageById,
};

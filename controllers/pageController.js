const PageModel = require('../models/page');
const multer = require('multer');
const path = require('path');

// Configurando o multer para armazenar imagens no diretório 'uploads'
const storage = multer.diskStorage({
    destination: path.resolve(__dirname, '../uploads/'), // Caminho absoluto para a pasta 'uploads'
    filename: function (req, file, cb) {
        // Salva o arquivo com o nome do campo, timestamp e extensão original
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 20000000 }, // Limite de 20MB por arquivo
}).array('image', 7); // Limite de até 7 imagens

// Criar uma nova página
const createPage = (req, res) => {
    // Executar o upload das imagens
    upload(req, res, (err) => {
        if (err) {
            // Erro ao fazer upload das imagens
            return res.status(500).json({ error: 'Erro ao fazer upload das imagens' });
        }

        // Dados do formulário
        const { coupleName, music, message, started_at, plan } = req.body;

        // Se houver imagens, armazena os nomes dos arquivos em um array
        const images = req.files ? req.files.map(file => file.filename) : [];

        // Converte o array de imagens em uma string separada por vírgulas para salvar no banco de dados
        const imageString = images.join(',');

        // Inserir a nova página no banco de dados
        PageModel.createPage(coupleName, imageString, music, message, started_at, plan, (err, result) => {
            if (err) {
                // Erro ao salvar no banco de dados
                return res.status(500).json({ error: err.message });
            }

            // Página criada com sucesso, retorna o ID da nova página
            res.status(201).json({ message: 'Página criada com sucesso', id: result.insertId });
        });
    });
};

// Obter uma página específica pelo ID
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

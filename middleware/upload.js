// upload.js
const multer = require('multer');
const path = require('path');

// Define onde e como os arquivos serão armazenados

const storage = multer.diskStorage({
    destination: path.resolve(__dirname, '../uploads/'),
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

module.exports = upload;

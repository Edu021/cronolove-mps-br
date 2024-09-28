// upload.js
const multer = require('multer');
const path = require('path');

// Define onde e como os arquivos serão armazenados

const storage = multer.diskStorage({
    destination: path.resolve(__dirname, '../uploads/'),
    filename: function (req, file, cb) {
        let randomSuffix = Math.random().toString(36).substring(2, 11);
        cb(null, randomSuffix + '-' + Date.now());
    }
});

const upload = multer({ storage });

module.exports = upload;

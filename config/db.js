const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'hangar',
    password: 'Resultados@2019',
    database: 'loveyuu'
});

connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conectado ao banco de dados MySQL.');
    }
});

module.exports = connection;

const db = require('../config/db');

const createPage = (coupleName, images, music, message, started_at, plan, callback) => {
    const query = 'INSERT INTO grawe_page (couple_name, images, music, message, started_at, plan) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [coupleName, images, music, message, started_at, plan], (err, results) => {
        if (err) {
            return callback(err);
        }
        callback(null, results);
    });
};

const getPageById = (id, callback) => {
    const query = 'SELECT * FROM grawe_page WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) return callback(err);
        if (results.length === 0) return callback(new Error('Page not found'));
        callback(null, results[0]);
    });
};


const getPageByIdAndName = (id, coupleName, callback) => {
    const query = 'SELECT * FROM grawe_page WHERE id = ? and couple_name = ?';
    db.query(query, [id, coupleName], (err, results) => {
        if (err) return callback(err);
        if (results.length === 0) return callback(new Error('Page not found'));
        callback(null, results[0]);
    });
};

module.exports = {
    createPage,
    getPageById,
    getPageByIdAndName,
};

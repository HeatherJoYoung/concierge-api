// const db = require("../dbconnection");
const sql = require('mssql');

exports.getAllUsers = (callback) => {
    const config = {
        user: 'sa',
        password: 'sa',
        server: 'localhost',
        database: 'Demo',
        trustServerCertificate: true
    }

    sql.connect(config, (err) => {
        if (err) {
            return callback(err);
        }
        const request = new sql.Request();
        request.query('select * from users', (err, data) => {
            return callback(err, data);
        });
    })
}
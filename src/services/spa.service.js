// const db = require("../dbconnection");
const sql = require('mssql');

exports.getAllServices = (callback) => {
    console.log('in spa services');
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
        request.query('select * from spa_services', (err, data) => {
            return callback(err, data);
        });
    })
}
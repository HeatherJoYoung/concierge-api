// const db = require("../dbconnection");
const { request } = require('express');
const sql = require('mssql');

const config = {
    user: 'sa',
    password: 'sa',
    server: 'localhost',
    database: 'Demo',
    trustServerCertificate: true
}

exports.getAllServices = (callback) => {
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

exports.createService =  (title, descript, callback) => {
    sql.connect(config, (err) => {
        if(err){
            return callback(err);
        }
        const request = new sql.Request();
        request.input('title', sql.VarChar(30), title);
        request.input('descript', sql.VarChar(200), descript);

        request.query(
            'INSERT INTO spa_services (title, descript) VALUES (@title, @descript);', (err, data) => {
                return callback(err, data);
            });
    })
}

exports.deleteService = (id, callback) => {
    sql.connect(config, (err) => {
        if(err){
            return callback(err);
        }
        const request = new sql.Request();
        request.input('id', sql.Int, id);
        request.query(
            'DELETE FROM spa_services WHERE id = @id', (err, data) => {
                return callback(err, data);
        });
    })
}
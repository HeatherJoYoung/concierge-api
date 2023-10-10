const sql = require('mssql');

exports.getAllDiningCapacity = (callback) => {
    console.log('in dining capacity services');
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
        request.query('SELECT * FROM dining_capacity', (err, data) => {
            return callback(err, data);
        });
    })
}
const sql = require('mssql');

exports.getAllEvents = (callback) => {
    console.log('in events services');
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
        request.query('select * from special_events', (err, data) => {
            return callback(err, data);
        });
    })
}
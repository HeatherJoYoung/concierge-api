const sql = require('mssql');

const config = {
    user: 'sa',
    password: 'sa',
    server: 'localhost',
    database: 'Demo',
    trustServerCertificate: true
}

exports.getReservation = (table, callback) => {
    sql.connect(config, (err) => {
        if(err)
            return callback(err)

        const request = new sql.Request()
        request.query(`select * from ${table}`, (err, data) => {
            return callback(err, data)
        })
        
    })
}

exports.createEventReservation = (dataObj, callback) => {
    sql.connect(config, (err) => {
        if(err)
            return callback(err)

            const request = new sql.Request()
            request.input('first_name', sql.VarChar(20), dataObj.first_name)
            request.input('last_name', sql.VarChar(30), dataObj.last_name)
            request.input('email', sql.VarChar(40), dataObj.email)
            request.input('phone', sql.VarChar(15), dataObj.phone)
            request.input('event', sql.VarChar(30), dataObj.event)
            request.input('res_time', sql.SmallDateTime, dataObj.res_time)

            request.query('INSERT INTO event_reservations (first_name, last_name, email, phone, event, res_time) VALUES (@first_name, @last_name, @email, @phone, @event, @res_time)', (err, data) => {
                return callback(err, data)
            })
    })
}

exports.createSpaReservation = (dataObj, callback) => {
    sql.connect(config, (err) => {
        if(err)
            return callback(err)

            const request = new sql.Request()
            request.input('client_name', sql.VarChar(30), dataObj.client_name)
            request.input('client_email', sql.VarChar(40), dataObj.client_email)
            request.input('client_phone', sql.VarChar(15), dataObj.client_phone)
            request.input('spa_service', sql.VarChar(30), dataObj.spa_service)
            request.input('res_time', sql.SmallDateTime, dataObj.res_time)
            request.input('duration', sql.Time(7), dataObj.duration)

            request.query('INSERT INTO spa_reservations (client_name, client_email, client_phone, spa_service, res_time, duration) VALUES (@client_name, @client_email, @client_phone, @spa_service, @res_time, @duration)', (err, data) => {
                return callback(err, data)
            })
    })   
}

exports.createDiningReservation = (dataObj, callback) => {
    sql.connect(config, (err) => {
        if(err)
            return callback(err)

            const request = new sql.Request()
            request.input('table_id', sql.Int, dataObj.table_id);
            request.input('first_name', sql.VarChar(30), dataObj.first_name);
            request.input('last_name', sql.VarChar(30), dataObj.last_name);
            request.input('email', sql.VarChar(40), dataObj.email);
            request.input('phone', sql.VarChar(15), dataObj.phone);
            request.input('res_time', sql.SmallDateTime, dataObj.res_time);
            request.input('duration', sql.Time(7), dataObj.duration);

            request.query('INSERT INTO dining_reservations (table_id, first_name, last_name, email, phone, res_time, duration) VALUES (@table_id, @first_name, @last_name, @email, @phone, @res_time, @duration)', (err, data) => {
                return callback(err, data)
            })
    }) 
}
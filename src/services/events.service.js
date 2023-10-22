const sql = require('mssql');
const { request } = require('express');

const config = {
    user: 'sa',
    password: 'sa',
    server: 'localhost',
    database: 'Demo',
    trustServerCertificate: true
}

exports.getAllEvents = (callback) => {
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

exports.createEvent = (eventObj, callback) => {
    sql.connect(config, (err) => {
        if(err){
            return callback(err)
        }
        const request = new sql.Request()

        request.input('capacity', sql.Int, eventObj.capacity)
        request.input('contact_name', sql.VarChar(30), eventObj.contact_name)
        request.input('contact_email', sql.VarChar(40), eventObj.contact_email)
        request.input('contact_phone', sql.VarChar(15), eventObj.contact_phone)
        request.input('event_location', sql.VarChar(30), eventObj.event_location)
        request.input('title', sql.VarChar(30), eventObj.title)
        request.input('descript', sql.VarChar(200), eventObj.descript)
        request.input('start_time', sql.SmallDateTime, eventObj.start_time)
        request.input('end_time', sql.SmallDateTime, eventObj.end_time)

        request.query('INSERT INTO special_events (capacity, contact_name, contact_email, contact_phone, event_location, title, descript, start_time, end_time) VALUES (@capacity, @contact_name, @contact_email, @contact_phone, @event_location, @title, @descript, @start_time, @end_time)', (err, data) => {
            return callback(err, data)
        })
    })
}

exports.deleteEvent = (eventId, callback) => {
    sql.connect(config, (err) => {
        if(err){
            return callback(err)
        }
        const request = new sql.Request()

        request.input('eventId', sql.Int, eventId)
        request.query('DELETE FROM special_events WHERE id = @eventId', (err, data) => {
            return callback(err, data)
        })
    })
}
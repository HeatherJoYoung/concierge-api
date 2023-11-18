const { sql, poolPromise } = require('../../dbconnection');

exports.getAllEvents = async (callback) => {
  try {
    const pool = await poolPromise
    await pool.request()
      .query('select * from special_events', (err, data) => {
        return callback(err, data)
      })
  } catch(err) {
    return callback(err)
  }
}

exports.createEvent = async (eventObj, callback) => {
  try {
    const pool = await poolPromise
    await pool.request()
      .input('capacity', sql.Int, eventObj.capacity)
      .input('contact_name', sql.VarChar(30), eventObj.contact_name)
      .input('contact_email', sql.VarChar(40), eventObj.contact_email)
      .input('contact_phone', sql.VarChar(15), eventObj.contact_phone)
      .input('event_location', sql.VarChar(30), eventObj.event_location)
      .input('title', sql.VarChar(30), eventObj.title)
      .input('descript', sql.VarChar(200), eventObj.descript)
      .input('start_time', sql.SmallDateTime, eventObj.start_time)
      .input('end_time', sql.SmallDateTime, eventObj.end_time)
      .query('INSERT INTO special_events (capacity, contact_name, contact_email, contact_phone, event_location, title, descript, start_time, end_time) VALUES (@capacity, @contact_name, @contact_email, @contact_phone, @event_location, @title, @descript, @start_time, @end_time)', (err, data) => {
        return callback(err, data)
      })
  } catch(err) {
    return callback(err)
  }
}

exports.deleteEvent = async (eventId, callback) => {
  try {
    const pool = await poolPromise
    await pool.request()
      .input('eventId', sql.Int, eventId)
      .query('DELETE FROM special_events WHERE id = @eventId', (err, data) => {
        return callback(err, data)
      })
  } catch(err) {
    return callback(err)
  }
}
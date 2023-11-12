const sql = require('mssql');
const dayjs = require('dayjs');

const config = {
  user: 'sa',
  password: 'sa',
  server: 'localhost',
  database: 'Demo',
  trustServerCertificate: true
}

const ReservationService = {
  getReservation: (table, callback) => {
    sql.connect(config, (err) => {
      if(err) {
        return callback(err)
      }

      const request = new sql.Request()
      request.query(`select * from ${table}`, (err, data) => {
          return callback(err, data)
      })
    })
  },

  getEvent: async (id) => {
    return new Promise(function(resolve, reject) {
      sql.connect(config, (err) => {
        if(err) {
          return reject(err)
        }
        const request = new sql.Request()
        const query = `SELECT * from special_events WHERE id=${id}`
        console.log(query)
        request.query(query, (err, data) => {
          if (err) {
            return reject(err)
          }
          resolve(data.recordset[0])
        })
      })
    })
  },

  getEventCapacity: async (id) => {
    const event = await ReservationService.getEvent(id)
    return new Promise(function(resolve, reject) {
      sql.connect(config, (err) => {
        if(err) {
          return reject(err)
        }
        const request = new sql.Request()
        request.query(`SELECT * from event_reservations WHERE event_id=${id}`, (err, data) => {
          if (err) {
            return reject(err)
          }
          const capacity = event.capacity - data.recordset.length
          resolve(capacity)
        })
      })
    })
  },
  
  createEventReservation: async (dataObj, callback) => {
    const capacity = await ReservationService.getEventCapacity(dataObj.event_id)

    if (capacity < 1) {
      return callback('This event is full.')
    }
    sql.connect(config, (err) => {
      if(err) {
        return callback(err)
      }
        
      const request = new sql.Request()
      request.input('event_id', sql.Int, dataObj.event_id)
      request.input('first_name', sql.VarChar(20), dataObj.first_name)
      request.input('last_name', sql.VarChar(30), dataObj.last_name)
      request.input('email', sql.VarChar(40), dataObj.email)
      request.input('phone', sql.VarChar(15), dataObj.phone)
      request.input('res_time', sql.SmallDateTime, dataObj.res_time)

      request.query('INSERT INTO event_reservations (event_id, first_name, last_name, email, phone, res_time) VALUES (@event_id, @first_name, @last_name, @email, @phone, @res_time)', (err, data) => {
          return callback(err, data)
      })
    })
  },
  
  createSpaReservation: (dataObj, callback) => {
    sql.connect(config, (err) => {
      if(err) {
        return callback(err)
      }

      const request = new sql.Request()
      request.input('therapist_id', sql.Int, dataObj.therapist_id)
      request.input('client_name', sql.VarChar(30), dataObj.client_name)
      request.input('client_email', sql.VarChar(40), dataObj.client_email)
      request.input('client_phone', sql.VarChar(15), dataObj.client_phone)
      request.input('spa_service', sql.VarChar(30), dataObj.spa_service)
      request.input('res_time', sql.SmallDateTime, dataObj.res_time)
      request.input('duration', sql.Time(7), dataObj.duration)

      request.query('INSERT INTO spa_reservations (therapist_id, client_name, client_email, client_phone, spa_service, res_time, duration) VALUES (@therapist_id, @client_name, @client_email, @client_phone, @spa_service, @res_time, @duration)', (err, data) => {
          return callback(err, data)
      })
    })   
  },

  getBookedTables: (dataObj) => {
    return new Promise(function(resolve, reject) {
      sql.connect(config, (err) => {
        if(err) {
          return reject(err)
        }
  
        const timeFrameBegin = dayjs(dataObj.res_time).subtract(90, 'minute').toISOString()
        const timeFrameEnd = dayjs(dataObj.res_time).add(90, 'minute').toISOString()
        const request = new sql.Request()
        const query = `SELECT  table_id from dining_reservations WHERE res_time > '${timeFrameBegin}' AND res_time < '${timeFrameEnd}'`
        request.query(query, (err, data) => {
          if (err) {
            return reject(err)
          }
          resolve(data.recordset.map(obj => { return obj.table_id }))
        })
      })
    }) 
  },

  getAvailableTables: (args) => {
    return new Promise(function(resolve, reject) {
      sql.connect(config, (err) => { 
        if(err) {
          return reject(err)
        }
  
        const request = new sql.Request()
        const query = `SELECT  * from dining_capacity WHERE table_id NOT IN (${args.bookedIds}) AND max_seat_count >= ${args.guestCount }`

        request.query(query, (err, data) => {
            if (err) {
              return reject(err)
            }
            resolve(data.recordset.map(obj => { return obj.table_id }))
        })
      })
    })
  },
  
  createDiningReservation: async (dataObj, callback) => {
    const bookedTables = await ReservationService.getBookedTables(dataObj)
    const availableTables = await ReservationService.getAvailableTables({ bookedIds: bookedTables, guestCount: dataObj.guestCount })

    sql.connect(config, (err) => {
      if(err) {
        return callback(err)
      }

      if (availableTables?.length) {
        const request = new sql.Request()
        request.input('table_id', sql.Int, availableTables[0]);
        request.input('first_name', sql.VarChar(30), dataObj.first_name);
        request.input('last_name', sql.VarChar(30), dataObj.last_name);
        request.input('email', sql.VarChar(40), dataObj.email);
        request.input('phone', sql.VarChar(15), dataObj.phone);
        request.input('res_time', sql.SmallDateTime, dataObj.res_time);
        request.input('duration', sql.Time(7), dataObj.duration);
        request.input('guest_count', sql.Int, dataObj.guestCount)

        request.query('INSERT INTO dining_reservations (table_id, first_name, last_name, email, phone, res_time, duration, guest_count) VALUES (@table_id, @first_name, @last_name, @email, @phone, @res_time, @duration, @guest_count)', (err, data) => {
            return callback(err, data)
        })
      }
    }) 
  }
}

module.exports = ReservationService
const sql = require('mssql');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc)

const config = {
  user: 'sa',
  password: 'sa',
  server: 'localhost',
  database: 'Demo',
  trustServerCertificate: true
}

const ReservationService = {
  getReservation: async (params) => {
    return new Promise(function(resolve, reject) {
      const table = params.table;
      const id = params.id;

      if (!table) {
        return reject({ message: 'Table parameter missing.' })
      }
      if (!id) {
        return reject({ message: 'Reservation ID parameter missing.'})
      }

      sql.connect(config, (err) => {
        if(err) {
          return reject(err)
        }

        const request = new sql.Request()
        request.query(`select * from ${table} WHERE id=${id}`, (err, data) => {
            if (err) {
              return reject(err)          
            } else {
              return resolve(data.recordset[0])
            }
        })
      })
    }) 
  },

  getReservations: (table, callback) => {
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
    const capacity = await ReservationService.getEventCapacity(dataObj.eventId)

    if (!capacity || capacity < 1) {
      return callback('This event is full.')
    }
    sql.connect(config, (err) => {
      if(err) {
        return callback(err)
      }
        
      const request = new sql.Request()
      request.input('event_id', sql.Int, dataObj.eventId)
      request.input('first_name', sql.VarChar(20), dataObj.firstName)
      request.input('last_name', sql.VarChar(30), dataObj.lastName)
      request.input('email', sql.VarChar(40), dataObj.email)
      request.input('phone', sql.VarChar(15), dataObj.phone)
      request.input('res_time', sql.SmallDateTime, dataObj.resTime)
      request.input('party_count', sql.Int, dataObj.partyCount)

      request.query('INSERT INTO event_reservations (event_id, first_name, last_name, email, phone, res_time, party_count) VALUES (@event_id, @first_name, @last_name, @email, @phone, @res_time, @party_count)', (err, data) => {
          return callback(err, data)
      })
    })
  },

  deleteEventReservation: async (id, callback) => {
    if (!id) {
      return callback('Reservation ID needed to perform deletion.')
    }
    const currentReservation = await ReservationService.getReservation({ table: 'event_reservations', id: id })
    if (!currentReservation) {
      return callback('No reservation found.')
    }
    sql.connect(config, (err) => {
      if(err) {
        return callback(err)
      }
        
      const request = new sql.Request()
      request.query(`DELETE from event_reservations WHERE id=${id}`, (err, data) => {
          return callback(err, data)
      })
    })
  },

  updateEventReservation: async (dataObj, callback) => {
    const id = dataObj.id
    if (!id) {
      return callback('Cannot update. Reservation ID parameter missing.')
    }
    const currentReservation = await ReservationService.getReservation({ table: 'event_reservations', id: id })
    if (!currentReservation) {
      return callback('Reservation not found.')
    }

    sql.connect(config, (err) => {
      if(err) {
        return callback(err)
      }

      const mapParamToColumn = {
        'firstName': 'first_name',
        'lastName': 'last_name',
        'email': 'email',
        'phone': 'phone',
        'resTime': 'res_time',
        'partyCount': 'party_count'
      }
        
      const request = new sql.Request()
        request.input('first_name', sql.VarChar(20), dataObj.firstName)
        request.input('last_name', sql.VarChar(30), dataObj.lastName)
        request.input('email', sql.VarChar(40), dataObj.email)
        request.input('phone', sql.VarChar(15), dataObj.phone)
        request.input('res_time', sql.SmallDateTime, dataObj.resTime)
        request.input('party_count', sql.Int, dataObj.partyCount)
      
      let set = 'SET'
      for (const [key, value] of Object.entries(dataObj)) {
        const isInt = key === 'partyCount'
        set += isInt ? ` ${mapParamToColumn[key]} = ${value},` : ` ${mapParamToColumn[key]} = '${value}',`
      }

      const trimmedSetStatement = set.replace(/(^,)|(,$)/g, "") 
      const query = `UPDATE event_reservations ${trimmedSetStatement} WHERE id=${id}`

      request.query(query, (err, data) => {
          return callback(err, data)
      })
    })
  },

  getSpaSchedule: (callback) => {
    sql.connect(config, (err) => {
      if(err) {
        return reject(err)
      }

      const request = new sql.Request()
      const query = 'SELECT * from spa_schedule'
      request.query(query, (err, data) => {
        return callback(err, data)
      })
    })
  },

  getTherapistSchedule: async (args) => {
    return new Promise(function(resolve, reject) {
      sql.connect(config, (err) => {
        if(err) {
          return reject(err)
        }
        const day = dayjs(args.resStartTime).day()
        const request = new sql.Request()
        const query = `SELECT * from spa_schedule WHERE therapist=${args.therapistId} AND day_of_week=${day}`
        request.query(query, (err, data) => {
          if (err) {
            return reject(err)
          }
          if (!data.recordset.length) {
            resolve(null)
          }
          const result = data.recordset.map(record => {
            return {
              startTime: record.start_time,
              endTime: record.end_time
            }
          })
          resolve(result)
        })
      })
    })
  },

  checkAvailability: async (args) => {
    const schedule = await ReservationService.getTherapistSchedule(args)

    return new Promise(function(resolve, reject) {
      if (!schedule) {
        resolve(false)
      }
      let isOnScheduleForReservationTime = false

      schedule.forEach(timeframe => {
        const resDate = dayjs(args.resStartTime).utcOffset(0).startOf('day')
        const start = timeframe.startTime.split(':').map(e => parseInt(e))
        const startMinutes = (start[0] * 60) + start[1]
        const timeFrameStart = resDate.add(startMinutes, 'minute').format('YYYY-MM-DDTHH:mm:ss') 
        const end = timeframe.endTime.split(':').map(e => parseInt(e))
        const endMinutes = (end[0] * 60) + end[1]
        const timeFrameEnd = resDate.add(endMinutes, 'minute').format('YYYY-MM-DDTHH:mm:ss') 
        if (args.resStartTime >= timeFrameStart && args.resEndTime <= timeFrameEnd) {
          isOnScheduleForReservationTime = true
        }
      }) 
      if (!isOnScheduleForReservationTime) {
        resolve(false)
      }
      sql.connect(config, (err) => {
        if(err) {
          return reject(err)
        }
        const startTimeDayJS = dayjs(args.resStartTime).utcOffset(0)
        const endTimeDayJS = dayjs(args.resEndTime).utcOffset(0)
        const timeFrameBegin = startTimeDayJS.subtract(15, 'minute').format('YYYY-MM-DDTHH:mm:ss')
        const timeFrameEnd = endTimeDayJS.add(15, 'minute').format('YYYY-MM-DDTHH:mm:ss')
        const request = new sql.Request()
        const query = `SELECT * from spa_reservations WHERE (therapist_id=${args.therapistId}) AND ((res_start_time BETWEEN '${timeFrameBegin}' AND '${timeFrameEnd}') OR (res_end_time BETWEEN '${timeFrameBegin}' AND '${timeFrameEnd}'))`
        request.query(query, (err, data) => {
          if (err) {
            return reject(err)
          }
          const result = data.recordset.length ? 0 : 1
          resolve(result)
        })
      })
    })
  },
  
  createSpaReservation: async (dataObj, callback) => {
    const isAvailable = await ReservationService.checkAvailability(dataObj)
    if (!isAvailable) {
      return callback('Cannot make reservation for this therapist and time.')
    }

    sql.connect(config, (err) => {
      if(err) {
        return callback(err)
      }

      const request = new sql.Request()
      request.input('therapist_id', sql.Int, dataObj.therapistId)
      request.input('spa_service', sql.Int, dataObj.spaService)
      request.input('client_name', sql.VarChar(30), dataObj.clientName)
      request.input('client_email', sql.VarChar(40), dataObj.clientEmail)
      request.input('client_phone', sql.VarChar(15), dataObj.clientPhone)
      request.input('res_start_time', sql.SmallDateTime, dataObj.resStartTime)
      request.input('res_end_time', sql.SmallDateTime, dataObj.resEndTime)

      request.query('INSERT INTO spa_reservations (therapist_id,  spa_service, client_name, client_email, client_phone,res_start_time, res_end_time) VALUES (@therapist_id, @spa_service, @client_name, @client_email, @client_phone, @res_start_time, @res_end_time)', (err, data) => {
          return callback(err, data)
      })
    })   
  },

  deleteSpaReservation: async (id, callback) => {
    if (!id) {
      return callback('Reservation ID needed to perform deletion.')
    }
    const currentReservation = await ReservationService.getReservation({ table: 'spa_reservations', id: id })
    if (!currentReservation) {
      return callback('No reservation found.')
    }
    sql.connect(config, (err) => {
      if(err) {
        return callback(err)
      }

      const request = new sql.Request()

      request.query(`DELETE from spa_reservations WHERE id=${id}`, (err, data) => {
          return callback(err, data)
      })
    })   
  },

  updateSpaReservation: async (dataObj, callback) => {
    const id = dataObj.id
    if (!id) {
      return callback({ message: 'Cannot update. Reservation ID parameter missing.' })
    }
    const currentReservation = await ReservationService.getReservation({ table: 'spa_reservations', id: id })
    if (!currentReservation) {
      return callback({ message: 'Reservation not found.' })
    }

    sql.connect(config, (err) => {
      if(err) {
        return callback(err)
      }

      const mapParamToColumn = {
        'therapistId': 'therapist_id',
        'spaService': 'spa_service',
        'clientName': 'client_name',
        'clientPhone': 'client_phone',
        'resStartTime': 'res_start_time',
        'resEndTime': 'res_end_time'
      }

      const request = new sql.Request()
      request.input('therapist_id', sql.Int, dataObj.therapistId)
      request.input('spa_service', sql.Int, dataObj.spaService)
      request.input('client_name', sql.VarChar(30), dataObj.clientName)
      request.input('client_email', sql.VarChar(40), dataObj.clientEmail)
      request.input('client_phone', sql.VarChar(15), dataObj.clientPhone)
      request.input('res_start_time', sql.SmallDateTime, dataObj.resStartTime)
      request.input('res_end_time', sql.SmallDateTime, dataObj.resEndTime)

      let set = 'SET'
      for (const [key, value] of Object.entries(dataObj)) {
        if (key !== 'id') {
          const isInt = key === 'therapistId' || key === 'spaService'
          set += isInt ? ` ${mapParamToColumn[key]} = ${value},` : ` ${mapParamToColumn[key]} = '${value}',`
        }
      }
      const trimmedSetStatement = set.replace(/(^,)|(,$)/g, "") 
      const query = `UPDATE spa_reservations ${trimmedSetStatement} WHERE id=${id}`
      console.log(query)

      request.query(query, (err, data) => {
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
  
        const timeFrameBegin = dayjs(dataObj.resTime).subtract(90, 'minute').toISOString()
        const timeFrameEnd = dayjs(dataObj.resTime).add(90, 'minute').toISOString()
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
        const query =  args.bookedIds.length ? `SELECT  * from dining_capacity WHERE table_id NOT IN (${args.bookedIds}) AND max_seat_count >= ${args.guestCount }` : `SELECT  * from dining_capacity WHERE max_seat_count >= ${args.guestCount }`

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
        request.input('first_name', sql.VarChar(30), dataObj.firstName);
        request.input('last_name', sql.VarChar(30), dataObj.lastName);
        request.input('email', sql.VarChar(40), dataObj.email);
        request.input('phone', sql.VarChar(15), dataObj.phone);
        request.input('res_time', sql.SmallDateTime, dataObj.resTime);
        request.input('duration', sql.Time(7), dataObj.duration);
        request.input('guest_count', sql.Int, dataObj.guestCount)

        request.query('INSERT INTO dining_reservations (table_id, first_name, last_name, email, phone, res_time, duration, guest_count) VALUES (@table_id, @first_name, @last_name, @email, @phone, @res_time, @duration, @guest_count)', (err, data) => {
            return callback(err, data)
        })
      } else {
        return callback('No tables available at this time.')
      }
    }) 
  },

  deleteDiningReservation: async (id, callback) => {
    if (!id) {
      return callback('Reservation ID needed to perform deletion.')
    }
    const currentReservation = await ReservationService.getReservation({ table: 'dining_reservations', id: id })
    if (!currentReservation) {
      return callback('No reservation found.')
    }

    sql.connect(config, (err) => {
      if(err) {
        return callback(err)
      }

      const request = new sql.Request()
      request.query(`DELETE from dining_reservations WHERE id=${id}`, (err, data) => {
          return callback(err, data)
      })
    }) 
  },

  updateDiningReservation: async (dataObj, callback) => {
    const id = dataObj.id
    if (!id) {
      return callback({ message: 'Cannot update. Reservation ID parameter missing.' })
    }
    const currentReservation = await ReservationService.getReservation({ table: 'dining_reservations', id: id })
    if (!currentReservation) {
      return callback({ message: 'Reservation not found.' })
    }

    sql.connect(config, (err) => {
      if(err) {
        return callback(err)
      }

      const mapParamToColumn = {
        'tableId': 'table_id',
        'firstName': 'first_name',
        'lastName': 'last_name',
        'email': 'email',
        'phone': 'phone',
        'resTime': 'res_time',
        'duration': 'duration',
        'guestCount': 'guest_count'
      }

      const request = new sql.Request()
      request.input('table_id', sql.Int, dataObj.tableId);
      request.input('first_name', sql.VarChar(30), dataObj.firstName);
      request.input('last_name', sql.VarChar(30), dataObj.lastName);
      request.input('email', sql.VarChar(40), dataObj.email);
      request.input('phone', sql.VarChar(15), dataObj.phone);
      request.input('res_time', sql.SmallDateTime, dataObj.resTime);
      request.input('duration', sql.Time(7), dataObj.duration);
      request.input('guest_count', sql.Int, dataObj.guestCount);

      let set = 'SET'
      for (const [key, value] of Object.entries(dataObj)) {
        if (key !== 'id') {
          const isInt = key === 'tableId' || key === 'guestCount'
          set += isInt ? ` ${mapParamToColumn[key]} = ${value},` : ` ${mapParamToColumn[key]} = '${value}',`
        }
      }
      const trimmedSetStatement = set.replace(/(^,)|(,$)/g, "") 
      console.log(set)
      console.log(trimmedSetStatement)
      const query = `UPDATE dining_reservations ${trimmedSetStatement} WHERE id=${id}`
      console.log(query)

      request.query(query, (err, data) => {
          return callback(err, data)
      })
    }) 
  },
}

module.exports = ReservationService
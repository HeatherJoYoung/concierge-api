const { sql, poolPromise } = require('../../dbconnection')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
dayjs.extend(utc)

const ReservationService = {
  getReservation: async (params) => {
    const table = params.table;
    const id = params.id;

    if (!table) {
      console.log('Table parameter missing.')
      return
    }
    if (!id) {
      console.log('Reservation ID parameter missing.')
      return
    }

    try {
      const pool = await poolPromise
      const response  = await pool.query(`select * from ${table} WHERE id=${id}`)
      if (response.err) {
        console.log(err)
        return        
      } else {
        return response.recordset[0]
      }
    } catch(err) {
      console.log(err)
      return
    }
  },

  getReservations: async (table, callback) => {
    try {
      const pool = await poolPromise
      pool.query(`select * from ${table}`, (err, data) => {
          return callback(err, data)
        })
    } catch(err) {
      return callback(err)
    }
  },

  getEvent: async (id) => {
    try {
      const pool = await poolPromise
      const response = await pool.query(`SELECT * from special_events WHERE id=${id}`)
      if (response.err) {
        console.log(err)
        return
      } else {
        return response.recordset[0]
      }
    } catch(err) {
      console.log(err)
      return
    }
  },

  getEventCapacity: async (id) => {
    const event = await ReservationService.getEvent(id)

    if (!event || event.capacity === 0) {
      return 0
    }

    try {
      const pool = await poolPromise
      const response = await pool.query(`SELECT * from event_reservations WHERE event_id=${id}`)
      if (response.err) {
        console.log(err)
        return
      }
      const capacity = event.capacity - response.recordset.length
      return capacity
    } catch(err) {
      console.log(err)
      return
    }
  },
  
  createEventReservation: async (dataObj, callback) => {
    const capacity = await ReservationService.getEventCapacity(dataObj.eventId)

    if (!capacity || capacity < 1) {
      return callback('This event is full.')
    }
    try {
      const pool = await poolPromise
      await pool.request()
        .input('event_id', sql.Int, dataObj.eventId)
        .input('first_name', sql.VarChar(20), dataObj.firstName)
        .input('last_name', sql.VarChar(30), dataObj.lastName)
        .input('email', sql.VarChar(40), dataObj.email)
        .input('phone', sql.VarChar(15), dataObj.phone)
        .input('res_time', sql.SmallDateTime, dataObj.resTime)
        .input('party_count', sql.Int, dataObj.partyCount)
        .query('INSERT INTO event_reservations (event_id, first_name, last_name, email, phone, res_time, party_count) VALUES (@event_id, @first_name, @last_name, @email, @phone, @res_time, @party_count)', (err, data) => {
          return callback(err, data)
        })
    } catch(err) {
      return callback(err)
    }
  },

  deleteEventReservation: async (id, callback) => {
    if (!id) {
      return callback('Reservation ID needed to perform deletion.')
    }
    const currentReservation = await ReservationService.getReservation({ table: 'event_reservations', id: id })
    if (!currentReservation) {
      return callback('No reservation found.')
    }
    try {
      const pool = await poolPromise
      await pool.request()
        .query(`DELETE from event_reservations WHERE id=${id}`, (err, data) => {
          return callback(err, data)
        })
    } catch(err) {
      return callback(err)
    }
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

    let set = 'SET'
    for (const [key, value] of Object.entries(dataObj)) {
      if (key !== 'id' && value) {
        const isInt = key === 'partyCount'
        set += isInt ? ` ${key} = ${value},` : ` ${key} = '${value}',`
      }
    }
    const trimmedSetStatement = set.replace(/(^,)|(,$)/g, "")
    const query = `UPDATE event_reservations ${trimmedSetStatement} WHERE id=${id}`

    try {
      const pool = await poolPromise
      await pool.request()
        .input('first_name', sql.VarChar(20), dataObj.firstName)
        .input('last_name', sql.VarChar(30), dataObj.lastName)
        .input('email', sql.VarChar(40), dataObj.email)
        .input('phone', sql.VarChar(15), dataObj.phone)
        .input('res_time', sql.SmallDateTime, dataObj.resTime)
        .input('party_count', sql.Int, dataObj.partyCount)
        .query(query, (err, data) => {
          return callback(err, data)
        })
    } catch(err) {
      return callback(err)
    }
  },

  getSpaSchedule: async (callback) => {
    try {
      const pool = await poolPromise
      await pool.request()
        .query('SELECT * from spa_schedule', (err, data) => {
          return callback(err, data)
        })
    } catch(err) {
      return callback(err)
    }
  },

  getTherapistSchedule: async (args) => {
    try {
      const day = dayjs(args.resStartTime).day()
      const query = `SELECT * from spa_schedule WHERE therapist=${args.therapistId} AND day_of_week=${day}`
      const pool = await poolPromise
      const response = await pool.query(query)
      if (response.err) {
        console.log(err)
        return
      }
      if (!response.recordset.length) {
        return
      }
      const result = response.recordset.map(record => {
        return {
          startTime: record.start_time,
          endTime: record.end_time
        }
      })
      return result
    } catch(err) {
      console.log(err)
      return
    }
  },

  checkAvailability: async (args) => {
    const schedule = await ReservationService.getTherapistSchedule(args)
    let isOnScheduleForReservationTime = false

    if (!schedule) {
      return
    }

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
      return 0
    }

    const startTimeDayJS = dayjs(args.resStartTime).utcOffset(0)
    const endTimeDayJS = dayjs(args.resEndTime).utcOffset(0)
    const timeFrameBegin = startTimeDayJS.subtract(15, 'minute').format('YYYY-MM-DDTHH:mm:ss')
    const timeFrameEnd = endTimeDayJS.add(15, 'minute').format('YYYY-MM-DDTHH:mm:ss')
    const query = `SELECT * from spa_reservations WHERE (therapist_id=${args.therapistId}) AND ((res_start_time BETWEEN '${timeFrameBegin}' AND '${timeFrameEnd}') OR (res_end_time BETWEEN '${timeFrameBegin}' AND '${timeFrameEnd}'))`

    try {
      const pool = await poolPromise
      const response = await pool.query(query)
      if (response.err) {
        console.log(err)
        return
      }
      const result = response.recordset.length ? 0 : 1
      return result
      } catch(err) {
        console.log(err)
        return
      }
    },
  
  createSpaReservation: async (dataObj, callback) => {
    const isAvailable = await ReservationService.checkAvailability(dataObj)
    if (!isAvailable) {
      return callback('Cannot make reservation for this therapist and time.')
    }

    try {
      const pool = await poolPromise
      await pool.request()
        .input('therapist_id', sql.Int, dataObj.therapistId)
        .input('spa_service', sql.Int, dataObj.spaService)
        .input('client_name', sql.VarChar(30), dataObj.clientName)
        .input('client_email', sql.VarChar(40), dataObj.clientEmail)
        .input('client_phone', sql.VarChar(15), dataObj.clientPhone)
        .input('res_start_time', sql.SmallDateTime, dataObj.resStartTime)
        .input('res_end_time', sql.SmallDateTime, dataObj.resEndTime)
        .query('INSERT INTO spa_reservations (therapist_id,  spa_service, client_name, client_email, client_phone,res_start_time, res_end_time) VALUES (@therapist_id, @spa_service, @client_name, @client_email, @client_phone, @res_start_time, @res_end_time)', (err, data) => {
          return callback(err, data)
        })
    } catch(err) {
      return callback(err)
    }   
  },

  deleteSpaReservation: async (id, callback) => {
    if (!id) {
      return callback('Reservation ID needed to perform deletion.')
    }
    const currentReservation = await ReservationService.getReservation({ table: 'spa_reservations', id: id })
    if (!currentReservation) {
      return callback('No reservation found.')
    }
    
    try {
      const pool = await poolPromise
      pool.query(`DELETE from spa_reservations WHERE id=${id}`, (err, data) => {
          return callback(err, data)
        })
    } catch(err) {
      return callback(err)
    }   
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

    const mapParamToColumn = {
      'therapistId': 'therapist_id',
      'spaService': 'spa_service',
      'clientName': 'client_name',
      'clientPhone': 'client_phone',
      'resStartTime': 'res_start_time',
      'resEndTime': 'res_end_time'
    }

    let set = 'SET'
    for (const [key, value] of Object.entries(dataObj)) {
      if (key !== 'id') {
        const isInt = key === 'therapistId' || key === 'spaService'
        set += isInt ? ` ${mapParamToColumn[key]} = ${parseInt(value)},` : ` ${mapParamToColumn[key]} = '${value}',`
      }
    }
    const trimmedSetStatement = set.replace(/(^,)|(,$)/g, "") 
    const query = `UPDATE spa_reservations ${trimmedSetStatement} WHERE id=${id}`

    try {
      const pool = await poolPromise
      await pool.request()
        .input('therapist_id', sql.Int, dataObj.therapistId)
        .input('spa_service', sql.Int, dataObj.spaService)
        .input('client_name', sql.VarChar(30), dataObj.clientName)
        .input('client_email', sql.VarChar(40), dataObj.clientEmail)
        .input('client_phone', sql.VarChar(15), dataObj.clientPhone)
        .input('res_start_time', sql.SmallDateTime, dataObj.resStartTime)
        .input('res_end_time', sql.SmallDateTime, dataObj.resEndTime)
        .query(query, (err, data) => {
          return callback(err, data)
        })
    } catch(err) {
      return callback(err)
    }  
  },

  getBookedTables: async (dataObj) => {

    const timeFrameBegin = dayjs(dataObj.resTime).subtract(90, 'minute').toISOString()
    const timeFrameEnd = dayjs(dataObj.resTime).add(90, 'minute').toISOString()
    const query = `SELECT  table_id from dining_reservations WHERE res_time > '${timeFrameBegin}' AND res_time < '${timeFrameEnd}'`

    try {
      const pool = await poolPromise
      const response = await pool.query(query)
      if (response.err) {
        console.log(err)
        return
      }
      return response.recordset.map(obj => { return obj.table_id })
    } catch(err) {
      console.log(err)
      return
    }
  },

  getAvailableTables: async (args) => {

    const query =  args.bookedIds.length ? `SELECT  * from dining_capacity WHERE table_id NOT IN (${args.bookedIds}) AND max_seat_count >= ${args.guestCount }` : `SELECT  * from dining_capacity WHERE max_seat_count >= ${args.guestCount }`

    try {
      const pool = await poolPromise
      const response = await pool.query(query)
      if (response.err) {
        console.log(err)
        return
      }
      return response.recordset.map(obj => { return obj.table_id })
    } catch(err) {
      console.log(err)
      return
    }
  },
  
  createDiningReservation: async (dataObj, callback) => {
    const bookedTables = await ReservationService.getBookedTables(dataObj)
    const availableTables = await ReservationService.getAvailableTables({ bookedIds: bookedTables, guestCount: dataObj.guestCount })

    if (availableTables?.length) {
      try {
        const pool = await poolPromise
        await pool.request()
          .input('table_id', sql.Int, availableTables[0])
          .input('first_name', sql.VarChar(30), dataObj.firstName)
          .input('last_name', sql.VarChar(30), dataObj.lastName)
          .input('email', sql.VarChar(40), dataObj.email)
          .input('phone', sql.VarChar(15), dataObj.phone)
          .input('res_time', sql.SmallDateTime, dataObj.resTime)
          .input('duration', sql.Time(7), dataObj.duration)
          .input('guest_count', sql.Int, dataObj.guestCount)
          .query('INSERT INTO dining_reservations (table_id, first_name, last_name, email, phone, res_time, duration, guest_count) VALUES (@table_id, @first_name, @last_name, @email, @phone, @res_time, @duration, @guest_count)', (err, data) => {
            return callback(err, data)
          })
      } catch(err) {
        return callback(err)
      }
    } else {
      return callback('No tables available at this time.')
    }
  },

  deleteDiningReservation: async (id, callback) => {
    if (!id) {
      return callback('Reservation ID needed to perform deletion.')
    }
    const currentReservation = await ReservationService.getReservation({ table: 'dining_reservations', id: id })
    if (!currentReservation) {
      return callback('No reservation found.')
    }

    try {
      const pool = await poolPromise
      await pool.request()
        .query(`DELETE from dining_reservations WHERE id=${id}`, (err, data) => {
          return callback(err, data)
      })
    } catch(err) {
      return callback(err)
    }
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

    let set = 'SET'
    for (const [key, value] of Object.entries(dataObj)) {
      if (key !== 'id') {
        const isInt = key === 'tableId' || key === 'guestCount'
        set += isInt ? ` ${mapParamToColumn[key]} = ${value},` : ` ${mapParamToColumn[key]} = '${value}',`
      }
    }
    const trimmedSetStatement = set.replace(/(^,)|(,$)/g, "") 
    const query = `UPDATE dining_reservations ${trimmedSetStatement} WHERE id=${id}`

    try {
      const pool = await poolPromise
      await pool.request()
        .input('table_id', sql.Int, dataObj.tableId)
        .input('first_name', sql.VarChar(30), dataObj.firstName)
        .input('last_name', sql.VarChar(30), dataObj.lastName)
        .input('email', sql.VarChar(40), dataObj.email)
        .input('phone', sql.VarChar(15), dataObj.phone)
        .input('res_time', sql.SmallDateTime, dataObj.resTime)
        .input('duration', sql.Time(7), dataObj.duration)
        .input('guest_count', sql.Int, dataObj.guestCount)
        .query(query, (err, data) => {
          return callback(err, data)
        })
    } catch(err) {
      return callback(err)
    }
  },
}

module.exports = ReservationService

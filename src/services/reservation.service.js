const { sql, poolPromise } = require('../../dbconnection');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc)

const ReservationService = {
  getReservations: async (table, callback) => {
    try {
      const pool = await poolPromise
      await pool.request()
        .query(`select * from ${table}`, (err, data) => {
          return callback(err, data)
        })
    } catch(err) {
      return callback(err)
    }
  },

  getEvent: async (id) => {
    try {
      const pool = await poolPromise
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * from special_events WHERE id = @id')
      return {
        error: result.err, 
        data: result.data?.recordset[0]
      }
    } catch(err) {
      return {
        error: err
      }
    }
  },

  getEventCapacity: async (id) => {
    const event = await ReservationService.getEvent(id)
    if (event.error) {
      return {
        error: event.error
      }
    }
    if (!event.data) {
      return {
        error: 'No such event found'
      }
    }
    try {
      const pool = await poolPromise
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`SELECT * from event_reservations WHERE event_id = @id`)
      const capacity = result.recordset ? event.capacity - result.recordset.length : event.capacity
      return {
        error: result.err, 
        data: capacity
      }
    } catch(err) {
      return {
        error: err
      }
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
        .query('INSERT INTO event_reservations (event_id, first_name, last_name, email, phone, res_time) VALUES (@event_id, @first_name, @last_name, @email, @phone, @res_time)', (err, data) => {
          return callback(err, data)
        })
    } catch(err) {
      return callback(err)
    }
  },

  getSpaSchedule: async (callback) => {
    try {
      const pool = await poolPromise
      pool.request()
        .query('SELECT * from spa_schedule', (err, data) => {
          return callback(err, data)
        })
    } catch(err) {
      return callback(err)
    }
  },

  getTherapistSchedule: async (args) => {
    const day = dayjs(args.resStartTime).day()
    try {
      const pool = await poolPromise
      const result = await pool.request()
        .input('id', sql.Int, args.therapistId)
        .query(`SELECT * from spa_schedule WHERE therapist = @id AND day_of_week=${day}`)
      const data = result.recordset ? result.recordset.map(record => {
        return {
          startTime: record.start_time,
          endTime: record.end_time
        }
      }) : null
      return {
        error: result.err, 
        data: data
      }
    } catch(err) {
      return {
        error: err
      }
    }
  },

  checkAvailability: async (args) => {
    const therapistSchedule = await ReservationService.getTherapistSchedule(args)

    if (therapistSchedule.error) {
      return { error: error }
    }

    const schedule = therapistSchedule.data
    if (!schedule.length) {
      return { error: 'No availability for this therapist' }
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
      return { error: 'No availability for this therapist' }
    }

    try {
      const startTimeDayJS = dayjs(args.resStartTime).utcOffset(0)
      const endTimeDayJS = dayjs(args.resEndTime).utcOffset(0)
      const timeFrameBegin = startTimeDayJS.subtract(15, 'minute').format('YYYY-MM-DDTHH:mm:ss')
      const timeFrameEnd = endTimeDayJS.add(15, 'minute').format('YYYY-MM-DDTHH:mm:ss')
      const pool = await poolPromise
      const result = await pool.request()
        .input('id', sql.Int, args.therapistId)
        .query(`SELECT * from spa_reservations WHERE (therapist_id = @id) AND ((res_start_time BETWEEN '${timeFrameBegin}' AND '${timeFrameEnd}') OR (res_end_time BETWEEN '${timeFrameBegin}' AND '${timeFrameEnd}'))`)
      const hasAvailability = result.data?.recordset.length ? 0 : 1
      return { result: hasAvailability }
    } catch(err) {
      return { error: err}
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

  getBookedTables: async (dataObj) => {
    const timeFrameBegin = dayjs(dataObj.resTime).subtract(90, 'minute').toISOString()
    const timeFrameEnd = dayjs(dataObj.resTime).add(90, 'minute').toISOString()
    try {
      const pool = await poolPromise
      const result = await pool.request()
        .query(`SELECT  table_id from dining_reservations WHERE res_time > '${timeFrameBegin}' AND res_time < '${timeFrameEnd}'`)
      return {
        error: result.err,
        data: result.recordset?.map(obj => { return obj.table_id })
      }
    } catch(err) {
      return { error: err }
    }
  },

  getAvailableTables: async (args) => {
    try {
      const pool = await poolPromise
      const query =  args.bookedIds.length ? `SELECT  * from dining_capacity WHERE table_id NOT IN (${args.bookedIds}) AND max_seat_count >= ${args.guestCount }` : `SELECT  * from dining_capacity WHERE max_seat_count >= ${args.guestCount }`
      const result = await pool.request()
        .query(query)
      return {
        error: result.err, 
        data: result.recordset?.map(obj => { return obj.table_id })
      }
    } catch(err) {
      return {
        error: err
      }
    }
  },
  
  createDiningReservation: async (dataObj, callback) => {
    const bookedTables = await ReservationService.getBookedTables(dataObj)
    const availableTables = await ReservationService.getAvailableTables({ bookedIds: bookedTables.data, guestCount: dataObj.guestCount })

    if (!availableTables.data?.length) {
      return callback('No tables available for this timeframe')
    }

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
  }
}

module.exports = ReservationService
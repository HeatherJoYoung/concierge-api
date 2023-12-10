const { sql, poolPromise } = require('../../dbconnection')

const SpaService = {
  getAllServices: async (callback) => {
    try {
      const pool = await poolPromise
      await pool.request()
        .query('select * from spa_services', (err, data) => {
          return callback(err, data)
        })
    } catch(err) {
      return callback(err)
    }
  },
  
  createService: async (title, descript, callback) => {
    try {
      const pool = await poolPromise
      await pool.request()
        .input('title', sql.VarChar(30), title)
        .input('descript', sql.VarChar(200), descript)
        .query('INSERT INTO spa_services (title, descript) VALUES (@title, @descript);', (err, data) => {
          return callback(err, data)
        })
    } catch(err) {
      return callback(err)
    }
  },
  
  deleteService: async (id, callback) => {
    try {
      const pool = await poolPromise
      await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM spa_services WHERE id = @id', (err, data) => {
          return callback(err, data)
        })
    } catch(err) {
      return callback(err)
    }
  },
  
  deleteTherapistFromSchedule: async (id) => {
    try {
      const pool = await poolPromise
      await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM spa_schedule WHERE therapist = @id', (err, data) => {
          if (err) {
            console.log(err)
          }
          return data.rowsAffected
        })
    } catch(err) {
      console.log(err)
    }
  },

  deleteTherapistFromSkills: async (id) => {
    try {
      const pool = await poolPromise
      await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM therapist_skills WHERE therapist_id = @id', (err, data) => {
          if (err) {
            console.log(err)
          }
          return data.rowsAffected
        })
    } catch(err) {
      console.log(err)
    }
  },
  
  getAllTherapists: async (callback) => {
    try {
      const pool = await poolPromise
      await pool.request()
        .query('select * from therapists', (err, data) => {
          return callback(err, data);
        });
    } catch(err) {
      return callback(err)
    }
  },
  
  createTherapist: async (dataObj, callback) => {
    try {
      const pool = await poolPromise
      await pool.request()
        .input('firstName', sql.VarChar(20), dataObj.firstName)
        .input('lastName', sql.VarChar(40), dataObj.lastName)
        .input('email', sql.VarChar(40), dataObj.email)
        .input('phone', sql.VarChar(12), dataObj.phone)
        .query('INSERT INTO therapists (first_name, last_name, email, phone) VALUES (@firstName, @lastName, @email, @phone);', (err, data) => {
            return callback(err, data);
        });
    } catch(err) {
      return callback(err)
    }
  },
  
  deleteTherapist: async (id, callback) => {
    await SpaService.deleteTherapistFromSchedule(id)
    await SpaService.deleteTherapistFromSkills(id)
    try {
      const pool = await poolPromise
      await pool.request()
        .input('id', sql.Int, id)
        .query(`DELETE FROM therapists WHERE id = @id`, (err, data) => {
          return callback(err, data)
      })
    } catch(err) {
      return callback(err, data)
    }
  }
}

module.exports = SpaService

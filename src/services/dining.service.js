const { poolPromise } = require('../../dbconnection');

exports.getAllDiningCapacity = async (callback) => {
  try {
    const pool = await poolPromise
    await pool.request()
      .query('SELECT * FROM dining_capacity', (err, data) => {
        return callback(err, data)
      })
  } catch(err) {
    return callback(err)
  }
}
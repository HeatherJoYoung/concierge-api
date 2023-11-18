const { poolPromise } = require('../../dbconnection');

exports.getAllUsers = async (callback) => {
  try {
    const pool = await poolPromise
    await pool.request()
      .query('select * from users', (err, data) => {
        return callback(err, data)
      })
  } catch(err) {
    return callback(err)
  }
}
const { sql, poolPromise } = require('../../dbconnection');

exports.getAllServices = async (callback) => {
  try {
    const pool = await poolPromise
    await pool.request()
      .query('select * from spa_services', (err, data) => {
        return callback(err, data)
      })
  } catch(err) {
    return callback(err)
  }
}

exports.createService =  async (title, descript, callback) => {
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
}

exports.deleteService = async (id, callback) => {
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
}
const { sql, poolPromise } = require('../../dbconnection')

class LoginService {
  async authenticateUser(args, callback) {
    const query = `SELECT * FROM users WHERE email = '${args.email}' AND pass = '${args.password}'`
    try {
      const pool = await poolPromise
      await pool.request()
        .input('email', sql.VarChar(40), args.email)
        .input('pass', sql.VarChar(30), args.pass)
        .query(query, (err, data) => {
          const result = data?.recordset?.length > 0 ? true : false
          return callback(err, result)
        })
    } catch(err) {
      return callback(err)
    }
  }
}

module.exports = new LoginService();
const { sql, poolPromise } = require('../../dbconnection')

class LoginService {
  async authenticateUser(args, callback) {
    const table = args.isEmployee ? 'employees' : 'guests'
    const query = `SELECT * FROM ${table} WHERE email = '${args.email}' AND password = '${args.password}'`
    try {
      const pool = await poolPromise
      await pool.request()
        .input('email', sql.VarChar(40), args.email)
        .input('password', sql.VarChar(30), args.pass)
        .query(query, (err, data) => {
          const result = data?.recordset?.[0]
          return callback(err, result)
        })
    } catch(err) {
      return callback(err)
    }
  }
}

module.exports = new LoginService();
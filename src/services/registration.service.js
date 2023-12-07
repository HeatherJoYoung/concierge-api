const { sql, poolPromise } = require('../../dbconnection')

async function getUser(email, table) {
  try {
    const pool = await poolPromise
    const result = await pool.request()
      .input('email', sql.VarChar(40), email)
      .query(`SELECT COUNT(email) AS emailCount FROM ${table} WHERE email = @email`)
    return {
      error: result.error,
      data: result.recordset?.[0].emailCount
    }
  } catch(err) {
    return { 
      error: err
    }
  }
}

exports.createGuestUser = async (user, callback) => {
  const userExists = await getUser(user.email, 'guests')
  if (userExists.error) {
    return callback('Problem connecting to database')
  }
  if (userExists.data) {
    return callback('User with this email already exists')
  }
  try {
    const pool = await poolPromise
    await pool.request()
      .input('first_name', sql.VarChar(40), user.firstName)
      .input('last_name', sql.VarChar(40), user.lastName)
      .input('email', sql.VarChar(40), user.email)
      .input('password', sql.VarChar(40), user.password)
      .query('INSERT INTO guests (first_name, last_name, email, password) VALUES (@first_name, @last_name, @email, @password)', (err, data) => {
        return callback(err, data)
      })
  } catch(err) {
    return callback(err)
  }
}

exports.createEmployeeUser = async (user, callback) => {
  const userExists = await getUser(user.email, 'employees')
  if (userExists.error) {
    return callback('Problem connecting to database')
  }
  if (userExists.data) {
    return callback('User with this email already exists')
  }
  // Create a new employee user
  const createUserQuery = `
      INSERT INTO employees (first_name, last_name, email, password, is_admin, is_manager, dept)
      VALUES (@first_name, @last_name, @email, @password, @is_admin, @is_manager, @dept)
  `;
  try {
    const pool = await poolPromise
    await pool.request()
      .input('first_name', sql.VarChar(40), user.firstName)
      .input('last_name', sql.VarChar(40), user.lastName)
      .input('email', sql.VarChar(40), user.email)
      .input('password', sql.VarChar(40), user.password)
      .input('is_admin', sql.Bit, user.isAdmin ? 1 : 0)
      .input('is_manager', sql.Bit, user.isManager ? 1 : 0)
      .input('dept', sql.VarChar(60), user.dept)
      .query(createUserQuery, (err, data) => {
        return callback(err, data)
      })
  } catch(err) {
    return callback(err)
  }
}

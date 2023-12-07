const sql = require('mssql');
const config = {
  user: 'sa',
  password: 'sa',
  server: 'localhost',
  database: 'Demo',
  port: 1433,
  trustServerCertificate: true,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
}

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then( pool => {
    console.log('Connected to MSSQL')
    return pool
  })
  .catch(error => console.log('Database connection failed: ', error))

module.exports = { sql, poolPromise }

const sql = require('mssql');

class LoginService {
  async authenticateUser(email, pass) {
    const config = {
      user: 'sa',
      password: 'sa',
      server: 'localhost',
      database: 'Demo',
      trustServerCertificate: true,
    };

    return new Promise((resolve, reject) => {
      sql.connect(config, (err) => {
          if (err) {
              console.error('SQL connection error:', err);
              reject(err);
              return;
          }

          const request = new sql.Request();
          const query = `SELECT * FROM users WHERE email = '${email}' AND pass = '${pass}'`;

          request.query(query, (err, data) => {
              if (err) {
                  console.error('SQL query error:', err);
                  reject(err);
                  return;
              }

              if (data.recordset.length > 0) {
                  console.log('User authenticated:', email);
                  resolve(true);
              } else {
                  console.log('User not found or authentication failed:', email);
                  resolve(false);
              }
          });
      });
    });
  }
}

module.exports = new LoginService();
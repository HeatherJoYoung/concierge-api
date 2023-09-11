const mssql = require('mssql');
class DBConnection {
  async getConnection() {
    try {
      return await mssql.connect({
        user: 'sa',
        password: 'sa',
        server: '',
        database: 'Demo',
        port: 1433
      });
    }
    catch (error) {
      console.log(error);
    }
  }
}
module.exports = new DBConnection();

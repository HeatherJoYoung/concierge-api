// const db = require("../dbconnection");
const sql = require('mssql');

const config = {
  user: 'sa',
  password: 'sa',
  server: 'localhost',
  database: 'Demo',
  trustServerCertificate: true
}

const SpaService = {
  getAllServices: (callback) => {
    sql.connect(config, (err) => {
      if (err) {
        return callback(err);
      }
      const request = new sql.Request();
      request.query('select * from spa_services', (err, data) => {
        return callback(err, data);
      });
    })
  },
  
  createService: (title, descript, callback) => {
    sql.connect(config, (err) => {
      if(err){
        return callback(err);
      }
      const request = new sql.Request();
      request.input('title', sql.VarChar(30), title);
      request.input('descript', sql.VarChar(200), descript);
  
      request.query(
        'INSERT INTO spa_services (title, descript) VALUES (@title, @descript);', (err, data) => {
            return callback(err, data);
        });
    })
  },
  
  deleteService: (id, callback) => {
    sql.connect(config, (err) => {
      if(err){
        return callback(err);
      }
      const request = new sql.Request();
      request.input('id', sql.Int, id);
      request.query(
        'DELETE FROM spa_services WHERE id = @id', (err, data) => {
          return callback(err, data);
      });
    })
  },
  
  deleteTherapistFromSchedule: async (id) => {
    return new Promise(function(resolve, reject) {
      sql.connect(config, (err) => {
        if(err) {
          return reject(err)
        }
        const request = new sql.Request()
        request.input('id', sql.Int, id);
        const query = 'DELETE FROM spa_schedule WHERE therapist = @id'
        request.query(query, (err, data) => {
          if (err) {
            return reject(err)
          }
          resolve(data.rowsAffected)
        })
      })
    })
  },

  deleteTherapistFromSkills: async (id) => {
    return new Promise(function(resolve, reject) {
      sql.connect(config, (err) => {
        if(err) {
          return reject(err)
        }
        const request = new sql.Request()
        request.input('id', sql.Int, id);
        const query = 'DELETE FROM therapist_skills WHERE therapist_id = @id'
        request.query(query, (err, data) => {
          if (err) {
            return reject(err)
          }
          resolve(data.rowsAffected)
        })
      })
    })
  },
  
  getAllTherapists: (callback) => {
    sql.connect(config, (err) => {
      if (err) {
        return callback(err);
      }
      const request = new sql.Request();
      request.query('select * from therapists', (err, data) => {
        return callback(err, data);
      });
    })
  },
  
  createTherapist: (dataObj, callback) => {
    sql.connect(config, (err) => {
      if(err){
        return callback(err);
      }
      const request = new sql.Request();
      request.input('firstName', sql.VarChar(20), dataObj.firstName);
      request.input('lastName', sql.VarChar(40), dataObj.lastName);
      request.input('email', sql.VarChar(40), dataObj.email);
      request.input('phone', sql.VarChar(12), dataObj.phone);
  
      request.query(
        'INSERT INTO therapists (first_name, last_name, email, phone) VALUES (@firstName, @lastName, @email, @phone);', (err, data) => {
            return callback(err, data);
        });
    })
  },
  
  deleteTherapist: async (id, callback) => {
    await SpaService.deleteTherapistFromSchedule(id)
    await SpaService.deleteTherapistFromSkills(id)
    sql.connect(config, (err) => {
      if(err){
        return callback(err);
      }

      const request = new sql.Request();
      request.input('id', sql.Int, id);
      request.query(
        `DELETE FROM therapists WHERE id = @id`, (err, data) => {
          return callback(err, data);
      });
    })
  }
}

module.exports = SpaService

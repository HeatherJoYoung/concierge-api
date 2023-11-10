const sql = require('mssql');

const config = {
    user: 'sa',
    password: 'sa',
    server: 'localhost',
    database: 'Demo',
    trustServerCertificate: true
}

exports.createGuestUser = (user, callback) => {
    sql.connect(config, (err) => {
        if (err) {
            return callback(err);
        }
        // Check if the email already exists
        const request = new sql.Request();
        request.input('email', sql.VarChar(40), user.email);
        request.query('SELECT COUNT(*) AS emailCount FROM guests WHERE email = @email', (err, result) => {
            if (err) {
                sql.close();
                return callback(err);
            }

            if (result.recordset[0].emailCount > 0) {
                sql.close();
                return callback('Email already exists');
            } else {
                const request2 = new sql.Request();
                request2.input('first_name', sql.VarChar(40), user.firstName);
                request2.input('last_name', sql.VarChar(40), user.lastName);
                request2.input('email', sql.VarChar(40), user.email);
                request2.input('password', sql.VarChar(40), user.password);
                request2.query('INSERT INTO guests (first_name, last_name, email, password) VALUES (@first_name, @last_name, @email, @password)', (err, data) => {
                    sql.close();
                    return callback(err, data);
                });
            }
        });
    });
}

exports.createEmployeeUser = (user, callback) => {
    sql.connect(config, (err) => {
        if (err) {
            return callback(err);
        }

        // Check if the email already exists
        const checkEmailQuery = 'SELECT COUNT(*) AS emailCount FROM employees WHERE email = @email';
        const request = new sql.Request();
        request.input('email', sql.VarChar(255), user.email);
        request.query(checkEmailQuery, (err, result) => {
            if (err) {
                sql.close();
                return callback(err);
            }

            if (result.recordset[0].emailCount > 0) {
                sql.close();
                return callback('Email already exists');
            } else {
                // Create a new employee user
                const createUserQuery = `
                    INSERT INTO employees (first_name, last_name, email, password, is_admin, is_manager, dept)
                    VALUES (@first_name, @last_name, @email, @password, @is_admin, @is_manager, @dept)
                `;
                const request2 = new sql.Request();
                request2.input('first_name', sql.VarChar(40), user.firstName);
                request2.input('last_name', sql.VarChar(40), user.lastName);
                request2.input('email', sql.VarChar(40), user.email);
                request2.input('password', sql.VarChar(40), user.password);
                request2.input('is_admin', sql.Bit, user.isAdmin ? 1 : 0);
                request2.input('is_manager', sql.Bit, user.isManager ? 1 : 0);
                request2.input('dept', sql.VarChar(60), user.dept);
                request2.query(createUserQuery, (err, data) => {
                    sql.close();
                    return callback(err, data);
                });
            }
        });
    });
}
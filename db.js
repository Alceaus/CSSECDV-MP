const mysql = require('mysql2');
const fs = require('fs');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.PORT,
    ssl: {
        ca: fs.readFileSync(process.env.SSL_CA)
      },
});

db.connect((err) => {
    if (err) {
        console.error('Connection to MySQL failed: ', err.code, err.fatal ? 'FATAL' : 'NOT FATAL');
        console.error(err.message);
    } else {
        console.log('Connected to database');
    }
});

module.exports = db;
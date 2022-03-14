const mysql = require('mysql2');
require('dotenv').config();

// Connect to database
const db = mysql.createConnection(
  {
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
  },
  console.log('Connected to the election database.')
);

module.exports = db;

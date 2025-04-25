const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'sua_senha',
  database: 'MovieMania'
});

module.exports = db;

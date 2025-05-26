const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '2904',
  database: 'moviemania',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Conexão com o banco de dados MariaDB estabelecida com sucesso!');
    connection.release();
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error.message);
    process.exit(1);
  }
}

testConnection();

module.exports = pool;
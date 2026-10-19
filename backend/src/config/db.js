const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'root',
  database: process.env.DB_NAME || 'briefcase',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
  dateStrings: true
});

// Test connection on module initialization
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL Database:', process.env.DB_NAME || 'briefcase');
    connection.release();
    return true;
  } catch (error) {
    console.warn('⚠️  MySQL Connection Notice:', error.message);
    console.warn('   Ensure MySQL80 service is running and credentials in backend/.env match.');
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const baseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  database: process.env.DB_NAME || 'briefcase',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
  dateStrings: true
};

// 1. Admin Pool (briefcase_app) - Full DML and EXECUTE
const adminPool = mysql.createPool({
  ...baseConfig,
  user: process.env.DB_ADMIN_USER || 'briefcase_app',
  password: process.env.DB_ADMIN_PASSWORD || 'AppService@2026'
});

// 2. Lawyer Pool (briefcase_lawyer) - View SELECTs and role write procedures
const lawyerPool = mysql.createPool({
  ...baseConfig,
  user: process.env.DB_LAWYER_USER || 'briefcase_lawyer',
  password: process.env.DB_LAWYER_PASSWORD || 'LawyerSvc@2026'
});

// 3. Staff / Assistant Pool (briefcase_staff) - View SELECTs and assistant procedures
const staffPool = mysql.createPool({
  ...baseConfig,
  user: process.env.DB_STAFF_USER || 'briefcase_staff',
  password: process.env.DB_STAFF_PASSWORD || 'StaffSvc@2026'
});

// 4. Auth Pool (briefcase_auth) - Strictly EXECUTE on RegisterUser and GetUserByEmail
const authPool = mysql.createPool({
  ...baseConfig,
  user: process.env.DB_AUTH_USER || 'briefcase_auth',
  password: process.env.DB_AUTH_PASSWORD || 'AuthSvc@2026'
});

const pools = {
  admin: adminPool,
  lawyer: lawyerPool,
  staff: staffPool,
  auth: authPool
};

// Verify all four connection pools
async function testConnections() {
  const status = {};
  for (const [name, p] of Object.entries(pools)) {
    try {
      const conn = await p.getConnection();
      conn.release();
      status[name] = true;
    } catch (err) {
      console.warn(`⚠️ Warning: Connection test failed for role pool '${name}':`, err.message);
      status[name] = false;
    }
  }
  const allOk = Object.values(status).every(Boolean);
  if (allOk) {
    console.log('✅ Connected to MySQL Database (All 4 Role Pools Verified)');
  }
  return allOk;
}

module.exports = {
  adminPool,
  lawyerPool,
  staffPool,
  authPool,
  pools,
  pool: adminPool,
  testConnection: testConnections,
  testConnections
};

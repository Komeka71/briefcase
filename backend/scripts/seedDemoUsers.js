const path = require('path');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const demoUsers = [
  {
    name: 'Senior Partner',
    email: 'admin@briefcase.in',
    password: 'Admin@2026',
    role: 'Admin',
    status: 'Active'
  },
  {
    name: 'Adv. Priya Patel',
    email: 'priya.patel@briefcase.law',
    password: 'Lawyer@2026',
    role: 'Lawyer',
    status: 'Active'
  },
  {
    name: 'Adv. Vikramaditya Desai',
    email: 'vikram.desai@briefcase.law',
    password: 'Lawyer@2026',
    role: 'Lawyer',
    status: 'Active'
  },
  {
    name: 'Chambers Assistant',
    email: 'assistant@briefcase.in',
    password: 'Assistant@2026',
    role: 'Assistant',
    status: 'Active'
  }
];

async function seedDemoUsers() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_ADMIN_USER || process.env.DB_USER || 'root',
    password: process.env.DB_ADMIN_PASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'briefcase'
  });

  try {
    console.log('--- Seeding Demo Users ---');
    for (const u of demoUsers) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(u.password, salt);

      // Check if user already exists
      const [existing] = await connection.query(
        'SELECT user_id FROM USERS WHERE LOWER(email) = LOWER(?)',
        [u.email]
      );

      if (existing.length > 0) {
        // Update credentials and role
        await connection.query(
          'UPDATE USERS SET name = ?, password_hash = ?, role = ?, status = ? WHERE user_id = ?',
          [u.name, passwordHash, u.role, u.status, existing[0].user_id]
        );
        console.log(`[UPDATED] User ${u.email} (${u.role}) ID: ${existing[0].user_id}`);
      } else {
        // Insert new user
        const [result] = await connection.query(
          'INSERT INTO USERS (name, email, password_hash, role, status, created_at) VALUES (?, LOWER(?), ?, ?, ?, NOW())',
          [u.name, u.email, passwordHash, u.role, u.status]
        );
        console.log(`[INSERTED] User ${u.email} (${u.role}) ID: ${result.insertId}`);
      }
    }
    console.log('--- Demo Users Seeding Completed Successfully ---');
  } catch (error) {
    console.error('Error seeding demo users:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  seedDemoUsers();
}

module.exports = { seedDemoUsers, demoUsers };

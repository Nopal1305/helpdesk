import 'dotenv/config';
import pool from './src/api/db.js';
import bcrypt from 'bcrypt';

async function seedAdmin() {
  try {
    const password = await bcrypt.hash('admin123', 10);
    const query = {
      text: `INSERT INTO users (full_name, email, password, role, department) 
             VALUES ($1, $2, $3, $4, $5) 
             ON CONFLICT (email) DO NOTHING
             RETURNING id, email`,
      values: ['Super Admin', 'admin@helpdesk.com', password, 'ADMIN', 'IT']
    };
    const res = await pool.query(query);
    if (res.rows.length > 0) {
      console.log('Admin created:', res.rows[0].email);
    } else {
      console.log('Admin already exists.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

seedAdmin();

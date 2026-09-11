const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function run() {
  try {
    const hashedPw = await bcrypt.hash('password123', 10);
    
    // Check if technicians exist
    const res = await pool.query("SELECT * FROM users WHERE role = 'it_staff'");
    if (res.rows.length === 0) {
        await pool.query('INSERT INTO users (full_name, email, password, role, specialization) VALUES ($1, $2, $3, $4, $5)', ['Teknisi Hardware', 'tech.hardware@example.com', hashedPw, 'it_staff', 'Hardware']);
        await pool.query('INSERT INTO users (full_name, email, password, role, specialization) VALUES ($1, $2, $3, $4, $5)', ['Teknisi Software', 'tech.software@example.com', hashedPw, 'it_staff', 'Software']);
        await pool.query('INSERT INTO users (full_name, email, password, role, specialization) VALUES ($1, $2, $3, $4, $5)', ['Teknisi Network', 'tech.network@example.com', hashedPw, 'it_staff', 'Network']);
        console.log('Seeded technicians');
    } else {
        console.log('Technicians already exist');
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();

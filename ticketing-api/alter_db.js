import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

async function main() {
  try {
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_otp VARCHAR;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_otp_expires TIMESTAMP;`);
    console.log("Columns added successfully");
  } catch (error) {
    console.error("Error adding columns:", error);
  } finally {
    pool.end();
  }
}

main();

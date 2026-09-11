import pool from './src/api/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tickets';");
  console.log(res.rows);
  process.exit(0);
}
run();

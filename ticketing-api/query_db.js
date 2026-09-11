import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD),
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

async function run() {
  const res1 = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tickets';");
  console.log("Tickets:", res1.rows);
  const res2 = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';");
  console.log("Users:", res2.rows);
  process.exit(0);
}
run();

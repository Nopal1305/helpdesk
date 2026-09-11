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
  try {
    await pool.query("ALTER TABLE tickets ADD COLUMN IF NOT EXISTS assignment_note TEXT;");
    console.log("Column assignment_note added.");
    await pool.query("ALTER TABLE tickets ADD COLUMN IF NOT EXISTS assigner_id INTEGER;");
    console.log("Column assigner_id added.");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();

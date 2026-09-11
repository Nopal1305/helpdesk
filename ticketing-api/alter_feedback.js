import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const alterTable = async () => {
    try {
        await pool.query(`
            ALTER TABLE tickets 
            ADD COLUMN IF NOT EXISTS rating INT,
            ADD COLUMN IF NOT EXISTS feedback_note TEXT;
        `);
        console.log("Successfully added rating and feedback_note columns to tickets table.");
    } catch (err) {
        console.error("Error altering table:", err);
    } finally {
        process.exit();
    }
}

alterTable();

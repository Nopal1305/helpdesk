require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function migrate() {
  try {
    console.log("Starting migration for assignment notes...");
    
    // Rename existing column
    await pool.query("ALTER TABLE tickets RENAME COLUMN assignment_note TO assignment_note_user;");
    console.log("Renamed 'assignment_note' to 'assignment_note_user'.");
    
    // Add new column
    await pool.query("ALTER TABLE tickets ADD COLUMN IF NOT EXISTS assignment_note_tech TEXT;");
    console.log("Added column 'assignment_note_tech'.");
    
    console.log("Migration completed successfully.");
  } catch (error) {
    if (error.code === '42703' && error.message.includes("column \"assignment_note\" does not exist")) {
        console.log("Column 'assignment_note' already renamed, skipping rename step...");
        try {
             await pool.query("ALTER TABLE tickets ADD COLUMN IF NOT EXISTS assignment_note_tech TEXT;");
             console.log("Ensured column 'assignment_note_tech' exists.");
        } catch(e) {
            console.error("Migration failed:", e.message);
        }
    } else {
        console.error("Migration failed:", error.message);
    }
  } finally {
    pool.end();
  }
}

migrate();

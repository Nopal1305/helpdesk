require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'ticketing_system',
  password: process.env.DB_PASSWORD || '12345',
  port: process.env.DB_PORT || 5432,
});

async function run() {
  try {
    const res = await pool.query('SELECT id, issue_image IS NOT NULL AS has_issue_image, resolution_image IS NOT NULL AS has_resolution_image, resolution_notes FROM tickets ORDER BY created_at DESC LIMIT 5');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();

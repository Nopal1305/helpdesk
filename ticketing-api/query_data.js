import 'dotenv/config';
import pool from './src/api/db.js';

pool.query("SELECT id, status, resolution_notes, length(resolution_image) as img_len FROM tickets")
  .then(res => {
    console.table(res.rows);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

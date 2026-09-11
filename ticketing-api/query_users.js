import 'dotenv/config';
import pool from './src/api/db.js';

pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'")
  .then(res => {
    console.table(res.rows);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

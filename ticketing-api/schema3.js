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

pool.query("SELECT column_name, data_type, character_maximum_length FROM information_schema.columns WHERE table_name = 'tickets'").then(res => {
    console.table(res.rows);
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});

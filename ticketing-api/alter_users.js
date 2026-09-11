import 'dotenv/config';
import pool from './src/api/db.js';

pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0").then(res => {
    console.log("Column added");
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});

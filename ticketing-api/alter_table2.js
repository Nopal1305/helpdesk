import 'dotenv/config';
import pool from './src/api/db.js';

const alterQuery = `
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS issue_image TEXT;
`;

pool.query(alterQuery)
  .then(res => {
    console.log('Column issue_image added successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

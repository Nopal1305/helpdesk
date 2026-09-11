import 'dotenv/config';
import pool from './src/api/db.js';

const alterQuery = `
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS in_progress_at TIMESTAMP WITHOUT TIME ZONE,
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITHOUT TIME ZONE;
`;

pool.query(alterQuery)
  .then(res => {
    console.log('Columns added successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

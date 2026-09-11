const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'helpdesk_db',
    password: '524078',
    port: 5432,
});

async function run() {
    try {
        await pool.query(`ALTER TYPE ticket_status ADD VALUE IF NOT EXISTS 'RE-OPENED';`);
        console.log("Successfully added 'RE-OPENED' to ticket_status ENUM.");
    } catch (error) {
        console.error("Error adding ENUM value:", error);
    } finally {
        pool.end();
    }
}

run();

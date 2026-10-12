import pg from 'pg';
import dotenv from 'dotenv';
const { Client } = pg;
dotenv.config();

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function alterTable() {
    try {
        await client.connect();

        console.log("Adding 'PENDING' to ticket_status ENUM...");
        try {
            await client.query(`ALTER TYPE ticket_status ADD VALUE 'PENDING';`);
            console.log("Successfully added 'PENDING' to ENUM.");
        } catch (e) {
            console.log("Note: 'PENDING' might already exist or error: ", e.message);
        }

        console.log("Adding 'REJECTED' to ticket_status ENUM...");
        try {
            await client.query(`ALTER TYPE ticket_status ADD VALUE 'REJECTED';`);
            console.log("Successfully added 'REJECTED' to ENUM.");
        } catch (e) {
            console.log("Note: 'REJECTED' might already exist or error: ", e.message);
        }

        console.log("Adding 'action_reason' column to tickets table...");
        try {
            await client.query(`ALTER TABLE tickets ADD COLUMN action_reason TEXT;`);
            console.log("Successfully added 'action_reason' column.");
        } catch (e) {
            console.log("Note: Column 'action_reason' might already exist or error: ", e.message);
        }

        console.log("Migration completed successfully.");

    } catch (err) {
        console.error("Error during migration:", err);
    } finally {
        await client.end();
    }
}

alterTable();

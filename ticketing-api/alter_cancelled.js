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

        // Catatan: kolom tickets.status bertipe VARCHAR tanpa CHECK constraint,
        // sehingga nilai 'CANCELLED' dapat langsung disimpan tanpa mengubah tipe data.

        console.log("Adding 'cancelled_at' column to tickets table...");
        try {
            await client.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITHOUT TIME ZONE;`);
            console.log("Successfully added 'cancelled_at' column.");
        } catch (e) {
            console.log("Note: Column 'cancelled_at' might already exist or error: ", e.message);
        }

        console.log("Migration completed successfully.");
    } catch (err) {
        console.error("Error during migration:", err);
    } finally {
        await client.end();
    }
}

alterTable();

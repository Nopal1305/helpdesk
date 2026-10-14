import pg from 'pg';

const { Pool } = pg;

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    }
  : {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {})
    };

const pool = new Pool(poolConfig);

pool.connect().catch((err) => {
  console.error('Database connection error:', err.message);
});

export default pool;
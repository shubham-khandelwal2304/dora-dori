import pg from 'pg';

const { Pool } = pg;

// Shared Postgres pool for serverless functions
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set!');
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const getTableName = () => process.env.MASTER_TABLE_NAME || 'inventory_data';

export default pool;



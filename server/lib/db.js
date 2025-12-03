import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables FIRST
dotenv.config({ path: join(__dirname, '../../.env.local') });
dotenv.config({ path: join(__dirname, '../../.env') });

// Use environment variable - DO NOT hardcode credentials!
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set!');
  console.error('Please set DATABASE_URL in your .env.local file or environment variables.');
}

// Log connection attempt (without password)
const urlForLog = DATABASE_URL.replace(/:([^:@]+)@/, ':****@');
console.log('Using database URL:', urlForLog);

console.log('Connecting to database...');
console.log('DATABASE_URL:', DATABASE_URL ? 'Set (hidden for security)' : 'NOT SET');

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Supabase
  },
});

// Test connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.message);
    console.error('Error code:', err.code);
  } else {
    console.log('Database connected successfully at', res.rows[0].now);
  }
});

export default pool;


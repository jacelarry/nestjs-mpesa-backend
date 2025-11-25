import { Pool } from 'pg';
import { env } from './env.js';

if (!env.DATABASE_URL) {
  console.warn('DATABASE_URL not set. Database operations will fail until configured.');
}

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  // ssl: { rejectUnauthorized: false } // uncomment if using managed services requiring SSL
});

export async function testConnection() {
  try {
    const res = await pool.query('SELECT 1');
    console.log('Database connection OK:', res.rows[0]);
  } catch (e) {
    console.error('Database connection failed:', e);
  }
}

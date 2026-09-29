import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || '707_activation_builder',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

let isDbConnected = false;

export async function testDbConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW()');
    client.release();
    isDbConnected = true;
    console.log('[DB] PostgreSQL connected successfully:', res.rows[0].now);
    return true;
  } catch (err: any) {
    isDbConnected = false;
    console.warn('[DB] PostgreSQL connection notice:', err.message);
    console.log('[DB] Running with hybrid fallback mode (API and memory storage active while PostgreSQL container synchronizes).');
    return false;
  }
}

export function getDbStatus() {
  return { isConnected: isDbConnected };
}

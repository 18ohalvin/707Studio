import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// DATABASE_URL wins when present: managed Postgres (Coolify, Supabase, RDS)
// hands out a connection string, and docker-compose already passes one. Before
// this the string was ignored, so the API quietly fell back to in-memory
// storage while looking like it had started correctly.
const connectionString = process.env.DATABASE_URL;

const needsSsl =
  !!connectionString &&
  (/sslmode=require/.test(connectionString) || process.env.POSTGRES_SSL === 'true');

export const pool = new Pool(
  connectionString
    ? {
        connectionString,
        ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      }
    : {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
        user: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'postgres',
        database: process.env.POSTGRES_DB || '707_activation_builder',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      }
);

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

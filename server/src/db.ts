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

export async function initDbSchema(): Promise<void> {
  try {
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS brands (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT DEFAULT '',
        logo_url TEXT DEFAULT '',
        primary_color VARCHAR(30) DEFAULT '#000000',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        phone VARCHAR(50) DEFAULT '',
        password VARCHAR(100) DEFAULT '',
        role VARCHAR(50) NOT NULL DEFAULT 'editor',
        assigned_brands JSONB NOT NULL DEFAULT '["all"]'::jsonb,
        avatar_url TEXT DEFAULT '',
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_active_at VARCHAR(100) DEFAULT 'Recently'
      );

      CREATE TABLE IF NOT EXISTS templates (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        slug VARCHAR(150) NOT NULL UNIQUE,
        description TEXT DEFAULT '',
        category VARCHAR(50) NOT NULL DEFAULT 'raffle',
        thumbnail_url TEXT DEFAULT '',
        widget_tree JSONB NOT NULL DEFAULT '[]'::jsonb,
        is_global_preset BOOLEAN DEFAULT TRUE,
        status VARCHAR(50) DEFAULT 'published',
        created_by VARCHAR(100) DEFAULT 'Superadmin',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS pages (
        id VARCHAR(100) PRIMARY KEY,
        brand_id VARCHAR(100),
        brand_slug VARCHAR(100) NOT NULL DEFAULT 'atmos',
        title VARCHAR(200) NOT NULL,
        slug VARCHAR(150) NOT NULL,
        description TEXT DEFAULT '',
        status VARCHAR(50) NOT NULL DEFAULT 'draft',
        current_version INT NOT NULL DEFAULT 1,
        widget_tree JSONB NOT NULL DEFAULT '[]'::jsonb,
        pages JSONB DEFAULT '[]'::jsonb,
        page_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
        published_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS submissions (
        id VARCHAR(100) PRIMARY KEY,
        page_id VARCHAR(100) NOT NULL,
        brand_slug VARCHAR(100) NOT NULL DEFAULT 'atmos',
        submission_type VARCHAR(50) NOT NULL DEFAULT 'raffle',
        form_data JSONB NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        status VARCHAR(50) DEFAULT 'submitted',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[DB] Database schema initialized and verified successfully.');
  } catch (err: any) {
    console.error('[DB] Error initializing database schema:', err.message);
  }
}

export async function testDbConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW()');
    client.release();
    isDbConnected = true;
    console.log('[DB] PostgreSQL connected successfully:', res.rows[0].now);
    await initDbSchema();
    return true;
  } catch (err: any) {
    isDbConnected = false;
    console.warn('[DB] PostgreSQL connection notice:', err.message);
    console.log('[DB] Running with standalone memory mode (clean fresh state).');
    return false;
  }
}

export function getDbStatus() {
  return { isConnected: isDbConnected };
}

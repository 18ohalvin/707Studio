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
        owner_id VARCHAR(100),
        owner_email VARCHAR(150),
        created_by VARCHAR(150),
        published_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- The first release created these tables with uuid primary keys, but the
      -- application generates readable string ids ("proj-1759...", "page-..."),
      -- so every insert failed with 'invalid input syntax for type uuid'.
      -- CREATE TABLE IF NOT EXISTS cannot change an existing column's type, so
      -- convert any leftover uuid column to text. Idempotent: the loop finds
      -- nothing once the database is already the right shape.
      DO $$
      DECLARE col record;
      BEGIN
        FOR col IN
          SELECT table_name, column_name
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND data_type = 'uuid'
            AND table_name IN ('pages', 'brands', 'templates', 'submissions', 'page_revisions', 'users')
        LOOP
          EXECUTE format('ALTER TABLE %I ALTER COLUMN %I DROP DEFAULT', col.table_name, col.column_name);
          EXECUTE format('ALTER TABLE %I ALTER COLUMN %I TYPE VARCHAR(100) USING %I::text',
                         col.table_name, col.column_name, col.column_name);
        END LOOP;
      END $$;

      -- CREATE TABLE IF NOT EXISTS does nothing when the table already exists,
      -- so it never adds columns to a database created by an earlier schema.
      -- Every column added after the first release needs its own ALTER here or
      -- the live database silently keeps the old shape. Missing brand_slug and
      -- pages is exactly what broke saving: each INSERT failed with
      -- 'column "brand_slug" does not exist' while the API still answered 200.
      ALTER TABLE pages ADD COLUMN IF NOT EXISTS brand_slug VARCHAR(100) NOT NULL DEFAULT 'atmos';
      ALTER TABLE pages ADD COLUMN IF NOT EXISTS pages JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE pages ADD COLUMN IF NOT EXISTS owner_id VARCHAR(100);
      ALTER TABLE pages ADD COLUMN IF NOT EXISTS owner_email VARCHAR(150);
      ALTER TABLE pages ADD COLUMN IF NOT EXISTS created_by VARCHAR(150);
      ALTER TABLE pages ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

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

let reconnectTimer: NodeJS.Timeout | null = null;

// Handle idle client errors without crashing the process
pool.on('error', (err) => {
  console.warn('[DB Pool] Unexpected error on idle client:', err.message);
  isDbConnected = false;
  scheduleReconnect(5000);
});

export function scheduleReconnect(delayMs = 5000) {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    await testDbConnection();
  }, delayMs);
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
    console.warn('[DB] PostgreSQL connection notice:', err.message || err.code || 'Unreachable');
    console.log('[DB] Running with standalone memory mode (clean fresh state). Auto-retry scheduled...');
    scheduleReconnect(5000);
    return false;
  }
}

export function getDbStatus() {
  return { isConnected: isDbConnected };
}

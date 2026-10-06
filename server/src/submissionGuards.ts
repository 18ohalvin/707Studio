import type { Pool, PoolClient } from 'pg';
import { readDataFile, archiveDataFile } from './fileStorage.js';
import { PLACEHOLDER_EMAIL, emailKeyOf } from './submissionHelpers.js';

/**
 * Database-level guarantees for guest entries, so that no number of
 * simultaneous registrations — from any server instance, old or new — can
 * produce two entries for the same person or two passes with the same code.
 *
 *  - email_key   normalised email; one entry per (campaign, email)
 *  - client_key  per-visit key from the guest's page; a retry or double tap
 *                is the same entry (covers forms that collect no email)
 *  - ticket_code unique, so two guests can never hold the same Access ID
 *  - duplicate_of  marks entries that already existed twice before these
 *                rules; they keep working at the door and are flagged for review
 *
 * Everything here only adds: no guest entry is changed beyond being flagged
 * and nothing is deleted.
 */

const EMAIL_INDEX = 'submissions_page_email_key_uq';
const CLIENT_INDEX = 'submissions_page_client_key_uq';
const TICKET_INDEX = 'submissions_ticket_code_uq';
const LIST_INDEX = 'submissions_page_created_idx';
const TRIGGER = 'submissions_fill_email_key_trg';
const COLUMNS = ['email_key', 'client_key', 'duplicate_of'];

async function inTransaction<T>(pool: Pool, work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Never wait indefinitely on a busy table: fail, and let the caller retry shortly.
    await client.query(`SET LOCAL lock_timeout = '8s'`);
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/** Columns the entry endpoint writes. Without them a registration cannot be stored at all. */
export async function ensureSubmissionColumns(pool: Pool): Promise<void> {
  const have = await pool.query(
    `SELECT column_name FROM information_schema.columns
      WHERE table_schema = current_schema() AND table_name = 'submissions' AND column_name = ANY($1)`,
    [COLUMNS]
  );
  if (have.rows.length === COLUMNS.length) return;
  await inTransaction(pool, async (client) => {
    await client.query(`
      ALTER TABLE submissions
        ADD COLUMN IF NOT EXISTS email_key VARCHAR(320),
        ADD COLUMN IF NOT EXISTS client_key VARCHAR(100),
        ADD COLUMN IF NOT EXISTS duplicate_of VARCHAR(100)
    `);
  });
}

/**
 * Backfill, de-duplicate and install the unique indexes and the trigger.
 * Done in one transaction that holds a table lock (reads continue, writes
 * wait for a few milliseconds), so nothing can slip in between the clean-up
 * and the index — including inserts from an older instance still running
 * during a rolling deploy.
 */
export async function installSubmissionGuards(pool: Pool): Promise<{ flagged: number; ticketCodeUnique: boolean }> {
  const idx = await pool.query(
    `SELECT indexname FROM pg_indexes WHERE schemaname = current_schema() AND tablename = 'submissions' AND indexname = ANY($1)`,
    [[EMAIL_INDEX, CLIENT_INDEX, TICKET_INDEX, LIST_INDEX]]
  );
  const trg = await pool.query(`SELECT 1 FROM pg_trigger WHERE tgname = $1 AND NOT tgisinternal`, [TRIGGER]);
  const present = new Set(idx.rows.map((r: any) => r.indexname));
  const requiredPresent = present.has(EMAIL_INDEX) && present.has(CLIENT_INDEX) && present.has(LIST_INDEX) && trg.rows.length > 0;
  if (requiredPresent) {
    if (present.has(TICKET_INDEX)) return { flagged: 0, ticketCodeUnique: true };
    // The Access ID rule is missing. Only worth another attempt once the clashing old entries are gone.
    if (await hasDuplicateTicketCodes(pool)) {
      warnTicketClash();
      return { flagged: 0, ticketCodeUnique: false };
    }
  }

  return inTransaction(pool, async (client) => {
    await client.query('LOCK TABLE submissions IN SHARE ROW EXCLUSIVE MODE');

    // 1. Every entry gets its normalised email (placeholder and empty ones stay NULL).
    await client.query(
      `UPDATE submissions
          SET email_key = LOWER(BTRIM(form_data->>'email'))
        WHERE email_key IS NULL AND duplicate_of IS NULL
          AND BTRIM(COALESCE(form_data->>'email', '')) <> ''
          AND LOWER(BTRIM(form_data->>'email')) <> $1`,
      [PLACEHOLDER_EMAIL]
    );

    // 2. Someone already registered twice? The first entry stays the "real" one; the rest are
    //    kept (their pass still works at the door) but flagged for review and set aside.
    const flagged = await client.query(`
      WITH ranked AS (
        SELECT id,
               FIRST_VALUE(id) OVER w AS keep_id,
               ROW_NUMBER() OVER w AS rn
          FROM submissions
         WHERE email_key IS NOT NULL
        WINDOW w AS (PARTITION BY page_id, email_key ORDER BY created_at NULLS LAST, id)
      )
      UPDATE submissions s
         SET email_key = NULL, duplicate_of = r.keep_id
        FROM ranked r
       WHERE s.id = r.id AND r.rn > 1
    `);

    // 3. The rules themselves.
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS ${EMAIL_INDEX} ON submissions (page_id, email_key) WHERE email_key IS NOT NULL`);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS ${CLIENT_INDEX} ON submissions (page_id, client_key) WHERE client_key IS NOT NULL`);
    await client.query(`CREATE INDEX IF NOT EXISTS ${LIST_INDEX} ON submissions (page_id, created_at DESC)`);

    // Two guests holding the same Access ID is worse than a missing index: if old data already
    // has such a pair, leave the index out (and say so) rather than fail the whole migration.
    let ticketCodeUnique = true;
    if (await hasDuplicateTicketCodes(client)) {
      ticketCodeUnique = false;
      warnTicketClash();
    } else {
      await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS ${TICKET_INDEX} ON submissions (ticket_code) WHERE ticket_code IS NOT NULL`);
    }

    // 4. Anything that inserts an entry without an email_key — an older server instance during
    //    a deploy, an import — still gets one, so the rules above cannot be bypassed.
    await client.query(`
      CREATE OR REPLACE FUNCTION submissions_fill_email_key() RETURNS trigger AS $fn$
      BEGIN
        IF NEW.email_key IS NULL AND NEW.duplicate_of IS NULL THEN
          NEW.email_key := NULLIF(LOWER(BTRIM(NEW.form_data->>'email')), '');
          IF NEW.email_key = '${PLACEHOLDER_EMAIL}' THEN NEW.email_key := NULL; END IF;
        END IF;
        RETURN NEW;
      END
      $fn$ LANGUAGE plpgsql
    `);
    await client.query(`DROP TRIGGER IF EXISTS ${TRIGGER} ON submissions`);
    await client.query(`CREATE TRIGGER ${TRIGGER} BEFORE INSERT ON submissions FOR EACH ROW EXECUTE PROCEDURE submissions_fill_email_key()`);

    const count = flagged.rowCount || 0;
    if (count > 0) {
      console.warn(`[DB] ${count} guest entr${count === 1 ? 'y was' : 'ies were'} already registered more than once. They are kept, flagged "duplicate" in the Guest Database, and excluded from raffles.`);
    }
    return { flagged: count, ticketCodeUnique };
  });
}

let warnedTicketClash = false;
function warnTicketClash() {
  // Said on every start (once per process): the rule is a safeguard the operator should know is off.
  if (warnedTicketClash) return;
  warnedTicketClash = true;
  console.warn('[DB] Some existing entries share an Access ID, so the unique Access ID rule was NOT installed. New passes still check for clashes in code. Resolve the shared Access IDs (see the Guest Database) and restart to install it.');
}

async function hasDuplicateTicketCodes(db: Pool | PoolClient): Promise<boolean> {
  const r = await db.query(`SELECT 1 FROM submissions WHERE ticket_code IS NOT NULL GROUP BY ticket_code HAVING COUNT(*) > 1 LIMIT 1`);
  return r.rows.length > 0;
}

/**
 * Entries that were written to submissions.json while the database was
 * unreachable (older versions fell back to a file nothing else reads) are
 * moved into the database once, so they show up in the Campaign Hub and their
 * Access IDs work at the door. The file is then set aside, not deleted.
 */
export async function importLegacySubmissions(pool: Pool): Promise<{ imported: number; flagged: number; skipped: number } | null> {
  const rows = readDataFile<any[]>('submissions.json', []);
  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  // Funnel-page ids → their project, so old entries land on the campaign they belong to.
  const projectByPage = new Map<string, { id: string; brand_slug: string }>();
  const projects = await pool.query('SELECT id, brand_slug, pages FROM pages');
  for (const p of projects.rows) {
    projectByPage.set(String(p.id), { id: String(p.id), brand_slug: p.brand_slug });
    let pages = p.pages;
    if (typeof pages === 'string') { try { pages = JSON.parse(pages); } catch { pages = []; } }
    if (Array.isArray(pages)) pages.forEach((pg: any) => pg?.id && projectByPage.set(String(pg.id), { id: String(p.id), brand_slug: p.brand_slug }));
  }

  const stats = { imported: 0, flagged: 0, skipped: 0 };
  await inTransaction(pool, async (client) => {
    await client.query('LOCK TABLE submissions IN SHARE ROW EXCLUSIVE MODE');
    for (const row of rows) {
      if (!row?.id) { stats.skipped++; continue; }
      const id = String(row.id);
      const form = typeof row.form_data === 'string' ? safeJson(row.form_data) : (row.form_data || {});
      const project = projectByPage.get(String(row.page_id));
      const pageId = project ? project.id : String(row.page_id || 'unknown');
      let emailKey = emailKeyOf(form.email);
      let duplicateOf: string | null = null;

      // The same person already has an entry in the database: keep this one too (the guest may
      // hold this pass), but flagged, so the unique rule is not tripped.
      if (emailKey) {
        const existing = await client.query(`SELECT id FROM submissions WHERE page_id = $1 AND email_key = $2 AND id <> $3 LIMIT 1`, [pageId, emailKey, id]);
        if (existing.rows[0]) {
          duplicateOf = existing.rows[0].id;
          emailKey = null;
        }
      }

      // One bad row must not sink the rest: each insert has its own savepoint.
      await client.query('SAVEPOINT legacy_row');
      let inserted;
      try {
        inserted = await client.query(
        `INSERT INTO submissions
           (id, page_id, brand_slug, submission_type, form_data, ticket_code, ip_address, user_agent, status,
            created_at, checked_in_at, checked_in_by, email_key, duplicate_of)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [
          id, pageId, project?.brand_slug || row.brand_slug || 'atmos', row.submission_type || 'raffle', JSON.stringify(form),
          row.ticket_code || null, row.ip_address || null, row.user_agent || '', row.status || 'registered',
          row.created_at || new Date().toISOString(), row.checked_in_at || null, row.checked_in_by || null, emailKey, duplicateOf
        ]
      );
        await client.query('RELEASE SAVEPOINT legacy_row');
      } catch (err: any) {
        await client.query('ROLLBACK TO SAVEPOINT legacy_row');
        stats.skipped++;
        console.warn(`[DB] Legacy entry ${id} could not be imported (${err.message}); it stays in the archived file.`);
        continue;
      }
      if (inserted.rows[0]) {
        stats.imported++;
        if (duplicateOf) stats.flagged++;
      } else {
        // Already imported (same id) or its Access ID clashes with an existing pass. The archived
        // file below keeps the original either way.
        stats.skipped++;
        console.warn(`[DB] Legacy entry ${id} was not imported (already present, or its Access ID ${row.ticket_code} is taken).`);
      }
    }
  });

  const archived = archiveDataFile('submissions.json', 'imported');
  console.log(`[DB] Moved ${stats.imported} entr${stats.imported === 1 ? 'y' : 'ies'} from submissions.json into the database (${stats.flagged} flagged as duplicates, ${stats.skipped} skipped). Original kept at ${archived}.`);
  return stats;
}

function safeJson(text: string): Record<string, any> {
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

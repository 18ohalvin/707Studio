// Integration test for guest-entry integrity: a real Postgres (started from the ORIGINAL schema.sql),
// the real API in production mode, and the failures that matter at an event — repeat registrations,
// hundreds of simultaneous taps, a database that stops and comes back, entries stranded in a file.
//
//   cd server && npm i --no-save embedded-postgres && node scripts/itest-submissions.mjs
//
// Takes about two minutes. Uses its own temporary data folders (never the real ones).
// Integration test for guest-entry integrity, against a real Postgres started from the ORIGINAL schema.sql.
import EmbeddedPostgres from 'embedded-postgres';
import pg from 'pg';
import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SP = path.resolve(process.argv[2] || path.join(os.tmpdir(), '707-itest-submissions'));
fs.mkdirSync(SP, { recursive: true });
const PORT_PG = 5544;
const PORT_API = 3917;
const API = `http://localhost:${PORT_API}`;
const DB_URL = `postgres://postgres:postgres@localhost:${PORT_PG}/activation`;
const DATA_DIR = path.join(SP, 'data');
const UPLOAD_DIR = path.join(SP, 'uploads');
const PASSWORD = 'itest-password-123';

let failures = 0;
let passes = 0;
function check(name, cond, detail = '') {
  if (cond) { passes++; console.log(`  ✓ ${name}`); }
  else { failures++; console.log(`  ✗ ${name}${detail ? '  → ' + detail : ''}`); }
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---------------- Preflight ---------------- */
// A server left over from an earlier run would answer the health check before the new one is up,
// and the test would quietly run against the wrong database.
for (const port of [PORT_API]) {
  try {
    await fetch(`http://localhost:${port}/api/health`);
    console.error(`Port ${port} is already in use — stop whatever is listening there and run again.`);
    process.exit(2);
  } catch { /* free */ }
}

/* ---------------- Postgres ---------------- */
fs.rmSync(path.join(SP, 'pgdata'), { recursive: true, force: true });
fs.rmSync(DATA_DIR, { recursive: true, force: true });
fs.rmSync(UPLOAD_DIR, { recursive: true, force: true });
fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const pgServer = new EmbeddedPostgres({ databaseDir: path.join(SP, 'pgdata'), user: 'postgres', password: 'postgres', port: PORT_PG, persistent: true });
await pgServer.initialise();
await pgServer.start();
await pgServer.createDatabase('activation');

const db = () => new pg.Client({ connectionString: DB_URL });
async function q(sql, params) {
  const c = db(); await c.connect();
  try { return await c.query(sql, params); } finally { await c.end(); }
}
// The first release's schema, exactly as docker-compose's initdb applied it.
await q(fs.readFileSync(`${REPO}/server/db/schema.sql`, 'utf8'));

/* ---------------- API server ---------------- */
let child = null;
let logFile = path.join(SP, 'server.log');
function startServer(extraEnv = {}, { production = true } = {}) {
  fs.appendFileSync(logFile, `\n===== start ${new Date().toISOString()} =====\n`);
  const out = fs.openSync(logFile, 'a');
  const env = {
    ...process.env, PORT: String(PORT_API), DATA_DIR, UPLOAD_DIR, STUDIO_PASSWORD: PASSWORD,
    ...(production ? { NODE_ENV: 'production', DATABASE_URL: DB_URL } : { POSTGRES_HOST: '127.0.0.1', POSTGRES_PORT: '1' }),
    ...extraEnv
  };
  if (!production) { delete env.NODE_ENV; delete env.DATABASE_URL; }
  child = spawn('npx', ['tsx', 'src/index.ts'], { cwd: `${REPO}/server`, env, stdio: ['ignore', out, out], detached: true });
  return waitHealthy();
}
async function waitHealthy(timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try { const r = await fetch(`${API}/api/health`); if (r.ok || r.status === 200) return true; } catch {}
    await sleep(300);
  }
  return false;
}
function stopServer() {
  if (!child) return Promise.resolve();
  try { process.kill(-child.pid, 'SIGTERM'); } catch {}
  const pid = child.pid; child = null;
  return new Promise(res => setTimeout(res, 800));
}
const serverLog = () => fs.readFileSync(logFile, 'utf8');

async function login() {
  const r = await fetch(`${API}/api/auth/signin`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: PASSWORD }) });
  return (await r.json()).token;
}
async function post(body, headers = {}) {
  const r = await fetch(`${API}/api/submissions`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  let json = null; try { json = await r.json(); } catch {}
  return { status: r.status, json, retryAfter: r.headers.get('retry-after') };
}
async function staff(token, p, init = {}) {
  const r = await fetch(`${API}${p}`, { ...init, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(init.headers || {}) } });
  let json = null; try { json = await r.json(); } catch {}
  return { status: r.status, json };
}
const entry = (email, extra = {}) => ({ page_id: 'proj-live', submission_type: 'raffle', form_data: { fullName: 'Guest ' + (email || 'x'), email, ...extra.form }, client_key: extra.key });
const rowsFor = async (where = 'TRUE', params = []) => (await q(`SELECT * FROM submissions WHERE ${where} ORDER BY created_at, id`, params)).rows;

/* =================================================================
   1. FIRST BOOT on the original schema
   ================================================================= */
console.log('\n1. First boot on the original (legacy) schema');
check('server starts', await startServer());
let token = await login();
const cols = (await q(`SELECT column_name FROM information_schema.columns WHERE table_name='submissions'`)).rows.map(r => r.column_name);
check('guest-entry columns exist', ['email_key', 'client_key', 'duplicate_of', 'brand_slug', 'ticket_code'].every(c => cols.includes(c)), cols.join(','));
const idx1 = (await q(`SELECT indexname FROM pg_indexes WHERE tablename='submissions'`)).rows.map(r => r.indexname);
check('unique rules installed', ['submissions_page_email_key_uq', 'submissions_page_client_key_uq', 'submissions_ticket_code_uq'].every(i => idx1.includes(i)), idx1.join(','));
check('trigger installed', (await q(`SELECT 1 FROM pg_trigger WHERE tgname='submissions_fill_email_key_trg'`)).rows.length === 1);
await stopServer();

/* =================================================================
   2. UPGRADE of a database that already holds duplicate / odd entries
   ================================================================= */
console.log('\n2. Upgrade of a populated database (entries registered twice, a file written during an outage)');
// Put the database back into the state the previous release left it in: no guards, no new columns.
await q(`DROP TRIGGER IF EXISTS submissions_fill_email_key_trg ON submissions`);
await q(`DROP INDEX IF EXISTS submissions_page_email_key_uq, submissions_page_client_key_uq, submissions_ticket_code_uq, submissions_page_created_idx`);
await q(`ALTER TABLE submissions DROP COLUMN email_key, DROP COLUMN client_key, DROP COLUMN duplicate_of`);

const pages = JSON.stringify([{ id: 'pg-1', slug: 'live' }, { id: 'pg-2', slug: 'live-2' }]);
await q(`INSERT INTO pages (id, brand_slug, title, slug, status, live_version, widget_tree, pages, page_settings, owner_id, owner_email)
         VALUES ('proj-live','atmos','Live Drop','live-drop','approved',1,'[]',$1,'{}','user-owner','owner@atmos.co'),
                ('proj-draft','atmos','Draft Drop','draft-drop','draft',0,'[]','[]','{}','user-owner','owner@atmos.co'),
                ('proj-other','nike','Nike Drop','nike-drop','approved',1,'[]','[]','{}','user-nike','nia@nike.co')`, [pages]);
const base = new Date('2026-10-01T10:00:00Z').getTime();
const ins = (id, page, email, offsetMin, code, extra = {}) => q(
  `INSERT INTO submissions (id,page_id,brand_slug,submission_type,form_data,ticket_code,status,created_at,checked_in_at,checked_in_by)
   VALUES ($1,$2,'atmos','raffle',$3,$4,'registered',$5,$6,$7)`,
  [id, page, JSON.stringify({ fullName: 'Old ' + id, email, 'WhatsApp Number': '8123' }), code, new Date(base + offsetMin * 60000).toISOString(), extra.in || null, extra.by || null]);
await ins('old-a1', 'proj-live', 'Dup@Guest.co', 0, 'OLD-A1');
await ins('old-a2', 'proj-live', 'dup@guest.co', 5, 'OLD-A2', { in: new Date(base + 600000).toISOString(), by: 'door-1' });
await ins('old-a3', 'proj-live', '  DUP@guest.co ', 9, 'OLD-A3');
await ins('old-b1', 'proj-live', 'solo@guest.co', 1, 'OLD-B1');
await ins('old-p1', 'proj-live', 'guest@activation.internal', 2, 'OLD-P1');
await ins('old-p2', 'proj-live', 'guest@activation.internal', 3, 'OLD-P2');
await ins('old-c1', 'proj-other', 'dup@guest.co', 4, 'OLD-C1'); // same email, other campaign: NOT a duplicate

// Entries an older version wrote to the file while the database was unreachable.
fs.writeFileSync(path.join(DATA_DIR, 'submissions.json'), JSON.stringify([
  { id: 'file-1', page_id: 'proj-live', brand_slug: 'atmos', form_data: { fullName: 'File One', email: 'solo@guest.co' }, ticket_code: 'FILE-1', status: 'submitted', created_at: new Date(base + 20 * 60000).toISOString() }, // same email as old-b1
  { id: 'file-2', page_id: 'pg-2', brand_slug: 'atmos', form_data: { fullName: 'File Two', email: 'file2@guest.co' }, ticket_code: 'FILE-2', status: 'submitted', created_at: new Date(base + 21 * 60000).toISOString(), checked_in_at: new Date(base + 30 * 60000).toISOString(), checked_in_by: 'door-2' }, // funnel page id
  { id: 'file-3', page_id: 'proj-live', brand_slug: 'atmos', form_data: { fullName: 'File Three', email: 'guest@activation.internal' }, ticket_code: 'FILE-3', status: 'submitted', created_at: new Date(base + 22 * 60000).toISOString() },
  { id: 'file-bad', page_id: 'proj-live', brand_slug: 'atmos', form_data: { fullName: 'Broken', email: 'broken@guest.co' }, ticket_code: 'FILE-BAD', status: 'submitted', created_at: 'definitely-not-a-date' },
  { id: 'old-b1', page_id: 'proj-live', brand_slug: 'atmos', form_data: { fullName: 'Already there', email: 'solo@guest.co' }, ticket_code: 'OLD-B1', status: 'submitted', created_at: new Date(base).toISOString() },
  { id: 'file-orphan', page_id: 'live-drop', brand_slug: 'brand', form_data: { fullName: 'Orphan', email: 'orphan@guest.co' }, ticket_code: 'FILE-ORPHAN', status: 'submitted', created_at: new Date(base + 23 * 60000).toISOString() }
], null, 2));
const beforeCount = (await rowsFor()).length;

check('server starts on the populated database', await startServer());
token = await login();
await sleep(500);

const rows = await rowsFor();
const byId = Object.fromEntries(rows.map(r => [r.id, r]));
check('nothing was deleted', rows.length >= beforeCount, `${rows.length} vs ${beforeCount}`);
check('earliest entry of a repeat guest is the original (keeps the rule key)', byId['old-a1'].email_key === 'dup@guest.co' && !byId['old-a1'].duplicate_of);
check('later repeats are kept but flagged, pointing at the original', byId['old-a2'].duplicate_of === 'old-a1' && byId['old-a3'].duplicate_of === 'old-a1' && byId['old-a2'].email_key === null);
check('a flagged repeat keeps its pass and its check-in', byId['old-a2'].ticket_code === 'OLD-A2' && byId['old-a2'].checked_in_by === 'door-1');
check('same email on another campaign is not a duplicate', byId['old-c1'].email_key === 'dup@guest.co' && !byId['old-c1'].duplicate_of);
check('placeholder-email guests are untouched and unkeyed', byId['old-p1'].email_key === null && byId['old-p2'].email_key === null && !byId['old-p1'].duplicate_of && !byId['old-p2'].duplicate_of);
check('submissions.json: unique entry imported', !!byId['file-1'] === true);
check('submissions.json: entry that repeats a database guest is imported but flagged', byId['file-1']?.duplicate_of === 'old-b1' && byId['file-1']?.ticket_code === 'FILE-1');
check('submissions.json: funnel-page id re-pointed at its campaign, check-in kept', byId['file-2']?.page_id === 'proj-live' && byId['file-2']?.checked_in_by === 'door-2');
check('submissions.json: placeholder entry imported', byId['file-3']?.email_key === null);
check('submissions.json: entry already in the database is not duplicated', rows.filter(r => r.id === 'old-b1').length === 1);
check('submissions.json: a broken row does not stop the rest', !byId['file-bad'] && !!byId['file-orphan']);
check('submissions.json: orphan page kept, not lost', byId['file-orphan']?.page_id === 'live-drop');
check('submissions.json set aside, not deleted', !fs.existsSync(path.join(DATA_DIR, 'submissions.json')) && fs.readdirSync(DATA_DIR).some(f => f.startsWith('submissions.imported-')));
check('log reports flagged duplicates', /already registered more than once/.test(serverLog()));
const idx2 = (await q(`SELECT indexname FROM pg_indexes WHERE tablename='submissions'`)).rows.map(r => r.indexname);
check('unique rules installed on the populated table', ['submissions_page_email_key_uq', 'submissions_page_client_key_uq', 'submissions_ticket_code_uq'].every(i => idx2.includes(i)));

// Staff views
const list = await staff(token, '/api/submissions');
const listed = list.json?.data || [];
check('staff list returns every entry', list.status === 200 && listed.length === rows.length, `${listed.length}/${rows.length}`);
check('staff list hides internal keys, shows duplicate_of', listed.every(r => !('email_key' in r) && !('client_key' in r)) && listed.find(r => r.id === 'old-a2')?.duplicate_of === 'old-a1');

// Restart: nothing changes, nothing re-imported
const snapshot = JSON.stringify((await rowsFor()).map(r => [r.id, r.email_key, r.duplicate_of, r.ticket_code]));
await stopServer();
check('restart', await startServer());
token = await login();
check('restart changes nothing (migration is idempotent)', snapshot === JSON.stringify((await rowsFor()).map(r => [r.id, r.email_key, r.duplicate_of, r.ticket_code])));

/* =================================================================
   3. Registration behaviour
   ================================================================= */
console.log('\n3. Registration');
let r = await post(entry('first@guest.co', { key: 'visit-key-0001' }));
check('new guest → 201 with an Access ID', r.status === 201 && /^\d{6}-\d{4}-[A-Z0-9]{4}$/.test(r.json?.data?.ticket_code || ''), JSON.stringify(r.json));
const firstCode = r.json?.data?.ticket_code;
check('response carries only what the pass needs', !('ip_address' in r.json.data) && !('user_agent' in r.json.data) && Object.keys(r.json.data.form_data).every(k => ['fullName', 'email', 'Guest Type', 'Access Valid For'].includes(k)));

r = await post(entry('FIRST@guest.co ', { key: 'visit-key-0002' }));
check('same email again (other case, other visit) → same pass, 200', r.status === 200 && r.json?.duplicate === true && r.json.data.ticket_code === firstCode);
r = await post({ ...entry('first@guest.co', { form: { 'WhatsApp Number': '811' } }), client_key: undefined });
check('old page without a key → still recognised by email', r.status === 200 && r.json.data.ticket_code === firstCode && !('WhatsApp Number' in r.json.data.form_data));
check('only one row exists for that guest', (await rowsFor(`email_key = 'first@guest.co'`)).length === 1);

// no-email form, retry with same key
const ph = { page_id: 'pg-1', submission_type: 'raffle', form_data: { fullName: 'Guest Participant', email: 'guest@activation.internal' } }; // funnel page id on purpose
r = await post({ ...ph, client_key: 'visit-key-ph-01' });
const phCode = r.json?.data?.ticket_code;
check('no-email guest → pass issued (funnel page id accepted)', r.status === 201 && !!phCode);
r = await post({ ...ph, client_key: 'visit-key-ph-01' });
check('retry with the same visit key → same pass', r.status === 200 && r.json.data.ticket_code === phCode);
r = await post({ ...ph, client_key: 'visit-key-ph-02' });
check('a different visit without email is a different guest', r.status === 201 && r.json.data.ticket_code !== phCode);

// validation / access
check('unknown campaign → 404', (await post({ ...entry('x@y.co'), page_id: 'nope' })).status === 404);
check('draft campaign closed to the public', (await post({ ...entry('x@y.co'), page_id: 'proj-draft' })).status === 404);
check('missing name → 400', (await post({ page_id: 'proj-live', form_data: { email: 'x@y.co' } })).status === 400);
check('absurdly long email → 400', (await post(entry('a'.repeat(300) + '@y.co'))).status === 400);
check('array as form_data → 400', (await post({ page_id: 'proj-live', form_data: ['x'] })).status === 400);
check('hostile client key is ignored, not trusted', (await post(entry('hostile@guest.co', { key: "x'; DROP TABLE submissions;--" }))).status === 201 && (await rowsFor(`email_key='hostile@guest.co'`))[0].client_key === null);

/* =================================================================
   4. Simultaneous registrations
   ================================================================= */
console.log('\n4. Simultaneous registrations');
let results = await Promise.all(Array.from({ length: 80 }, (_, i) => post(entry(['Race@Guest.co', 'race@guest.co', ' RACE@GUEST.CO'][i % 3], { key: `race-key-${i}-aaaaaa` }))));
let codes = new Set(results.map(x => x.json?.data?.ticket_code));
check('80 simultaneous taps by one guest (varying case/key) → exactly one entry', (await rowsFor(`email_key='race@guest.co'`)).length === 1);
check('…and every answer carries the same Access ID', codes.size === 1 && results.every(x => [200, 201].includes(x.status)), `${codes.size} codes, statuses ${[...new Set(results.map(x => x.status))]}`);
check('…exactly one 201, the rest 200 duplicates', results.filter(x => x.status === 201).length === 1);

results = await Promise.all(Array.from({ length: 60 }, () => post({ ...ph, client_key: 'one-visit-no-email' })));
check('60 simultaneous taps, no email, same visit → one entry', (await rowsFor(`client_key='one-visit-no-email'`)).length === 1 && new Set(results.map(x => x.json?.data?.ticket_code)).size === 1);

results = await Promise.all(Array.from({ length: 25 }, (_, i) => post({ ...ph, client_key: `distinct-visit-${i}-zzzz` })));
check('25 different guests without email → 25 entries, 25 different passes', results.every(x => x.status === 201) && new Set(results.map(x => x.json.data.ticket_code)).size === 25);

results = await Promise.all(Array.from({ length: 300 }, (_, i) => post(entry(`bulk${i}@guest.co`, { key: `bulk-visit-${i}-xxxxx` }))));
const bulkCodes = results.map(x => x.json?.data?.ticket_code);
check('300 different guests at once → all registered', results.every(x => x.status === 201), `statuses ${[...new Set(results.map(x => x.status))]}`);
check('…with 300 different Access IDs', new Set(bulkCodes).size === 300);
check('…and 300 rows in the database', (await rowsFor(`email_key LIKE 'bulk%@guest.co'`)).length === 300);
check('no Access ID is held by two guests anywhere', (await q(`SELECT ticket_code FROM submissions WHERE ticket_code IS NOT NULL GROUP BY 1 HAVING COUNT(*)>1`)).rows.length === 0);

// Access ID collision handling
await q(`INSERT INTO submissions (id,page_id,brand_slug,submission_type,form_data,ticket_code,status) VALUES ('collide-anchor','proj-live','atmos','raffle','{"fullName":"A","email":"anchor@guest.co"}','COLLIDE-1','registered')`);
// A sequence, not a counter table: the registration is a transaction that is rolled back on a clash,
// and a counter row would be rolled back with it.
await q(`DROP SEQUENCE IF EXISTS collide_seq`); await q(`CREATE SEQUENCE collide_seq`);
await q(`CREATE TABLE IF NOT EXISTS collide_limit (n int)`); await q(`DELETE FROM collide_limit`); await q(`INSERT INTO collide_limit VALUES (2)`);
await q(`CREATE OR REPLACE FUNCTION force_collision() RETURNS trigger AS $$ BEGIN IF NEW.id LIKE 'sub-%' AND nextval('collide_seq') <= (SELECT n FROM collide_limit) THEN NEW.ticket_code := 'COLLIDE-1'; END IF; RETURN NEW; END $$ LANGUAGE plpgsql`);
await q(`DROP TRIGGER IF EXISTS force_collision_trg ON submissions`);
await q(`CREATE TRIGGER force_collision_trg BEFORE INSERT ON submissions FOR EACH ROW EXECUTE PROCEDURE force_collision()`);
r = await post(entry('clash1@guest.co', { key: 'clash-key-0001' }));
check('two Access ID clashes in a row → silently redrawn, guest still gets a pass', r.status === 201 && r.json.data.ticket_code !== 'COLLIDE-1', JSON.stringify(r.json));
await q(`ALTER SEQUENCE collide_seq RESTART`); await q(`UPDATE collide_limit SET n = 50`);
r = await post(entry('clash2@guest.co', { key: 'clash-key-0002' }));
check('a pass that keeps clashing → "try again", never a duplicate code', r.status === 503 && r.json?.retryable === true && (await q(`SELECT 1 FROM submissions WHERE ticket_code='COLLIDE-1'`)).rows.length === 1);
await q(`DROP TRIGGER force_collision_trg ON submissions`);
await q(`DELETE FROM submissions WHERE ticket_code = 'COLLIDE-1' AND id <> 'collide-anchor'`);

// Rows from an older server still running during a deploy (no email_key supplied)
await q(`INSERT INTO submissions (id,page_id,brand_slug,submission_type,form_data,ticket_code,status) VALUES ('oldcode-1','proj-live','atmos','raffle','{"fullName":"Old Code","email":"OldCode@Guest.co"}','OC-1','registered')`);
check('trigger gives an old-code insert its email key', (await rowsFor(`id='oldcode-1'`))[0].email_key === 'oldcode@guest.co');
let refused = false;
try { await q(`INSERT INTO submissions (id,page_id,brand_slug,submission_type,form_data,ticket_code,status) VALUES ('oldcode-2','proj-live','atmos','raffle','{"fullName":"Old Code","email":"oldcode@guest.co"}','OC-2','registered')`); } catch (e) { refused = e.code === '23505'; }
check('…so an old instance cannot create a second entry for the same guest', refused);

/* =================================================================
   5. Door check-in
   ================================================================= */
console.log('\n5. Door check-in');
results = await Promise.all(Array.from({ length: 20 }, () => staff(token, '/api/submissions/check-in', { method: 'POST', body: JSON.stringify({ code: firstCode, operator: 'door' }) })));
check('20 scanners read one pass at once → exactly one admitted', results.filter(x => x.json?.result === 'admitted').length === 1 && results.filter(x => x.json?.result === 'already').length === 19);
r = await staff(token, '/api/submissions/check-in', { method: 'POST', body: JSON.stringify({ code: 'NOT-A-CODE' }) });
check('unknown code → invalid (this is the only case that says invalid)', r.json?.result === 'invalid');
r = await staff(token, '/api/submissions/check-in', { method: 'POST', body: JSON.stringify({ code: 'guest@activation.internal' }) });
check('the shared placeholder email never matches a guest', r.json?.result === 'invalid');
r = await staff(token, '/api/submissions/check-in', { method: 'POST', body: JSON.stringify({ code: 'dup@guest.co' }) });
check('typing a repeat guest\'s email finds the original entry, not a flagged copy', r.json?.data?.id === 'old-a1', JSON.stringify(r.json?.data?.id));
r = await staff(token, '/api/submissions/check-in', { method: 'POST', body: JSON.stringify({ code: 'OLD-A3' }) });
check('a flagged copy\'s own pass still works at the door', r.json?.result === 'admitted' && r.json?.data?.id === 'old-a3');

/* =================================================================
   6. DATABASE OUTAGE while the server keeps running
   ================================================================= */
console.log('\n6. Database outage');
const filesBefore = fs.readdirSync(DATA_DIR).sort().join(',');
const countBefore = (await rowsFor()).length;
await pgServer.stop();
await sleep(1500);

r = await post(entry('outage@guest.co', { key: 'outage-key-0001' }));
check('guest during outage → 503 "try again" with Retry-After', r.status === 503 && r.json?.retryable === true && !!r.retryAfter, `${r.status} ${JSON.stringify(r.json)}`);
check('…and nothing is written to a local file', fs.readdirSync(DATA_DIR).sort().join(',') === filesBefore && !fs.existsSync(path.join(DATA_DIR, 'submissions.json')));
r = await staff(token, '/api/submissions');
check('guest list during outage → 503, not an empty list', r.status === 503, `${r.status}`);
r = await staff(token, '/api/submissions/check-in', { method: 'POST', body: JSON.stringify({ code: firstCode }) });
check('door scan during outage → 503, never "invalid pass"', r.status === 503 && r.json?.result !== 'invalid', `${r.status} ${JSON.stringify(r.json)}`);
r = await staff(token, '/api/submissions/bulk-status', { method: 'POST', body: JSON.stringify({ ids: ['old-a1'], status: 'confirmed' }) });
check('status change during outage → 503', r.status === 503);
r = await fetch(`${API}/api/health`).then(x => x.json());
check('health reports the database as down', r.status !== 'ok', JSON.stringify(r));

await pgServer.start();
// The page keeps retrying; the first request after the database is back reconnects it.
let recovered = null;
const t0 = Date.now();
while (Date.now() - t0 < 30000) {
  const x = await post(entry('outage@guest.co', { key: 'outage-key-0001' }));
  if (x.status === 201 || x.status === 200) { recovered = x; break; }
  await sleep(700);
}
check('after the database is back, the retrying guest is registered', !!recovered && recovered.status === 201, recovered ? `${recovered.status} after ${Date.now() - t0}ms` : 'never');
check('…exactly once', (await rowsFor(`email_key='outage@guest.co'`)).length === 1);
check('…and no entry went anywhere else', (await rowsFor()).length === countBefore + 1 && !fs.existsSync(path.join(DATA_DIR, 'submissions.json')));
r = await staff(token, '/api/submissions');
check('hub list works again, complete', r.status === 200 && r.json.data.length === countBefore + 1);
r = await staff(token, '/api/submissions/check-in', { method: 'POST', body: JSON.stringify({ code: recovered?.json?.data?.ticket_code }) });
check('and the new pass checks in at the door', r.json?.result === 'admitted');

// Second outage, retry-with-same-key lands once even if the first attempt reached the DB but the reply was lost
await pgServer.stop(); await sleep(1000);
const during = await Promise.all(Array.from({ length: 10 }, () => post(entry('flap@guest.co', { key: 'flap-key-000001' }))));
check('10 taps during a second outage → all told to retry', during.every(x => x.status === 503));
await pgServer.start();
const t1 = Date.now(); let flap = null;
while (Date.now() - t1 < 30000) { const x = await post(entry('flap@guest.co', { key: 'flap-key-000001' })); if (x.status < 300) { flap = x; break; } await sleep(700); }
const flap2 = await post(entry('flap@guest.co', { key: 'flap-key-000001' }));
check('retries after the outage → one entry, one pass', !!flap && flap2.status === 200 && flap2.json.data.ticket_code === flap.json.data.ticket_code && (await rowsFor(`email_key='flap@guest.co'`)).length === 1);

/* =================================================================
   6b. Server started while the database is not up yet (a deploy)
   ================================================================= */
console.log('\n6b. Server starts before the database is ready');
await stopServer();
await pgServer.stop(); await sleep(1000);
check('server still starts and answers', await startServer());
r = await post(entry('boot@guest.co', { key: 'boot-key-0000001' }));
check('guests are told to retry rather than lose the entry', r.status === 503 && r.json?.retryable === true, `${r.status}`);
await pgServer.start();
const t2 = Date.now(); let boot = null;
while (Date.now() - t2 < 40000) { const x = await post(entry('boot@guest.co', { key: 'boot-key-0000001' })); if (x.status < 300) { boot = x; break; } await sleep(700); }
check('once the database is up the server picks it up by itself', !!boot, boot ? `${Date.now() - t2}ms` : 'never');
check('…and the guest is registered once', (await rowsFor(`email_key='boot@guest.co'`)).length === 1);
token = await login();
check('the hub works again too', (await staff(token, '/api/submissions')).status === 200);

/* =================================================================
   7. Ownership of the Access ID rule when old data already clashes
   ================================================================= */
console.log('\n7. Existing clash of two Access IDs must not block startup');
await stopServer();
await q(`DROP INDEX IF EXISTS submissions_ticket_code_uq`);
await q(`INSERT INTO submissions (id,page_id,brand_slug,submission_type,form_data,ticket_code,status) VALUES ('clash-old-1','proj-live','atmos','raffle','{"fullName":"C1","email":"c1@guest.co"}','SAME-OLD','registered'),('clash-old-2','proj-live','atmos','raffle','{"fullName":"C2","email":"c2@guest.co"}','SAME-OLD','registered')`);
check('server still starts', await startServer());
token = await login();
check('warns about the clash instead of failing', /unique Access ID rule was NOT installed/.test(serverLog()));
check('registrations keep working', (await post(entry('after-clash@guest.co', { key: 'after-clash-0001' }))).status === 201);
check('email rule is still enforced', (await q(`SELECT 1 FROM pg_indexes WHERE indexname='submissions_page_email_key_uq'`)).rows.length === 1);
await q(`DELETE FROM submissions WHERE id IN ('clash-old-1','clash-old-2')`);
await stopServer();
check('restart once the clash is gone', await startServer());
check('…the Access ID rule is installed after all', (await q(`SELECT 1 FROM pg_indexes WHERE indexname='submissions_ticket_code_uq'`)).rows.length === 1);

/* =================================================================
   8. Access control still holds on the strict code path
   ================================================================= */
console.log('\n8. Brand scoping');
const mk = async (name, email, pw, brand) => staff(token, '/api/users', { method: 'POST', body: JSON.stringify({ name, email, password: pw, assignedBrands: [brand] }) });
const rianAccount = await mk('Rian', 'rian@atmos.co', 'atmospass1', 'atmos'); await mk('Nia', 'nia@nike.co', 'nikapass12', 'nike');
await q(`UPDATE pages SET owner_id=$1, owner_email='rian@atmos.co' WHERE id='proj-live'`, [rianAccount.json.data.id]); // Rian owns the live campaign
const tok = async (id, pw) => (await (await fetch(`${API}/api/auth/signin`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier: id, password: pw }) })).json()).token;
const rian = await tok('rian@atmos.co', 'atmospass1'); const nia = await tok('nia@nike.co', 'nikapass12');
const rianList = (await staff(rian, '/api/submissions')).json?.data || [];
const niaList = (await staff(nia, '/api/submissions')).json?.data || [];
check('Atmos team sees only Atmos campaigns\' guests', rianList.length > 0 && rianList.every(x => x.brand_slug === 'atmos'));
check('Nike team sees none of them', niaList.every(x => x.page_id !== 'proj-live') && niaList.length === 1, `${niaList.length}`);
r = await staff(nia, '/api/submissions/check-in', { method: 'POST', body: JSON.stringify({ code: firstCode }) });
check('another brand cannot check a pass in', r.json?.result === 'invalid');

await stopServer();

/* =================================================================
   8b. Places (slots) on a Multiple Choice block
   ================================================================= */
console.log('\n8b. Places');
check('server starts', await startServer());
token = await login();
const design = (extra = {}) => [{ id: 'pg-places', slug: 'places', widget_tree: [
  { id: 'mcL', type: 'MultipleChoice', props: { limitPlaces: true, globalSlotsCapacity: 20, waitlistEnabled: true, options: [
    { id: 'optA', label: 'DNA NIGHT 2026' }, { id: 'optB', label: 'AFTER PARTY', slotsCapacity: 5 },
    { id: 'optX', label: 'CLOSED NIGHT', disabled: true }
  ], ...extra } },
  { id: 'mcFree', type: 'MultipleChoice', props: { limitPlaces: false, globalSlotsCapacity: 25, options: [{ id: 'optF', label: 'WALK-IN' }] } },
  { id: 'mcNoWait', type: 'MultipleChoice', props: { limitPlaces: true, globalSlotsCapacity: 1, waitlistEnabled: false, options: [{ id: 'optN', label: 'PRIVATE DINNER' }] } }
] }];
await q(`INSERT INTO pages (id, brand_slug, title, slug, status, live_version, widget_tree, pages, page_settings, owner_id, owner_email)
         VALUES ('proj-places','atmos','Places Drop','places-drop','approved',1,'[]',$1,'{}','user-owner','owner@atmos.co')`, [JSON.stringify(design())]);
const placeEntry = (n, picks, extra = {}) => ({ page_id: 'proj-places', submission_type: 'raffle', form_data: { fullName: `Guest ${n}`, email: `pl${n}@guest.co` }, slot_picks: picks, client_key: `places-key-${n}-xxxxx`, ...extra });
const A = [{ widget: 'mcL', option: 'optA' }], B = [{ widget: 'mcL', option: 'optB' }], AB = [...A, ...B];
const takenIn = async (w, o) => (await q(`SELECT COUNT(*)::int n FROM submission_slots ss JOIN submissions s ON s.id=ss.submission_id WHERE ss.page_id='proj-places' AND ss.widget_id=$1 AND ss.option_id=$2 AND s.status NOT IN ('waitlisted','declined')`, [w, o])).rows[0].n;
const avail = async () => (await (await fetch(`${API}/api/submissions/availability/proj-places`)).json()).data;
let n = 0;

let av = await avail();
check('availability: shared limit and own limit, live', av['mcL::optA']?.remaining === 20 && av['mcL::optB']?.remaining === 5 && av['mcL::optB']?.capacity === 5);
check('availability: unlimited blocks say nothing (no invented number)', !('mcFree::optF' in av));
check('availability: closed option is reported closed', av['mcL::optX']?.closed === true);
check('availability is public, and cached no-store', (await fetch(`${API}/api/submissions/availability/proj-places`)).headers.get('cache-control') === 'no-store');
check('availability: unknown campaign → 404', (await fetch(`${API}/api/submissions/availability/nope`)).status === 404);
check('availability: draft campaign closed to the public', (await fetch(`${API}/api/submissions/availability/proj-draft`)).status === 404);

r = await post(placeEntry(++n, B));
check('first guest takes a place', r.status === 201 && r.json.data.status === 'registered');
const firstPlacesCode = r.json.data.ticket_code;
av = await avail();
check('…and the next look shows one place fewer, at once', av['mcL::optB'].remaining === 4 && av['mcL::optB'].taken === 1, JSON.stringify(av['mcL::optB']));

r = await post(placeEntry(1, B));
check('the same guest retrying does not take a second place', r.status === 200 && r.json.duplicate === true && r.json.data.ticket_code === firstPlacesCode && (await takenIn('mcL', 'optB')) === 1);

// 30 guests reach for the 4 remaining places at once
results = await Promise.all(Array.from({ length: 30 }, () => post(placeEntry(++n, B))));
check('30 guests for 4 remaining places → exactly 4 get one', results.filter(x => x.status === 201).length === 4, `${results.filter(x => x.status === 201).length}`);
check('…the other 26 are told it is full (409 slots_full), with the numbers', results.filter(x => x.status === 409 && x.json?.code === 'slots_full' && x.json.availability?.['mcL::optB']?.remaining === 0).length === 26);
check('…and the database holds exactly 5 — never one over', (await takenIn('mcL', 'optB')) === 5);
check('a refused guest leaves nothing behind', (await rowsFor(`form_data->>'fullName' = $1`, [`Guest ${n}`])).length === (results[results.length - 1].status === 201 ? 1 : 0));

// waitlist
results = await Promise.all(Array.from({ length: 8 }, () => post(placeEntry(++n, B, { waitlist: true }))));
check('guests who ask for the waitlist on a full option are waitlisted', results.every(x => x.status === 201 && x.json.data.status === 'waitlisted'));
check('…without taking a place', (await takenIn('mcL', 'optB')) === 5 && (await avail())['mcL::optB'].remaining === 0);
const waitlistedId = (await rowsFor(`status='waitlisted' AND page_id='proj-places'`))[0].id;

// asking for the waitlist when places exist just registers
r = await post(placeEntry(++n, A, { waitlist: true }));
check('asking for the waitlist while places remain simply takes a place', r.status === 201 && r.json.data.status === 'registered' && (await takenIn('mcL', 'optA')) === 1);

// multi-pick: all or nothing
const beforeA = await takenIn('mcL', 'optA');
r = await post(placeEntry(++n, AB));
check('picking a free and a full option together, without the waitlist → refused', r.status === 409 && r.json.full.length === 1 && r.json.full[0].option === 'optB');
check('…and the free option was not taken either', (await takenIn('mcL', 'optA')) === beforeA && (await rowsFor(`form_data->>'email' = $1`, [`pl${n}@guest.co`])).length === 0);
r = await post(placeEntry(++n, AB, { waitlist: true }));
check('…with the waitlist: waitlisted for both, taking neither', r.status === 201 && r.json.data.status === 'waitlisted' && (await takenIn('mcL', 'optA')) === beforeA);

// no waitlist on this block
await post(placeEntry(++n, [{ widget: 'mcNoWait', option: 'optN' }]));
r = await post(placeEntry(++n, [{ widget: 'mcNoWait', option: 'optN' }], { waitlist: true }));
check('a block with the waitlist switched off turns guests away even if they ask', r.status === 409 && r.json.full[0].waitlist === false);

// closed / unlimited / unknown
r = await post(placeEntry(++n, [{ widget: 'mcL', option: 'optX' }]));
check('a closed option cannot be registered for', r.status === 409 && r.json.code === 'option_closed');
for (let i = 0; i < 40; i++) await post(placeEntry(++n, [{ widget: 'mcFree', option: 'optF' }]));
check('a block with places not limited never refuses (the old default of 25 is only a label)', (await takenIn('mcFree', 'optF')) === 40);
r = await post(placeEntry(++n, [{ widget: 'ghost', option: 'nope' }, { widget: 'mcL', option: 'ghost' }]));
check('picks that are not in the campaign are ignored, not trusted', r.status === 201 && (await q(`SELECT 1 FROM submission_slots WHERE submission_id=$1`, [r.json.data.id])).rows.length === 0);

// places come back
const confirmedB = (await q(`SELECT s.id FROM submissions s JOIN submission_slots ss ON ss.submission_id=s.id WHERE ss.page_id='proj-places' AND ss.option_id='optB' AND s.status NOT IN ('waitlisted','declined') ORDER BY s.created_at`)).rows.map(x => x.id);
r = await staff(token, '/api/submissions/bulk-delete', { method: 'POST', body: JSON.stringify({ ids: [confirmedB[0]] }) });
check('deleting a guest gives the place back', r.status === 200 && (await takenIn('mcL', 'optB')) === 4 && (await avail())['mcL::optB'].remaining === 1);
check('…and their place rows went with them', (await q(`SELECT 1 FROM submission_slots WHERE submission_id=$1`, [confirmedB[0]])).rows.length === 0);
r = await staff(token, '/api/submissions/bulk-status', { method: 'POST', body: JSON.stringify({ ids: [confirmedB[1]], status: 'declined' }) });
check('declining a guest gives the place back', r.status === 200 && (await avail())['mcL::optB'].remaining === 2);
r = await staff(token, '/api/submissions/bulk-status', { method: 'POST', body: JSON.stringify({ ids: [confirmedB[1]], status: 'confirmed' }) });
check('…and undoing it takes it again', (await avail())['mcL::optB'].remaining === 1);
r = await post(placeEntry(++n, B));
check('the freed place goes to the next guest, no waitlist needed', r.status === 201 && r.json.data.status === 'registered' && (await avail())['mcL::optB'].remaining === 0);

// staff promote a waitlisted guest although it is full: allowed, and never shows a negative
r = await staff(token, '/api/submissions/bulk-status', { method: 'POST', body: JSON.stringify({ ids: [waitlistedId], status: 'confirmed' }) });
check('staff may promote a waitlisted guest past the limit', r.status === 200 && (await takenIn('mcL', 'optB')) === 6);
check('…and the page just shows no places left (never negative)', (await avail())['mcL::optB'].remaining === 0);

// door
const wl = (await rowsFor(`status='waitlisted' AND page_id='proj-places'`))[0];
r = await staff(token, '/api/submissions/check-in', { method: 'POST', body: JSON.stringify({ code: wl.ticket_code }) });
check('door: a waitlisted guest is not admitted', r.json?.success === false && r.json?.result === 'waitlisted');
const dec = (await rowsFor(`id=$1`, [confirmedB[1]]))[0];
await staff(token, '/api/submissions/bulk-status', { method: 'POST', body: JSON.stringify({ ids: [dec.id], status: 'declined' }) });
r = await staff(token, '/api/submissions/check-in', { method: 'POST', body: JSON.stringify({ code: dec.ticket_code }) });
check('door: a declined guest is not admitted', r.json?.success === false && r.json?.result === 'declined');
await staff(token, '/api/submissions/bulk-status', { method: 'POST', body: JSON.stringify({ ids: [dec.id, wl.id], status: 'confirmed' }) });
r = await staff(token, '/api/submissions/check-in', { method: 'POST', body: JSON.stringify({ code: wl.ticket_code }) });
check('door: once promoted, the same pass is admitted', r.json?.success === true && r.json?.result === 'admitted');

// no deadlocks, exact counts, with guests picking the same two options in different orders
await q(`DELETE FROM submissions WHERE page_id='proj-places'`);
results = await Promise.all(Array.from({ length: 80 }, (_, i) => post(placeEntry(1000 + i, i % 2 ? AB : [...B, ...A]))));
const okCount = results.filter(x => x.status === 201).length;
check('80 guests picking the same two options in opposite orders: no error, no deadlock', results.every(x => x.status === 201 || x.status === 409), [...new Set(results.map(x => x.status))].join());
check('…exactly the 5 places of the smaller option were given out', okCount === 5 && (await takenIn('mcL', 'optB')) === 5 && (await takenIn('mcL', 'optA')) === 5, `${okCount}`);

// retry idempotency with places
await q(`DELETE FROM submissions WHERE page_id='proj-places'`);
const same = await Promise.all(Array.from({ length: 12 }, () => post(placeEntry(2000, A))));
check('12 taps by one guest for a place → one place taken', (await takenIn('mcL', 'optA')) === 1 && new Set(same.map(x => x.json?.data?.ticket_code)).size === 1);

// design changes apply when published
await q(`UPDATE pages SET pages=$1 WHERE id='proj-places'`, [JSON.stringify(design({ globalSlotsCapacity: 1 }))]);
await staff(token, '/api/pages/proj-places/publish', { method: 'POST', body: '{}' });
r = await post(placeEntry(3000, A));
check('after publishing a smaller limit, the new limit is what counts at once', r.status === 409 && r.json.code === 'slots_full', `${r.status}`);
await q(`UPDATE pages SET pages=$1 WHERE id='proj-places'`, [JSON.stringify(design())]);
await staff(token, '/api/pages/proj-places/publish', { method: 'POST', body: '{}' });

// outage with places
await pgServer.stop(); await sleep(1000);
r = await post(placeEntry(4000, B));
check('during an outage a guest with places is told to retry, and nothing is kept', r.status === 503 && !fs.existsSync(path.join(DATA_DIR, 'submissions.json')));
await pgServer.start();
const t3 = Date.now(); let back = null;
while (Date.now() - t3 < 30000) { const x = await post(placeEntry(4000, B)); if (x.status < 300) { back = x; break; } await sleep(700); }
check('…and registers once the database is back', !!back && (await takenIn('mcL', 'optB')) === 1);
token = await login();

// older entries: matched by label once, idempotently
await stopServer();
await q(`DELETE FROM submissions WHERE page_id='proj-places'`);
const oldSessions = [{ label: 'DNA NIGHT 2026' }, { label: 'After Party' }];
for (let i = 0; i < 3; i++) await q(`INSERT INTO submissions (id,page_id,brand_slug,submission_type,form_data,ticket_code,status) VALUES ($1,'proj-places','atmos','raffle',$2,$3,'registered')`,
  [`legacy-pl-${i}`, JSON.stringify({ fullName: `Legacy ${i}`, email: `legacy${i}@guest.co`, 'Access Valid For': oldSessions }), `LEGACY-PL-${i}`]);
await q(`INSERT INTO submissions (id,page_id,brand_slug,submission_type,form_data,ticket_code,status) VALUES ('legacy-pl-x','proj-places','atmos','raffle',$1,'LEGACY-PL-X','registered')`, [JSON.stringify({ fullName: 'Legacy X', email: 'legacyx@guest.co', 'Access Valid For': [{ label: 'Nothing matching' }] })]);
await q(`COMMENT ON TABLE submission_slots IS NULL`);
check('server restarts', await startServer());
token = await login();
check('earlier entries are matched to their options by label', (await takenIn('mcL', 'optA')) === 3 && (await takenIn('mcL', 'optB')) === 3, `${await takenIn('mcL', 'optA')}/${await takenIn('mcL', 'optB')}`);
check('…an entry whose label matches nothing is left alone', (await q(`SELECT 1 FROM submission_slots WHERE submission_id='legacy-pl-x'`)).rows.length === 0);
check('…so the first count after the upgrade is already the true one', (await avail())['mcL::optB'].remaining === 2);
const slotRows = (await q(`SELECT COUNT(*)::int n FROM submission_slots`)).rows[0].n;
await stopServer(); check('restart again', await startServer()); token = await login();
check('the match is done once: a restart changes nothing', (await q(`SELECT COUNT(*)::int n FROM submission_slots`)).rows[0].n === slotRows);
await stopServer();

/* =================================================================
   9. Development without a database keeps working
   ================================================================= */
console.log('\n9. Development mode (no database at all)');
fs.rmSync(DATA_DIR, { recursive: true, force: true }); fs.mkdirSync(DATA_DIR, { recursive: true });
fs.writeFileSync(path.join(DATA_DIR, 'pages.json'), JSON.stringify([{ id: 'dev-proj', brand_slug: 'atmos', title: 'Dev', slug: 'dev', status: 'approved', pages: [{ id: 'dev-pg' }] }]));
check('dev server starts without a database', await startServer({}, { production: false }));
r = await post({ page_id: 'dev-pg', submission_type: 'raffle', form_data: { fullName: 'Dev', email: 'dev@guest.co' }, client_key: 'dev-visit-000001' });
check('registration works from files', r.status === 201, JSON.stringify(r.json));
const devCode = r.json?.data?.ticket_code;
r = await post({ page_id: 'dev-pg', submission_type: 'raffle', form_data: { fullName: 'Dev', email: 'DEV@guest.co' }, client_key: 'dev-visit-000002' });
check('repeat is recognised in file mode too', r.status === 200 && r.json.data.ticket_code === devCode);
r = await post({ page_id: 'dev-pg', submission_type: 'raffle', form_data: { fullName: 'P', email: 'guest@activation.internal' }, client_key: 'dev-visit-ph-01' });
const devPh = r.json?.data?.ticket_code;
r = await post({ page_id: 'dev-pg', submission_type: 'raffle', form_data: { fullName: 'P', email: 'guest@activation.internal' }, client_key: 'dev-visit-ph-01' });
check('same visit key repeat is recognised in file mode', r.status === 200 && r.json.data.ticket_code === devPh);
const devTok = await login();
r = await staff(devTok, '/api/submissions/check-in', { method: 'POST', body: JSON.stringify({ code: devCode }) });
check('check-in works in file mode', r.json?.result === 'admitted');
r = await staff(devTok, '/api/submissions');
check('list works in file mode, without internal keys', r.status === 200 && r.json.data.length === 2 && r.json.data.every(x => !('email_key' in x) && !('client_key' in x)));
await stopServer();

/* ---------------- done ---------------- */
await pgServer.stop().catch(() => {});
console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);

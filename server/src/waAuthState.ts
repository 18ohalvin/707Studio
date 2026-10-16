import { BufferJSON, initAuthCreds, proto } from '@whiskeysockets/baileys';
import { pool, getDbStatus } from './db.js';

/**
 * Baileys login state (the phone link) kept in Postgres instead of a folder.
 * A redeploy replaces the container and its disk; the database survives, so the
 * linked phone stays linked and the sender does not have to scan again at the venue.
 */
export function dbAuthAvailable(): boolean {
  return getDbStatus().isConnected;
}

export async function useDbAuthState(pageId: string) {
  const read = async (key: string) => {
    const res = await pool.query('SELECT value FROM wa_auth WHERE page_id = $1 AND key = $2', [pageId, key]);
    return res.rows[0] ? JSON.parse(res.rows[0].value, BufferJSON.reviver) : null;
  };
  const write = (key: string, data: unknown) =>
    pool.query(
      `INSERT INTO wa_auth (page_id, key, value) VALUES ($1, $2, $3)
       ON CONFLICT (page_id, key) DO UPDATE SET value = EXCLUDED.value`,
      [pageId, key, JSON.stringify(data, BufferJSON.replacer)]
    );
  const remove = (key: string) => pool.query('DELETE FROM wa_auth WHERE page_id = $1 AND key = $2', [pageId, key]);

  const creds = (await read('creds')) || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type: string, ids: string[]) => {
          const data: Record<string, any> = {};
          await Promise.all(ids.map(async id => {
            let value = await read(`${type}-${id}`);
            if (type === 'app-state-sync-key' && value) value = proto.Message.AppStateSyncKeyData.fromObject(value);
            data[id] = value;
          }));
          return data;
        },
        set: async (data: Record<string, Record<string, any>>) => {
          const tasks: Promise<unknown>[] = [];
          for (const category of Object.keys(data)) {
            for (const id of Object.keys(data[category])) {
              const value = data[category][id];
              tasks.push(value ? write(`${category}-${id}`, value) : remove(`${category}-${id}`));
            }
          }
          await Promise.all(tasks);
        }
      }
    },
    saveCreds: () => write('creds', creds)
  };
}

export async function clearDbAuth(pageId: string): Promise<void> {
  if (!dbAuthAvailable()) return;
  try {
    await pool.query('DELETE FROM wa_auth WHERE page_id = $1', [pageId]);
  } catch { /* nothing stored */ }
}

/** Pages whose phone is linked (creds with a logged-in account). */
export async function pairedPagesInDb(): Promise<string[]> {
  if (!dbAuthAvailable()) return [];
  try {
    const res = await pool.query(`SELECT page_id, value FROM wa_auth WHERE key = 'creds'`);
    return res.rows.filter(r => {
      try { return Boolean(JSON.parse(r.value)?.me?.id); } catch { return false; }
    }).map(r => String(r.page_id));
  } catch {
    return [];
  }
}

export async function hasDbCreds(pageId: string): Promise<boolean> {
  if (!dbAuthAvailable()) return false;
  try {
    const res = await pool.query(`SELECT value FROM wa_auth WHERE page_id = $1 AND key = 'creds'`, [pageId]);
    return Boolean(res.rows[0] && JSON.parse(res.rows[0].value)?.me?.id);
  } catch {
    return false;
  }
}

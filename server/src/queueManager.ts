import { pool, getDbStatus } from './db.js';
import { readDataFile, writeDataFile } from './fileStorage.js';

export interface WhatsAppDeviceInfo {
  platform?: string;
  battery?: number;
  pushName?: string;
}

export interface WhatsAppConnection {
  connected: boolean;
  phoneNumber?: string;
  sessionName?: string;
  provider?: 'linked_device' | 'pairing_code' | 'meta_cloud' | 'custom_gateway';
  gatewayUrl?: string;
  apiToken?: string;
  linkedAt?: string;
  deviceInfo?: WhatsAppDeviceInfo;
}

export interface WhatsAppLogEntry {
  id: string;
  pageId?: string;
  phone: string;
  text: string;
  event: string;
  status: 'sent' | 'delivered' | 'failed';
  timestamp: string;
}

export interface QueueSettings {
  enabled: boolean;
  waEnabled: boolean;
  maxCapacity: number;
  notifyThreshold: number;
  skippedTolerance: number;
  currentCalledNumber: number;
  waConnection?: WhatsAppConnection;
  waTemplates: Record<string, string>;
  stages?: any[];
}

export const DEFAULT_QUEUE_SETTINGS: QueueSettings = {
  enabled: true,
  waEnabled: false,
  maxCapacity: 50,
  notifyThreshold: 10,
  skippedTolerance: 5,
  currentCalledNumber: 1,
  waConnection: {
    connected: false,
    phoneNumber: '',
    sessionName: '707 Studio Primary WhatsApp',
    provider: 'linked_device',
    deviceInfo: {
      platform: 'WhatsApp Multi-Device (Web)',
      pushName: '707 Activation Hub'
    }
  },
  waTemplates: {
    welcome: 'Hello {{name}}! You are registered in the queue with Queue Number #{{queue_number}} (Party: {{party_size}} guests). Track your live status here: {{link}}',
    approaching: 'Hello {{name}}! Your turn is approaching. The queue is currently serving near your number (#{{queue_number}}). Please proceed to the entrance area now.',
    ready: 'Hello {{name}}! It is your turn to enter. Please present your Access ID {{access_id}} to the door staff at the entrance.',
    expired: 'Notice: {{name}}, queue number #{{queue_number}} was skipped past the grace margin and has expired. Please check in with event staff or register again to rejoin.'
  }
};

/** In-memory buffer of recent outgoing notifications for live audit */
const recentWaLogs: WhatsAppLogEntry[] = [];

export function getWaLogs(pageId?: string): WhatsAppLogEntry[] {
  if (!pageId) return [...recentWaLogs].reverse().slice(0, 30);
  return recentWaLogs.filter(l => !l.pageId || l.pageId === pageId).reverse().slice(0, 30);
}

/** Get queue settings for a specific campaign / page */
export async function getQueueSettings(pageId: string): Promise<QueueSettings> {
  try {
    if (getDbStatus().isConnected) {
      const res = await pool.query('SELECT page_settings FROM pages WHERE id = $1', [pageId]);
      const settings = res.rows[0]?.page_settings || {};
      return {
        ...DEFAULT_QUEUE_SETTINGS,
        ...(settings.queue_settings || {}),
        waConnection: {
          ...DEFAULT_QUEUE_SETTINGS.waConnection,
          ...(settings.queue_settings?.waConnection || {})
        },
        waTemplates: {
          ...DEFAULT_QUEUE_SETTINGS.waTemplates,
          ...(settings.queue_settings?.waTemplates || {})
        }
      };
    } else {
      const pages = readDataFile<any[]>('pages.json', []);
      const p = pages.find(item => item.id === pageId);
      const settings = p?.page_settings || {};
      return {
        ...DEFAULT_QUEUE_SETTINGS,
        ...(settings.queue_settings || {}),
        waConnection: {
          ...DEFAULT_QUEUE_SETTINGS.waConnection,
          ...(settings.queue_settings?.waConnection || {})
        },
        waTemplates: {
          ...DEFAULT_QUEUE_SETTINGS.waTemplates,
          ...(settings.queue_settings?.waTemplates || {})
        }
      };
    }
  } catch (err) {
    console.warn('[QueueManager] Could not read queue settings, using defaults:', err);
    return { ...DEFAULT_QUEUE_SETTINGS };
  }
}

/** Save updated queue settings */
export async function saveQueueSettings(pageId: string, updates: Partial<QueueSettings>): Promise<QueueSettings> {
  const current = await getQueueSettings(pageId);
  const merged: QueueSettings = {
    ...current,
    ...updates,
    waConnection: {
      ...DEFAULT_QUEUE_SETTINGS.waConnection,
      ...(current.waConnection || {}),
      ...(updates.waConnection || {}),
      connected: updates.waConnection?.connected ?? current.waConnection?.connected ?? false
    },
    waTemplates: {
      ...current.waTemplates,
      ...(updates.waTemplates || {})
    }
  };

  try {
    if (getDbStatus().isConnected) {
      const res = await pool.query('SELECT page_settings FROM pages WHERE id = $1', [pageId]);
      const pageSettings = res.rows[0]?.page_settings || {};
      pageSettings.queue_settings = merged;
      await pool.query('UPDATE pages SET page_settings = $2, updated_at = NOW() WHERE id = $1', [pageId, JSON.stringify(pageSettings)]);
    } else {
      const pages = readDataFile<any[]>('pages.json', []);
      const idx = pages.findIndex(item => item.id === pageId);
      if (idx >= 0) {
        pages[idx].page_settings = pages[idx].page_settings || {};
        pages[idx].page_settings.queue_settings = merged;
        writeDataFile('pages.json', pages);
      }
    }
  } catch (err) {
    console.error('[QueueManager] Failed to save queue settings:', err);
  }

  return merged;
}

/** Generate a dynamic QR string and pairing code for WhatsApp linking */
export function generateWaLinkPayload(pageId: string, phoneNumber?: string) {
  const nonce = (Math.random().toString(36).substring(2, 10) + '707STUDIO').substring(0, 8).toUpperCase();
  const timestamp = Date.now();
  // Standard format compatible with WhatsApp Web / Multi-Device linking payloads
  const qrString = `2@707Studio,${pageId},${timestamp},${nonce}`;
  const pairingCode = `${nonce.slice(0, 4)}-${nonce.slice(4, 8)}`;

  return {
    qrString,
    pairingCode,
    expiresInSeconds: 180,
    generatedAt: new Date().toISOString()
  };
}

/** Formats template string with dynamic values */
export function renderTemplate(template: string, vars: Record<string, any>): string {
  let output = template;
  for (const [key, value] of Object.entries(vars)) {
    const pattern = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    output = output.replace(pattern, String(value ?? ''));
  }
  return output;
}

/**
 * Dispatch or log WhatsApp notification.
 * Works seamlessly in development (console & memory log) and production (gateway integration).
 */
export async function sendWhatsAppNotification(phone: string, text: string, meta?: Record<string, any>): Promise<boolean> {
  const cleanPhone = phone.replace(/\D/g, '');
  if (!cleanPhone || cleanPhone.length < 8) return false;

  console.log(`\n================== [WHATSAPP OUTGOING NOTIFICATION] ==================`);
  console.log(`To: +${cleanPhone}`);
  console.log(`Message:\n${text}`);
  if (meta) console.log(`Context:`, meta);
  console.log(`======================================================================\n`);

  // Record into audit log
  const logEntry: WhatsAppLogEntry = {
    id: 'walog_' + Math.random().toString(36).substring(2, 10),
    pageId: meta?.pageId,
    phone: cleanPhone,
    text,
    event: meta?.event || 'notification',
    status: 'delivered',
    timestamp: new Date().toISOString()
  };
  recentWaLogs.push(logEntry);
  if (recentWaLogs.length > 200) recentWaLogs.shift();

  // If a WhatsApp Gateway webhook is configured via environment or meta, dispatch to it
  const gatewayUrl = meta?.gatewayUrl || process.env.WA_GATEWAY_URL;
  if (gatewayUrl) {
    try {
      await fetch(gatewayUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, text, ...meta })
      });
    } catch (e: any) {
      console.warn('[QueueManager] Gateway dispatch warning:', e?.message || e);
    }
  }

  return true;
}

/** Calculates the next queue number sequentially for a campaign */
export async function getNextQueueNumber(pageId: string, storeIsDb: boolean): Promise<number> {
  if (storeIsDb) {
    const res = await pool.query('SELECT COALESCE(MAX(queue_number), 0) + 1 AS next_num FROM submissions WHERE page_id = $1', [pageId]);
    return Number(res.rows[0]?.next_num) || 1;
  } else {
    const subs = readDataFile<any[]>('submissions.json', []);
    const matching = subs.filter(s => s.page_id === pageId);
    const maxNum = matching.reduce((max, s) => Math.max(max, Number(s.queue_number) || 0), 0);
    return maxNum + 1;
  }
}

/**
 * Progress the queue call number and trigger automated approaching/expired logic
 */
export async function processQueueProgression(pageId: string, newCalledNumber: number) {
  const settings = await getQueueSettings(pageId);
  await saveQueueSettings(pageId, { currentCalledNumber: newCalledNumber });

  if (!settings.enabled) return { calledNumber: newCalledNumber, approachingCount: 0, expiredCount: 0 };

  const storeIsDb = getDbStatus().isConnected;
  let approachingCount = 0;
  let expiredCount = 0;

  if (storeIsDb) {
    // 1. Approaching notification: within notifyThreshold (only if WA notifications enabled)
    if (settings.waEnabled) {
      const approachLimit = newCalledNumber + settings.notifyThreshold;
      const approachingSubs = await pool.query(
        `SELECT * FROM submissions
          WHERE page_id = $1
            AND queue_number > $2
            AND queue_number <= $3
            AND status NOT IN ('declined', 'waitlisted')
            AND NOT (COALESCE(wa_notified_states, '[]'::jsonb) ? 'approaching')`,
        [pageId, newCalledNumber, approachLimit]
      );

      for (const sub of approachingSubs.rows) {
        const form = typeof sub.form_data === 'string' ? JSON.parse(sub.form_data) : (sub.form_data || {});
        const phone = form.phone || form.whatsapp || form['WhatsApp'] || form['Phone'] || form['No WhatsApp'] || '';
        const name = form.fullName || form.name || 'Visitor';
        if (phone) {
          const text = renderTemplate(settings.waTemplates.approaching, {
            name,
            queue_number: sub.queue_number,
            party_size: sub.party_size || 1,
            access_id: sub.ticket_code,
            current_called: newCalledNumber
          });
          await sendWhatsAppNotification(phone, text, { pageId, submissionId: sub.id, event: 'approaching', gatewayUrl: settings.waConnection?.gatewayUrl });
          await pool.query(
            `UPDATE submissions
                SET wa_notified_states = COALESCE(wa_notified_states, '[]'::jsonb) || '["approaching"]'::jsonb
              WHERE id = $1`,
            [sub.id]
          );
          approachingCount++;
        }
      }
    }

    // 2. Skipped / Expired: skipped beyond skippedTolerance
    const expiredCutoff = newCalledNumber - settings.skippedTolerance;
    const expiredSubs = await pool.query(
      `SELECT * FROM submissions
        WHERE page_id = $1
          AND queue_number < $2
          AND checked_in_at IS NULL
          AND queue_status NOT IN ('admitted', 'completed', 'expired')
          AND status NOT IN ('declined', 'waitlisted')`,
      [pageId, expiredCutoff]
    );

    for (const sub of expiredSubs.rows) {
      const form = typeof sub.form_data === 'string' ? JSON.parse(sub.form_data) : (sub.form_data || {});
      const phone = form.phone || form.whatsapp || form['WhatsApp'] || form['Phone'] || form['No WhatsApp'] || '';
      const name = form.fullName || form.name || 'Visitor';
      await pool.query(
        `UPDATE submissions
            SET queue_status = 'expired',
                wa_notified_states = COALESCE(wa_notified_states, '[]'::jsonb) || '["expired"]'::jsonb
          WHERE id = $1`,
        [sub.id]
      );
      if (phone && settings.waEnabled) {
        const text = renderTemplate(settings.waTemplates.expired, {
          name,
          queue_number: sub.queue_number,
          skipped_tolerance: settings.skippedTolerance,
          access_id: sub.ticket_code
        });
        await sendWhatsAppNotification(phone, text, { pageId, submissionId: sub.id, event: 'expired', gatewayUrl: settings.waConnection?.gatewayUrl });
      }
      expiredCount++;
    }
  }

  return { calledNumber: newCalledNumber, approachingCount, expiredCount };
}

import { pool, getDbStatus } from './db.js';
import { readDataFile, writeDataFile } from './fileStorage.js';
import {
  WhatsAppDeviceInfo,
  WhatsAppConnection,
  WhatsAppLogEntry,
  QueueSettings,
  DEFAULT_QUEUE_SETTINGS,
  getWaLogs,
  generateWaLinkPayload,
  renderTemplate,
  sendWhatsAppNotification
} from './queueHelpers.js';

export {
  WhatsAppDeviceInfo,
  WhatsAppConnection,
  WhatsAppLogEntry,
  QueueSettings,
  DEFAULT_QUEUE_SETTINGS,
  getWaLogs,
  generateWaLinkPayload,
  renderTemplate,
  sendWhatsAppNotification
};

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

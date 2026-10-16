import { pool, getDbStatus } from './db.js';
import { readDataFile, writeDataFile } from './fileStorage.js';
import {
  type WhatsAppDeviceInfo,
  type WhatsAppConnection,
  type WhatsAppLogEntry,
  type QueueSettings,
  DEFAULT_QUEUE_SETTINGS,
  getWaLogs,
  generateWaLinkPayload,
  renderTemplate,
  sendWhatsAppNotification,
  extractPhoneNumber,
  normalizeWhatsAppNumber,
  formatWhatsAppDisplay
} from './queueHelpers.js';

export type { WhatsAppDeviceInfo, WhatsAppConnection, WhatsAppLogEntry, QueueSettings };
export {
  DEFAULT_QUEUE_SETTINGS,
  getWaLogs,
  generateWaLinkPayload,
  renderTemplate,
  sendWhatsAppNotification,
  extractPhoneNumber,
  normalizeWhatsAppNumber,
  formatWhatsAppDisplay
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

/** Calculates the next queue number sequentially for a campaign (optionally scoped per event date) */
export async function getNextQueueNumber(pageId: string, storeIsDb: boolean, eventDate?: string): Promise<number> {
  const cleanDate = (eventDate || '').trim();
  if (storeIsDb) {
    if (cleanDate) {
      const res = await pool.query(
        `SELECT COALESCE(MAX(queue_number), 0) + 1 AS next_num 
         FROM submissions 
         WHERE page_id = $1 
           AND (
             form_data->>'event_date' = $2 
             OR form_data->>'eventDate' = $2 
             OR form_data->>'Access Valid For' ILIKE '%' || $2 || '%'
             OR to_char(created_at, 'YYYY-MM-DD') = $2
           )`,
        [pageId, cleanDate]
      );
      return Number(res.rows[0]?.next_num) || 1;
    }
    const res = await pool.query('SELECT COALESCE(MAX(queue_number), 0) + 1 AS next_num FROM submissions WHERE page_id = $1', [pageId]);
    return Number(res.rows[0]?.next_num) || 1;
  } else {
    const subs = readDataFile<any[]>('submissions.json', []);
    const matching = subs.filter(s => {
      if (s.page_id !== pageId) return false;
      if (cleanDate) {
        const d = String(s.form_data?.event_date || s.form_data?.eventDate || s.form_data?.['Access Valid For'] || '');
        const createdDate = String(s.created_at || '').slice(0, 10);
        return d.toLowerCase().includes(cleanDate.toLowerCase()) || createdDate === cleanDate;
      }
      return true;
    });
    const maxNum = matching.reduce((max, s) => Math.max(max, Number(s.queue_number) || 0), 0);
    return maxNum + 1;
  }
}

/**
 * Progress the queue call number and trigger automated approaching/expired logic
 */
export async function processQueueProgression(pageId: string, newCalledNumber: number, reqBaseUrl?: string) {
  const settings = await getQueueSettings(pageId);
  await saveQueueSettings(pageId, { currentCalledNumber: newCalledNumber });

  if (!settings.enabled) return { calledNumber: newCalledNumber, approachingCount: 0, expiredCount: 0 };

  const storeIsDb = getDbStatus().isConnected;
  let approachingCount = 0;
  let expiredCount = 0;

  let brandSlug = 'atmos';
  let pageSlug = 'drop';

  if (storeIsDb) {
    try {
      const pRes = await pool.query('SELECT brand_slug, slug FROM pages WHERE id = $1 LIMIT 1', [pageId]);
      if (pRes.rows[0]) {
        brandSlug = pRes.rows[0].brand_slug || brandSlug;
        pageSlug = pRes.rows[0].slug || pageSlug;
      }
    } catch {
      // fallback
    }
  } else {
    try {
      const allPages = readDataFile<any[]>('pages.json', []);
      const pObj = allPages.find(p => p.id === pageId);
      if (pObj) {
        brandSlug = pObj.brand_slug || brandSlug;
        pageSlug = pObj.slug || pageSlug;
      }
    } catch {
      // fallback
    }
  }

  const baseAppUrl = reqBaseUrl || 
    (typeof process !== 'undefined' ? (process.env.APP_URL || process.env.PUBLIC_APP_URL || '') : '');

  const buildPassUrl = (sub: any) => {
    const bSlug = sub.brand_slug || brandSlug;
    const code = sub.ticket_code || '';
    const linkPath = `/${bSlug}/${pageSlug}?code=${code}`;
    return baseAppUrl ? `${baseAppUrl.replace(/\/$/, '')}${linkPath}` : linkPath;
  };

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
        const phone = extractPhoneNumber(form);
        const name = form.fullName || form.name || 'Visitor';
        if (phone) {
          const passUrl = buildPassUrl(sub);
          const text = renderTemplate(settings.waTemplates.approaching, {
            name,
            queue_number: sub.queue_number,
            party_size: sub.party_size || 1,
            access_id: sub.ticket_code,
            current_called: newCalledNumber,
            link: passUrl,
            epass_link: passUrl,
            pass_link: passUrl,
            pass_url: passUrl
          });
          await sendWhatsAppNotification(phone, text, {
            pageId,
            submissionId: sub.id,
            event: 'approaching',
            gatewayUrl: settings.waConnection?.gatewayUrl,
            apiToken: settings.waConnection?.apiToken,
            provider: settings.waConnection?.provider
          });
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
      const phone = extractPhoneNumber(form);
      const name = form.fullName || form.name || 'Visitor';
      await pool.query(
        `UPDATE submissions
            SET queue_status = 'expired',
                wa_notified_states = COALESCE(wa_notified_states, '[]'::jsonb) || '["expired"]'::jsonb
          WHERE id = $1`,
        [sub.id]
      );
      if (phone && settings.waEnabled) {
        const passUrl = buildPassUrl(sub);
        const text = renderTemplate(settings.waTemplates.expired, {
          name,
          queue_number: sub.queue_number,
          skipped_tolerance: settings.skippedTolerance,
          access_id: sub.ticket_code,
          link: passUrl,
          epass_link: passUrl,
          pass_link: passUrl,
          pass_url: passUrl,
          requeue_link: passUrl
        });
        await sendWhatsAppNotification(phone, text, {
          pageId,
          submissionId: sub.id,
          event: 'expired',
          gatewayUrl: settings.waConnection?.gatewayUrl,
          apiToken: settings.waConnection?.apiToken,
          provider: settings.waConnection?.provider
        });
      }
      expiredCount++;
    }
  } else {
    // Memory store fallback
    const subs = readDataFile<any[]>('submissions.json', []);
    const matching = subs.filter(s => s.page_id === pageId);

    // Approaching
    if (settings.waEnabled) {
      const approachLimit = newCalledNumber + settings.notifyThreshold;
      for (const sub of matching) {
        const qNum = Number(sub.queue_number) || 0;
        const notified = Array.isArray(sub.wa_notified_states) ? sub.wa_notified_states : [];
        if (qNum > newCalledNumber && qNum <= approachLimit && !notified.includes('approaching') && !['declined', 'waitlisted'].includes(sub.status)) {
          const form = sub.form_data || {};
          const phone = extractPhoneNumber(form);
          const name = form.fullName || form.name || 'Visitor';
          if (phone) {
            const passUrl = buildPassUrl(sub);
            const text = renderTemplate(settings.waTemplates.approaching, {
              name,
              queue_number: qNum,
              party_size: sub.party_size || 1,
              access_id: sub.ticket_code,
              current_called: newCalledNumber,
              link: passUrl,
              epass_link: passUrl,
              pass_link: passUrl,
              pass_url: passUrl
            });
            await sendWhatsAppNotification(phone, text, {
              pageId,
              submissionId: sub.id,
              event: 'approaching',
              gatewayUrl: settings.waConnection?.gatewayUrl,
              apiToken: settings.waConnection?.apiToken,
              provider: settings.waConnection?.provider
            });
            sub.wa_notified_states = [...notified, 'approaching'];
            approachingCount++;
          }
        }
      }
    }

    // Expired
    const expiredCutoff = newCalledNumber - settings.skippedTolerance;
    for (const sub of matching) {
      const qNum = Number(sub.queue_number) || 0;
      if (qNum < expiredCutoff && !sub.checked_in_at && !['admitted', 'completed', 'expired', 'declined', 'waitlisted'].includes(sub.queue_status)) {
        sub.queue_status = 'expired';
        const notified = Array.isArray(sub.wa_notified_states) ? sub.wa_notified_states : [];
        sub.wa_notified_states = [...notified, 'expired'];
        const form = sub.form_data || {};
        const phone = extractPhoneNumber(form);
        const name = form.fullName || form.name || 'Visitor';
        if (phone && settings.waEnabled) {
          const passUrl = buildPassUrl(sub);
          const text = renderTemplate(settings.waTemplates.expired, {
            name,
            queue_number: qNum,
            skipped_tolerance: settings.skippedTolerance,
            access_id: sub.ticket_code,
            link: passUrl,
            epass_link: passUrl,
            pass_link: passUrl,
            pass_url: passUrl,
            requeue_link: passUrl
          });
          await sendWhatsAppNotification(phone, text, {
            pageId,
            submissionId: sub.id,
            event: 'expired',
            gatewayUrl: settings.waConnection?.gatewayUrl,
            apiToken: settings.waConnection?.apiToken,
            provider: settings.waConnection?.provider
          });
        }
        expiredCount++;
      }
    }
    writeDataFile('submissions.json', subs);
  }

  return { calledNumber: newCalledNumber, approachingCount, expiredCount };
}

/**
 * Call the next batch of guests automatically based on available venue spots
 */
export async function processQueueBatch(pageId: string, requestedSpots: number, reqBaseUrl?: string) {
  const settings = await getQueueSettings(pageId);
  const spots = Math.max(1, requestedSpots || 1);
  const storeIsDb = getDbStatus().isConnected;

  let calledGuests: any[] = [];
  let newCalledNumber = settings.currentCalledNumber || 1;
  let approachingCount = 0;
  let expiredCount = 0;

  let brandSlug = 'atmos';
  let pageSlug = 'drop';

  if (storeIsDb) {
    try {
      const pRes = await pool.query('SELECT brand_slug, slug FROM pages WHERE id = $1 LIMIT 1', [pageId]);
      if (pRes.rows[0]) {
        brandSlug = pRes.rows[0].brand_slug || brandSlug;
        pageSlug = pRes.rows[0].slug || pageSlug;
      }
    } catch {
      // fallback
    }
  } else {
    try {
      const allPages = readDataFile<any[]>('pages.json', []);
      const pObj = allPages.find(p => p.id === pageId);
      if (pObj) {
        brandSlug = pObj.brand_slug || brandSlug;
        pageSlug = pObj.slug || pageSlug;
      }
    } catch {
      // fallback
    }
  }

  const baseAppUrl = reqBaseUrl || 
    (typeof process !== 'undefined' ? (process.env.APP_URL || process.env.PUBLIC_APP_URL || '') : '');

  const buildPassUrl = (sub: any) => {
    const bSlug = sub.brand_slug || brandSlug;
    const code = sub.ticket_code || '';
    const linkPath = `/${bSlug}/${pageSlug}?code=${code}`;
    return baseAppUrl ? `${baseAppUrl.replace(/\/$/, '')}${linkPath}` : linkPath;
  };

  if (storeIsDb) {
    // 1. Fetch unadmitted, waiting guests in queue order
    const waitingRes = await pool.query(
      `SELECT * FROM submissions
        WHERE page_id = $1
          AND checked_in_at IS NULL
          AND (queue_status = 'waiting' OR queue_status IS NULL)
          AND status NOT IN ('declined', 'waitlisted')
        ORDER BY queue_number ASC
        LIMIT 20`,
      [pageId]
    );

    let accumulatedParty = 0;
    for (const sub of waitingRes.rows) {
      const pSize = Number(sub.party_size) || 1;
      // If we haven't picked anyone yet, or if adding this party fits within available spots
      if (calledGuests.length === 0 || accumulatedParty + pSize <= spots) {
        accumulatedParty += pSize;
        calledGuests.push(sub);
        newCalledNumber = Math.max(newCalledNumber, Number(sub.queue_number) || 0);

        // Mark as called
        await pool.query(
          `UPDATE submissions
              SET queue_status = 'called',
                  wa_notified_states = COALESCE(wa_notified_states, '[]'::jsonb) || '["ready"]'::jsonb
            WHERE id = $1`,
          [sub.id]
        );

        // Send ready WhatsApp notification
        if (settings.waEnabled) {
          const form = typeof sub.form_data === 'string' ? JSON.parse(sub.form_data) : (sub.form_data || {});
          const phone = extractPhoneNumber(form);
          const name = form.fullName || form.name || 'Visitor';
          if (phone) {
            const passUrl = buildPassUrl(sub);
            const text = renderTemplate(settings.waTemplates.ready, {
              name,
              queue_number: sub.queue_number,
              party_size: pSize,
              access_id: sub.ticket_code,
              link: passUrl,
              epass_link: passUrl,
              pass_link: passUrl,
              pass_url: passUrl
            });
            await sendWhatsAppNotification(phone, text, {
              pageId,
              submissionId: sub.id,
              event: 'ready',
              gatewayUrl: settings.waConnection?.gatewayUrl,
              apiToken: settings.waConnection?.apiToken,
              provider: settings.waConnection?.provider
            });
          }
        }
      } else {
        // Spots filled
        break;
      }
    }
  } else {
    // Standalone memory / fileStorage
    const subs = readDataFile<any[]>('submissions.json', []);
    const matching = subs
      .filter(s => s.page_id === pageId && !s.checked_in_at && (!s.queue_status || s.queue_status === 'waiting') && !['declined', 'waitlisted'].includes(s.status))
      .sort((a, b) => (Number(a.queue_number) || 0) - (Number(b.queue_number) || 0));

    let accumulatedParty = 0;
    for (const sub of matching) {
      const pSize = Number(sub.party_size) || 1;
      if (calledGuests.length === 0 || accumulatedParty + pSize <= spots) {
        accumulatedParty += pSize;
        calledGuests.push(sub);
        newCalledNumber = Math.max(newCalledNumber, Number(sub.queue_number) || 0);
        sub.queue_status = 'called';
        sub.wa_notified_states = [...(sub.wa_notified_states || []), 'ready'];

        if (settings.waEnabled) {
          const form = sub.form_data || {};
          const phone = extractPhoneNumber(form);
          const name = form.fullName || form.name || 'Visitor';
          if (phone) {
            const passUrl = buildPassUrl(sub);
            const text = renderTemplate(settings.waTemplates.ready, {
              name,
              queue_number: sub.queue_number,
              party_size: pSize,
              access_id: sub.ticket_code,
              link: passUrl,
              epass_link: passUrl,
              pass_link: passUrl,
              pass_url: passUrl
            });
            await sendWhatsAppNotification(phone, text, {
              pageId,
              submissionId: sub.id,
              event: 'ready',
              gatewayUrl: settings.waConnection?.gatewayUrl,
              apiToken: settings.waConnection?.apiToken,
              provider: settings.waConnection?.provider
            });
          }
        }
      } else {
        break;
      }
    }
    writeDataFile('submissions.json', subs);
  }

  // Update currentCalledNumber and trigger approaching & expired logic
  if (calledGuests.length > 0) {
    await saveQueueSettings(pageId, { currentCalledNumber: newCalledNumber });
    const prog = await processQueueProgression(pageId, newCalledNumber, reqBaseUrl);
    approachingCount = prog.approachingCount;
    expiredCount = prog.expiredCount;
  }

  return {
    calledGuests,
    calledCount: calledGuests.length,
    newCalledNumber,
    approachingCount,
    expiredCount
  };
}


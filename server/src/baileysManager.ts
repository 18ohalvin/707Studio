import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { saveQueueSettings, getQueueSettings } from './queueManager.js';
import { formatWhatsAppDisplay } from './queueHelpers.js';

// Resolve sessions root directory
const cwd = process.cwd();
const candidateDirs = [
  process.env.WA_SESSIONS_DIR,
  path.resolve(cwd, 'data/wa_sessions'),
  path.resolve(cwd, 'server/data/wa_sessions')
].filter(Boolean) as string[];

let resolvedSessionsRoot = candidateDirs.find(d => fs.existsSync(d)) || candidateDirs[1] || path.resolve(cwd, 'data/wa_sessions');

try {
  if (!fs.existsSync(resolvedSessionsRoot)) {
    fs.mkdirSync(resolvedSessionsRoot, { recursive: true });
  }
} catch (e: any) {
  console.warn('[WA-Init] Could not create sessions root at', resolvedSessionsRoot, e?.message);
}

export const SESSIONS_ROOT = resolvedSessionsRoot;

export interface WaPageSession {
  pageId: string;
  status: 'disconnected' | 'connecting' | 'qr_ready' | 'connected' | 'rejected_mismatch';
  sock: any | null;
  phone: string | null;
  qrCodeDataUrl: string | null;
  expectedPhone: string | null;
  error: string | null;
  lastUpdated: string;
  isManualStop: boolean;
}

// In-memory sessions map (pageId -> session)
const sessions = new Map<string, WaPageSession>();

export function getPageSessionDir(pageId: string): string {
  const cleanId = String(pageId || 'default').replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(SESSIONS_ROOT, `page_${cleanId}`);
}

export function normalizePhoneDigits(phone: string | number, defaultCountryCode = '62'): string {
  if (!phone) return '';
  const raw = String(phone).trim();
  if (!raw) return '';

  const cleanDefaultCode = String(defaultCountryCode || '62').replace(/\D/g, '') || '62';

  // If raw string starts with '+', keep the explicit international country code
  if (raw.startsWith('+')) {
    let digits = raw.replace(/\D/g, '');
    if (digits.startsWith('6208')) {
      digits = '62' + digits.slice(3); // +62 0812 -> 62812
    } else if (digits.startsWith('6001')) {
      digits = '60' + digits.slice(3); // +60 012 -> 6012
    }
    return digits;
  }

  let digits = raw.replace(/\D/g, '');
  if (!digits) return '';

  // 1. Handle leading 0 (e.g. 0812... -> 62812...)
  if (digits.startsWith('0')) {
    digits = cleanDefaultCode + digits.replace(/^0+/, '');
  }
  // 2. Handle 6208... (e.g. 6208123456 -> 628123456)
  else if (digits.startsWith('6208')) {
    digits = '62' + digits.slice(3);
  }
  // 3. Handle Indonesian mobile numbers starting directly with '8' (e.g. 812..., 817...)
  else if (digits.startsWith('8') && digits.length >= 9 && digits.length <= 13) {
    digits = (cleanDefaultCode === '65' ? '65' : '62') + digits;
  }
  // 4. Handle Singapore 8-digit numbers (8xxx-xxxx or 9xxx-xxxx)
  else if (cleanDefaultCode === '65' && digits.length === 8 && (digits.startsWith('8') || digits.startsWith('9'))) {
    digits = '65' + digits;
  }
  // 5. If digits don't start with known country codes and is 9-12 digits long
  else if (!digits.startsWith('62') && !digits.startsWith('65') && !digits.startsWith('60') && !digits.startsWith('1') && !digits.startsWith('44')) {
    if (digits.startsWith('8') || digits.startsWith('9')) {
      digits = cleanDefaultCode + digits;
    }
  }

  return digits;
}

export function arePhonesMatching(phoneA: string, phoneB: string): boolean {
  const normA = normalizePhoneDigits(phoneA);
  const normB = normalizePhoneDigits(phoneB);
  if (!normA || !normB) return false;
  if (normA === normB) return true;
  if (normA.endsWith(normB) || normB.endsWith(normA)) {
    const minLen = Math.min(normA.length, normB.length);
    if (minLen >= 8) return true;
  }
  return false;
}

export function formatToWhatsAppJid(phone: string, defaultCountryCode = '62'): string | null {
  if (!phone) return null;
  const digits = normalizePhoneDigits(phone, defaultCountryCode);
  if (!digits || digits.length < 8) return null;
  return `${digits}@s.whatsapp.net`;
}

/**
 * Get current session info and status for a campaign page
 */
export function getPageStatus(pageId: string) {
  const session = sessions.get(pageId);
  if (!session) {
    const sessionDir = getPageSessionDir(pageId);
    const hasCreds = fs.existsSync(path.join(sessionDir, 'creds.json'));
    return {
      pageId,
      status: hasCreds ? 'saved_offline' : 'disconnected',
      connected: false,
      phone: null,
      qr: null,
      error: null,
      lastUpdated: new Date().toISOString()
    };
  }

  return {
    pageId,
    status: session.status,
    connected: session.status === 'connected',
    phone: session.phone || null,
    qr: session.qrCodeDataUrl || null,
    error: session.error || null,
    lastUpdated: session.lastUpdated || new Date().toISOString()
  };
}

/**
 * Initialize or connect WhatsApp Baileys session for a given page
 */
export async function initPageWhatsApp(pageId: string, options: { expectedPhone?: string } = {}) {
  const sessionDir = getPageSessionDir(pageId);
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }

  // If already connected, return status
  const existing = sessions.get(pageId);
  if (existing && existing.sock && existing.status === 'connected') {
    if (options.expectedPhone) existing.expectedPhone = options.expectedPhone;
    return getPageStatus(pageId);
  }

  const sessionData: WaPageSession = existing || {
    pageId,
    status: 'connecting',
    sock: null,
    phone: null,
    qrCodeDataUrl: null,
    expectedPhone: null,
    error: null,
    lastUpdated: new Date().toISOString(),
    isManualStop: false
  };

  sessionData.status = 'connecting';
  sessionData.isManualStop = false;
  sessionData.error = null;

  if (options.expectedPhone && options.expectedPhone.trim()) {
    sessionData.expectedPhone = options.expectedPhone.trim();
  }

  sessions.set(pageId, sessionData);

  try {
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const silentLogger = pino({ level: 'silent' });

    const sock = makeWASocket({
      auth: state,
      logger: silentLogger,
      printQRInTerminal: false,
      browser: ['707 Activation Hub', 'Chrome', '124.0.0']
    });

    sessionData.sock = sock;

    // Save updated credentials
    sock.ev.on('creds.update', saveCreds);

    // Connection lifecycle
    sock.ev.on('connection.update', async (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          sessionData.qrCodeDataUrl = await QRCode.toDataURL(qr, {
            margin: 2,
            width: 320,
            color: {
              dark: '#111827',
              light: '#FFFFFF'
            }
          });
          sessionData.status = 'qr_ready';
          sessionData.lastUpdated = new Date().toISOString();
          console.log(`[WA-${pageId}] Authentic Baileys QR generated. Ready for WhatsApp camera scan.`);
        } catch (qrErr) {
          console.error(`[WA-${pageId}] QR generation failed:`, qrErr);
        }
      }

      if (connection === 'open') {
        const rawUser = sock.user?.id || '';
        const cleanPhone = rawUser.split(':')[0].replace(/@.*$/, '');
        sessionData.phone = cleanPhone || sessionData.phone;

        // Security check if expected phone provided
        if (sessionData.expectedPhone) {
          const matches = arePhonesMatching(cleanPhone, sessionData.expectedPhone);
          if (!matches) {
            console.warn(`[WA-${pageId}] Phone mismatch: Linked +${cleanPhone} vs expected ${sessionData.expectedPhone}`);
            sessionData.status = 'rejected_mismatch';
            sessionData.error = `Security Rejection: Scanned phone (+${cleanPhone}) does not match expected store phone (${sessionData.expectedPhone}). Device unlinked for security.`;
            sessionData.qrCodeDataUrl = null;
            sessionData.lastUpdated = new Date().toISOString();

            try {
              await sock.logout();
            } catch {}
            try {
              if (fs.existsSync(sessionDir)) {
                fs.rmSync(sessionDir, { recursive: true, force: true });
              }
            } catch {}
            return;
          }
        }

        sessionData.status = 'connected';
        sessionData.error = null;
        sessionData.qrCodeDataUrl = null;
        sessionData.lastUpdated = new Date().toISOString();

        console.log(`[WA-${pageId}] WhatsApp Gateway Connected successfully! Linked Phone: +${sessionData.phone}`);

        // Persist connected state into page queue settings
        try {
          const formattedPhone = sessionData.phone ? formatWhatsAppDisplay(sessionData.phone) : '';
          await saveQueueSettings(pageId, {
            waEnabled: true,
            waConnection: {
              connected: true,
              phoneNumber: sessionData.phone || '',
              formattedNumber: formattedPhone,
              sessionName: '707 Studio Primary WhatsApp',
              provider: 'linked_device',
              linkedAt: new Date().toISOString(),
              deviceInfo: {
                platform: 'WhatsApp Multi-Device (Web)',
                pushName: sock.user?.name || '707 Activation Hub'
              }
            }
          });
        } catch (dbErr: any) {
          console.warn(`[WA-${pageId}] Could not sync linked state to DB:`, dbErr?.message);
        }
      } else if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const isLoggedOut = statusCode === DisconnectReason.loggedOut;

        console.log(`[WA-${pageId}] Connection closed. Code: ${statusCode}. Logged out: ${isLoggedOut}`);
        sessionData.qrCodeDataUrl = null;

        if (isLoggedOut || sessionData.isManualStop) {
          sessionData.status = 'disconnected';
          sessionData.phone = null;
          try {
            if (fs.existsSync(sessionDir)) {
              fs.rmSync(sessionDir, { recursive: true, force: true });
            }
          } catch (rmErr: any) {
            console.warn(`[WA-${pageId}] Error cleaning session folder:`, rmErr?.message);
          }

          try {
            await saveQueueSettings(pageId, {
              waConnection: {
                connected: false,
                phoneNumber: '',
                formattedNumber: '',
                sessionName: '',
                provider: 'linked_device'
              }
            });
          } catch {}
        } else {
          sessionData.status = 'disconnected';
          // Auto-reconnect after 3s
          setTimeout(() => {
            if (!sessionData.isManualStop) {
              console.log(`[WA-${pageId}] Reconnecting session...`);
              initPageWhatsApp(pageId).catch(err => {
                console.warn(`[WA-${pageId}] Reconnect failed:`, err?.message);
              });
            }
          }, 3000);
        }
      }
    });

    return getPageStatus(pageId);
  } catch (err: any) {
    sessionData.status = 'disconnected';
    sessionData.error = err?.message || 'Failed to initialize WhatsApp socket';
    console.error(`[WA-${pageId}] Init exception:`, err);
    return getPageStatus(pageId);
  }
}

/**
 * Disconnect and unlink a page's WhatsApp session
 */
export async function disconnectPageWhatsApp(pageId: string) {
  const session = sessions.get(pageId);
  const sessionDir = getPageSessionDir(pageId);

  if (session) {
    session.isManualStop = true;
    session.status = 'disconnected';
    session.qrCodeDataUrl = null;
    session.phone = null;

    if (session.sock) {
      try {
        await session.sock.logout();
      } catch {
        try {
          session.sock.end(undefined);
        } catch {}
      }
      session.sock = null;
    }
  }

  try {
    if (fs.existsSync(sessionDir)) {
      fs.rmSync(sessionDir, { recursive: true, force: true });
    }
  } catch (err: any) {
    console.warn(`[WA-${pageId}] Error deleting session files:`, err?.message);
  }

  sessions.delete(pageId);

  try {
    await saveQueueSettings(pageId, {
      waConnection: {
        connected: false,
        phoneNumber: '',
        formattedNumber: '',
        sessionName: '',
        provider: 'linked_device'
      }
    });
  } catch {}

  return { success: true, pageId, status: 'disconnected' };
}

/**
 * Send an authentic WhatsApp text notification from the linked Baileys socket
 */
export async function sendBaileysMessage(pageId: string, recipientPhone: string, messageText: string) {
  // 1. Try exact page session
  let session = sessions.get(pageId);
  let resolvedPageId = pageId;

  // 2. If not found or not connected, try case-insensitive or clean id match
  if (!session || !session.sock || session.status !== 'connected') {
    const targetClean = String(pageId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const [pId, s] of sessions.entries()) {
      if (s && s.sock && s.status === 'connected') {
        const sClean = String(pId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (sClean === targetClean) {
          session = s;
          resolvedPageId = pId;
          break;
        }
      }
    }
  }

  // 3. Fallback: Use ANY active connected session across the server
  if (!session || !session.sock || session.status !== 'connected') {
    for (const [pId, s] of sessions.entries()) {
      if (s && s.sock && s.status === 'connected') {
        console.log(`[WA-GATEWAY] Page "${pageId}" session not connected. Falling back to active session "${pId}".`);
        session = s;
        resolvedPageId = pId;
        break;
      }
    }
  }

  if (!session || !session.sock || session.status !== 'connected') {
    return {
      success: false,
      error: `WhatsApp device for page "${pageId}" is not linked or not currently connected.`,
      status: session ? session.status : 'disconnected'
    };
  }

  const phoneStr = String(recipientPhone || '').trim();
  const defaultCountry = (phoneStr.startsWith('+65') || phoneStr.startsWith('65')) ? '65' : '62';
  const jid = formatToWhatsAppJid(recipientPhone, defaultCountry);

  if (!jid) {
    return {
      success: false,
      error: `Invalid recipient phone number: "${recipientPhone}"`
    };
  }

  try {
    let targetJid = jid;

    // Check if number is registered on WhatsApp using Baileys onWhatsApp
    if (typeof session.sock.onWhatsApp === 'function') {
      try {
        const results = await session.sock.onWhatsApp(jid);
        if (Array.isArray(results) && results.length > 0 && results[0]?.exists && results[0]?.jid) {
          targetJid = results[0].jid;
        }
      } catch (onWaErr) {
        // Fallback to formatted jid
      }
    }

    const result = await session.sock.sendMessage(targetJid, { text: messageText });
    return {
      success: true,
      messageId: result?.key?.id,
      recipientPhone,
      jid: targetJid,
      pageId: resolvedPageId,
      timestamp: new Date().toISOString()
    };
  } catch (err: any) {
    console.error(`[WA-${pageId}] Error sending message to ${recipientPhone}:`, err);
    return {
      success: false,
      error: err?.message || 'Failed to dispatch WhatsApp message via Baileys socket'
    };
  }
}

/**
 * Automatically restore saved sessions from disk upon server boot
 */
export async function autoRestoreSessions() {
  if (!fs.existsSync(SESSIONS_ROOT)) {
    return [];
  }

  try {
    const dirs = fs.readdirSync(SESSIONS_ROOT, { withFileTypes: true });
    const restored: string[] = [];

    for (const d of dirs) {
      if (d.isDirectory() && d.name.startsWith('page_')) {
        const pageId = d.name.replace(/^page_/, '');
        const credsPath = path.join(SESSIONS_ROOT, d.name, 'creds.json');
        if (fs.existsSync(credsPath)) {
          console.log(`[WA-BOOT] Auto-restoring linked session for page: ${pageId}`);
          initPageWhatsApp(pageId).catch(err => {
            console.warn(`[WA-BOOT] Failed to restore session ${pageId}:`, err?.message);
          });
          restored.push(pageId);
        }
      }
    }

    return restored;
  } catch (err: any) {
    console.warn('[WA-BOOT] Could not auto-restore WhatsApp sessions:', err?.message);
    return [];
  }
}

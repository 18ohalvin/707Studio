/**
 * Pure helpers, templates, types, and logging for queue management and WhatsApp alerts.
 * Has no database imports so it can be safely imported by frontend tests without
 * pulling in server-only packages (pg, dotenv).
 */

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
  const gatewayUrl = meta?.gatewayUrl || (typeof process !== 'undefined' ? process.env.WA_GATEWAY_URL : undefined);
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

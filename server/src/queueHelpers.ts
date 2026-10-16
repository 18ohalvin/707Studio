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
  formattedNumber?: string;
  sessionName?: string;
  provider?: 'direct_sender' | 'fonnte' | 'wablas' | 'custom_gateway' | 'linked_device' | 'pairing_code';
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
  error?: string;
  timestamp: string;
}

export interface EmailTemplateConfig {
  subject: string;
  heading: string;
  body: string;
}

export interface QueueSettings {
  enabled: boolean;
  waEnabled: boolean;
  activeWaStage?: 'ready' | 'welcome' | 'approaching' | 'expired';
  emailNotificationEnabled?: boolean;
  maxCapacity: number;
  notifyThreshold: number;
  skippedTolerance: number;
  currentCalledNumber: number;
  waConnection?: WhatsAppConnection;
  waTemplates: Record<string, string>;
  emailTemplates?: {
    pass?: EmailTemplateConfig;
    ready?: EmailTemplateConfig;
  };
  stages?: any[];
}

export const DEFAULT_QUEUE_SETTINGS: QueueSettings = {
  enabled: true,
  waEnabled: false,
  activeWaStage: 'ready',
  emailNotificationEnabled: true,
  maxCapacity: 50,
  notifyThreshold: 10,
  skippedTolerance: 5,
  currentCalledNumber: 1,
  waConnection: {
    connected: false,
    phoneNumber: '',
    formattedNumber: '',
    sessionName: '707 Studio Primary WhatsApp',
    provider: 'direct_sender',
    deviceInfo: {
      platform: 'WhatsApp Multi-Device (Web)',
      pushName: '707 Activation Hub'
    }
  },
  waTemplates: {
    welcome: 'Hello {{name}}! You are registered in the queue with Queue Number #{{queue_number}} (Party: {{party_size}} guests). Track your live status here: {{link}}',
    approaching: 'Hello {{name}}! Your turn is approaching. The queue is currently serving near your number (#{{queue_number}}). Please proceed to the entrance area now. Live status: {{link}}',
    ready: 'Hello {{name}}! It is your turn to enter. Please present your Access ID {{access_id}} to the door staff at the entrance. Your pass: {{link}}',
    expired: 'Notice: {{name}}, queue number #{{queue_number}} was skipped past the grace margin and has expired. You can rejoin and regenerate a new queue number on your live pass here: {{link}}'
  },
  emailTemplates: {
    pass: {
      subject: 'Your 707 ticket for {{campaign}}',
      heading: 'Your ticket',
      body: 'Your e-ticket is attached to this email as a PDF. Track your live queue status and show your pass at the door.'
    },
    ready: {
      subject: "It's your turn to enter: {{campaign}}",
      heading: "It's Your Turn to Enter!",
      body: 'Your turn has arrived for {{campaign}}. Please proceed to the entrance area now and present your live pass to the door staff.'
    }
  }
};

/** Normalizes any international or Indonesian phone format to strict E.164 digits without leading zeros */
export function normalizeWhatsAppNumber(raw: string, defaultCountry = '62'): string {
  if (!raw) return '';
  let digits = String(raw).replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) digits = digits.slice(1);
  digits = digits.replace(/\D/g, '');
  if (!digits) return '';

  // Local Indonesian format e.g. 0812... -> 62812...
  if (digits.startsWith('0')) {
    digits = defaultCountry + digits.slice(1);
  }
  // Missing country code e.g. 8123456789 (9 to 13 digits) -> 628123456789
  else if (digits.startsWith('8') && digits.length >= 9 && digits.length <= 13) {
    digits = defaultCountry + digits;
  }
  return digits;
}

/** Formats clean digits into an international display string e.g. +62 812-3456-7890 */
export function formatWhatsAppDisplay(raw: string): string {
  const norm = normalizeWhatsAppNumber(raw);
  if (!norm) return '';
  if (norm.startsWith('62') && norm.length >= 10) {
    const rest = norm.slice(2);
    const p1 = rest.slice(0, 3);
    const p2 = rest.slice(3, 7);
    const p3 = rest.slice(7);
    return `+62 ${p1}-${p2}${p3 ? `-${p3}` : ''}`;
  }
  return `+${norm}`;
}

/** Extracts phone or WhatsApp number from any guest answer object regardless of exact key casing */
const PHONE_KEY_REGEX = /whats\s?app|phone|telp|telepon|\bwa\b|mobile|hp\b/i;
export function extractPhoneNumber(formData: Record<string, any> = {}): string {
  if (!formData || typeof formData !== 'object') return '';
  if (formData.phone) return String(formData.phone);
  if (formData.whatsapp) return String(formData.whatsapp);
  for (const [key, val] of Object.entries(formData)) {
    if (val && PHONE_KEY_REGEX.test(key)) {
      return String(val);
    }
  }
  return '';
}

/** In-memory buffer of recent outgoing notifications for live audit */
const recentWaLogs: WhatsAppLogEntry[] = [];

export function recordWaLog(entry: Omit<WhatsAppLogEntry, 'id' | 'timestamp'>) {
  recentWaLogs.push({
    ...entry,
    id: 'walog_' + Math.random().toString(36).substring(2, 10),
    timestamp: new Date().toISOString()
  });
  if (recentWaLogs.length > 200) recentWaLogs.shift();
}

export function getWaLogs(pageId?: string): WhatsAppLogEntry[] {
  if (!pageId) return [...recentWaLogs].reverse().slice(0, 30);
  return recentWaLogs.filter(l => !l.pageId || l.pageId === pageId).reverse().slice(0, 30);
}

/** Generate direct WhatsApp URL payload and normalized numbers */
export function generateWaLinkPayload(pageId: string, phoneNumber?: string) {
  const norm = normalizeWhatsAppNumber(phoneNumber || '');
  return {
    cleanPhone: norm,
    formattedDisplay: formatWhatsAppDisplay(norm),
    directLink: norm ? `https://wa.me/${norm}` : '',
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

type BaileysDispatcher = (pageId: string, phone: string, text: string) => Promise<{ success: boolean; error?: string; messageId?: string; [key: string]: any }>;
let globalBaileysDispatcher: BaileysDispatcher | null = null;

export function setBaileysDispatcher(dispatcher: BaileysDispatcher | null) {
  globalBaileysDispatcher = dispatcher;
}

/**
 * Dispatch or log WhatsApp notification.
 * Works seamlessly via Linked WhatsApp Web (Baileys), Cloud Gateway (Fonnte/Wablas/Meta), or direct link.
 */
export async function sendWhatsAppNotification(
  phone: string,
  text: string,
  meta?: Record<string, any>
): Promise<boolean> {
  const cleanPhone = normalizeWhatsAppNumber(phone);
  if (!cleanPhone || cleanPhone.length < 8) {
    console.warn(`[sendWhatsAppNotification] Invalid recipient phone number provided: "${phone}"`);
    recentWaLogs.push({
      id: 'walog_' + Math.random().toString(36).substring(2, 10),
      pageId: meta?.pageId,
      phone: phone || '(empty)',
      text,
      event: meta?.event || 'notification',
      status: 'failed',
      error: 'Invalid phone number format (min 8 digits required, e.g. 0812... or +62...)',
      timestamp: new Date().toISOString()
    });
    return false;
  }

  console.log(`\n================== [WHATSAPP OUTGOING NOTIFICATION] ==================`);
  console.log(`To: +${cleanPhone} (${formatWhatsAppDisplay(cleanPhone)})`);
  console.log(`Message:\n${text}`);
  if (meta) console.log(`Context:`, meta);
  console.log(`======================================================================\n`);

  let status: 'sent' | 'delivered' | 'failed' = 'sent';
  let deliveryError: string | undefined = undefined;

  // 1. Try Baileys Linked Device Dispatcher first (Zero Cost Direct)
  if (globalBaileysDispatcher) {
    const pageId = meta?.pageId || 'default';
    try {
      const baileysRes = await globalBaileysDispatcher(pageId, cleanPhone, text);
      if (baileysRes && baileysRes.success) {
        status = 'delivered';
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
        return true;
      } else if (baileysRes && !baileysRes.success) {
        status = 'failed';
        deliveryError = baileysRes.error || 'Linked WhatsApp device is not connected';
        console.warn(`[WA-GATEWAY] Baileys dispatch failed for page "${pageId}": ${deliveryError}`);
      }
    } catch (bErr: any) {
      console.warn('[QueueManager] Baileys dispatch exception:', bErr?.message);
    }
  }

  // 2. If a WhatsApp Gateway webhook or URL is configured
  const gatewayUrl = meta?.gatewayUrl || (typeof process !== 'undefined' ? process.env.WA_GATEWAY_URL : undefined);
  const apiToken = meta?.apiToken || (typeof process !== 'undefined' ? process.env.WA_GATEWAY_TOKEN : undefined);
  const provider = meta?.provider || 'direct_sender';

  if (gatewayUrl) {
    try {
      let headers: Record<string, string> = { 'Content-Type': 'application/json' };
      let body: any = {};

      if (gatewayUrl.includes('api.fonnte.com') || provider === 'fonnte') {
        if (apiToken) headers['Authorization'] = apiToken.trim();
        body = { target: cleanPhone, message: text };
      } else if (gatewayUrl.includes('wablas.com') || provider === 'wablas') {
        if (apiToken) headers['Authorization'] = apiToken.trim();
        body = { phone: cleanPhone, message: text };
      } else if (gatewayUrl.includes('graph.facebook.com') || provider === 'meta_cloud') {
        if (apiToken) headers['Authorization'] = apiToken.startsWith('Bearer ') ? apiToken : `Bearer ${apiToken.trim()}`;
        body = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'text',
          text: { preview_url: false, body: text }
        };
      } else {
        if (apiToken) headers['Authorization'] = apiToken.startsWith('Bearer ') ? apiToken : `Bearer ${apiToken.trim()}`;
        body = { phone: cleanPhone, target: cleanPhone, to: cleanPhone, message: text, text, ...meta };
      }

      const res = await fetch(gatewayUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      const resText = await res.text();
      let resJson: any = null;
      try {
        resJson = JSON.parse(resText);
      } catch {
        // Not JSON
      }

      if (!res.ok) {
        status = 'failed';
        const errorDetail = resJson?.message || resJson?.reason || resJson?.error?.message || resText.slice(0, 150);
        deliveryError = `Gateway returned HTTP ${res.status}: ${errorDetail}`;
        console.warn(`[QueueManager] Gateway dispatch error (${res.status}):`, deliveryError);
      } else if (resJson) {
        // Providers like Fonnte return HTTP 200 with { status: false, reason: "device disconnect" }
        if (resJson.status === false || resJson.success === false) {
          status = 'failed';
          deliveryError = resJson.reason || resJson.message || resJson.error || 'Gateway rejected message dispatch';
          console.warn('[QueueManager] Gateway returned rejection:', deliveryError);
        } else {
          status = 'delivered';
        }
      } else {
        status = 'delivered';
      }
    } catch (e: any) {
      status = 'failed';
      deliveryError = e?.message || String(e);
      console.warn('[QueueManager] Gateway dispatch exception:', deliveryError);
    }
  } else if (status !== 'failed') {
    // Direct WhatsApp mode: Recorded as sent / available for 1-tap wa.me link
    status = 'sent';
  }

  // Record into audit log
  const logEntry: WhatsAppLogEntry = {
    id: 'walog_' + Math.random().toString(36).substring(2, 10),
    pageId: meta?.pageId,
    phone: cleanPhone,
    text,
    event: meta?.event || 'notification',
    status,
    error: deliveryError,
    timestamp: new Date().toISOString()
  };
  recentWaLogs.push(logEntry);
  if (recentWaLogs.length > 200) recentWaLogs.shift();

  return status !== 'failed';
}

import type { Request } from 'express';

/**
 * The address guests reach the app at, for links sent over WhatsApp / email.
 * APP_URL wins when set; otherwise it is read from the request, honouring the
 * reverse proxy's forwarded headers (behind one, req.protocol is "http" and the
 * link would not open on the https site).
 */
export function publicBaseUrl(req?: Request): string {
  const configured = (process.env.APP_URL || process.env.PUBLIC_APP_URL || '').trim();
  if (configured) return configured.replace(/\/+$/, '');
  if (!req) return '';
  const first = (v: unknown) => String(v || '').split(',')[0].trim();
  const proto = first(req.headers['x-forwarded-proto']) || req.protocol;
  const host = first(req.headers['x-forwarded-host']) || req.get('host');
  return host ? `${proto}://${host}` : '';
}

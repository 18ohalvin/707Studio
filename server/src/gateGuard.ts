import { Request, Response, NextFunction } from 'express';
import { optionalClaims, accountStillActive } from './auth.js';

/**
 * Gate-security accounts (door staff, possibly from outside the company) may use the
 * door scanner and nothing else. This guard sits in front of every /api route and, for
 * such an account only:
 *  - refuses the request if the account was suspended or has expired, even with a token
 *    that is still valid;
 *  - refuses every route the scanner does not use (editing, guest export, status changes,
 *    deleting, raffle, ticket emails, team, media, ...);
 *  - and trims what the scanner is given: a guest's email, other answers and device data
 *    never reach the tablet, and only the last four digits of the phone number do.
 * Everyone else passes through untouched.
 */

const PHONE_KEY = /whats\s?app|phone|telp|telepon|\bwa\b|mobile|hp\b/i;
const KEPT_ANSWERS = ['fullName', 'Guest Type', 'Access Valid For'];

/** What a gate account may call. Paths are relative to /api. */
function allowed(method: string, path: string): boolean {
  const p = path.replace(/\/+$/, '') || '/';
  if (method === 'GET' && (p === '/health' || p === '/auth/session' || p === '/brands')) return true;
  if (method === 'POST' && p === '/auth/logout') return true;
  if (method === 'GET' && (p === '/pages' || p === '/submissions')) return true;
  if (method === 'POST' && p === '/submissions/check-in') return true;
  // Cancel a wrong admit (the body is limited to check-in state below).
  if (method === 'PATCH' && /^\/submissions\/[^/]+$/.test(p) && p !== '/submissions/check-in') return true;
  return false;
}

export function scrubSubmission(row: any): any {
  if (!row || typeof row !== 'object') return row;
  const form = typeof row.form_data === 'string' ? safeParse(row.form_data) : (row.form_data || {});
  const form_data: Record<string, unknown> = {};
  for (const key of KEPT_ANSWERS) if (form[key] !== undefined) form_data[key] = form[key];
  for (const key of Object.keys(form)) {
    if (PHONE_KEY.test(key) && form[key]) {
      form_data[key] = String(form[key]).replace(/\D/g, '').slice(-4);
      break;
    }
  }
  return {
    id: row.id,
    page_id: row.page_id,
    brand_slug: row.brand_slug,
    submission_type: row.submission_type,
    status: row.status,
    ticket_code: row.ticket_code,
    checked_in_at: row.checked_in_at,
    checked_in_by: row.checked_in_by,
    created_at: row.created_at,
    duplicate_of: row.duplicate_of,
    form_data
  };
}

function scrubProject(p: any) {
  const pages = typeof p?.pages === 'string' ? safeParse(p.pages) : p?.pages;
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    brand_slug: p.brand_slug,
    status: p.status,
    pages: Array.isArray(pages) ? pages.map((pg: any) => ({ id: pg?.id })) : []
  };
}

function safeParse(text: string): any {
  try { return JSON.parse(text); } catch { return {}; }
}

/** Rewrites the JSON this request is about to send, per route. */
function scrubBody(path: string, body: any): any {
  if (!body || typeof body !== 'object') return body;
  const p = path.replace(/\/+$/, '') || '/';
  if (p === '/pages' && Array.isArray(body.data)) return { ...body, data: body.data.map(scrubProject) };
  if (p.startsWith('/submissions')) {
    if (Array.isArray(body.data)) return { ...body, data: body.data.map(scrubSubmission) };
    if (body.data && typeof body.data === 'object') return { ...body, data: scrubSubmission(body.data) };
  }
  return body;
}

export async function gateGuard(req: Request, res: Response, next: NextFunction) {
  const claims = optionalClaims(req);
  if (!claims || claims.role !== 'gate') return next();

  try {
    if (!(await accountStillActive(claims.sub))) {
      return res.status(401).json({ success: false, error: 'This account is no longer active. Please sign in again or contact Superadmin.' });
    }
  } catch {
    return res.status(503).json({ success: false, error: 'Could not verify this account right now. Please try again.' });
  }

  // Taken now: inside a router req.path is relative to where the router is mounted.
  const path = req.path;
  if (!allowed(req.method, path)) {
    return res.status(403).json({ success: false, error: 'This account can only use the door scanner.' });
  }

  // A cancelled admit may only change check-in state, never a guest's status.
  if (req.method === 'PATCH' && req.body && typeof req.body === 'object') {
    const { checked_in, operator } = req.body;
    req.body = { checked_in, operator };
  }

  const originalJson = res.json.bind(res);
  res.json = ((body: any) => originalJson(scrubBody(path, body))) as typeof res.json;
  next();
}

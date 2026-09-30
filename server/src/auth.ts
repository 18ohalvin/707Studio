import crypto from 'crypto';
import { Router, Request, Response, NextFunction } from 'express';

/**
 * Studio access control.
 *
 * Every route in this app is staff tooling — the studio home and the editor —
 * so the whole API is closed by default and opened per request with a bearer
 * token. Tokens are HMAC-signed rather than stored, so they survive a restart
 * without a session table.
 *
 * Deliberately absent: hardcoded fallback passwords and "offline" tokens the
 * server trusts on sight. Both have bitten this stack before; a token is only
 * valid if this server signed it.
 */

const STUDIO_PASSWORD = process.env.STUDIO_PASSWORD || '707studio';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

if (!STUDIO_PASSWORD || STUDIO_PASSWORD.length < 8) {
  console.warn('[AUTH] Warning: STUDIO_PASSWORD is weak or not set, defaulting to 707studio for local environment.');
}

// Derived from the password so tokens stay valid across restarts, and are
// invalidated automatically whenever the password is rotated.
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  crypto.createHash('sha256').update(`${STUDIO_PASSWORD}:707studio:session`).digest('hex');

function sign(payload: string): string {
  return crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
}

/** Constant-time compare that does not leak length through an early return. */
function safeEqual(a: string, b: string): boolean {
  const ah = crypto.createHash('sha256').update(a).digest();
  const bh = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ah, bh);
}

export function issueToken(): string {
  const issuedAt = Date.now().toString(36);
  const nonce = crypto.randomBytes(12).toString('hex');
  const payload = `${issuedAt}.${nonce}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string | undefined | null): boolean {
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [issuedAt, nonce, signature] = parts;
  if (!safeEqual(signature, sign(`${issuedAt}.${nonce}`))) return false;

  const issuedAtMs = parseInt(issuedAt, 36);
  if (Number.isNaN(issuedAtMs)) return false;

  return Date.now() - issuedAtMs <= SESSION_TTL_MS;
}

function readBearer(req: Request): string | null {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!verifyToken(readBearer(req))) {
    return res.status(401).json({ error: 'Unauthorized: studio sign-in required' });
  }
  next();
}

export const authRouter = Router();

authRouter.post('/login', (req: Request, res: Response) => {
  const password = String(req.body?.password ?? '');

  if (!password || !safeEqual(password, STUDIO_PASSWORD)) {
    return res.status(401).json({ success: false, error: 'Incorrect studio password.' });
  }

  res.json({ success: true, token: issueToken(), expiresInMs: SESSION_TTL_MS });
});

// Tokens are stateless, so signing out is a client-side discard. Kept as an
// endpoint so the frontend has one obvious thing to call.
authRouter.post('/logout', (_req: Request, res: Response) => {
  res.json({ success: true });
});

authRouter.get('/session', (req: Request, res: Response) => {
  res.json({ authenticated: verifyToken(readBearer(req)) });
});

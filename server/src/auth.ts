import crypto from 'crypto';
import { Router, Request, Response, NextFunction } from 'express';
import { pool, getDbStatus } from './db.js';
import { readDataFile, writeDataFile } from './fileStorage.js';
import { hashPassword, verifyPassword, isHashed, withoutPassword } from './password.js';

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

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Convenience for running the studio locally without setting anything up. It
// applies outside production only — in production a missing password must stop
// the server, not silently fall back to one that is public in this repository.
const DEV_FALLBACK_PASSWORD = '707studio';

const STUDIO_PASSWORD =
  process.env.STUDIO_PASSWORD || (IS_PRODUCTION ? '' : DEV_FALLBACK_PASSWORD);

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

if (IS_PRODUCTION) {
  if (!STUDIO_PASSWORD) {
    console.error(
      '[FATAL] STUDIO_PASSWORD is not set — refusing to start rather than exposing the studio and its submissions publicly.'
    );
    process.exit(1);
  }

  if (STUDIO_PASSWORD.length < 8) {
    console.error('[FATAL] STUDIO_PASSWORD must be at least 8 characters in production.');
    process.exit(1);
  }
} else if (!process.env.STUDIO_PASSWORD) {
  console.warn(
    `[AUTH] STUDIO_PASSWORD not set — using the development password "${DEV_FALLBACK_PASSWORD}". Production will refuse to start without a real one.`
  );
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


// ----------------------------------------------------
// Team sign-in
// ----------------------------------------------------
// Until now the browser downloaded every account — passwords included — and
// compared them itself, and the superadmin passkeys were constants in a public
// repository. Both checks now happen here, and no password ever leaves the
// server.

type Account = Record<string, any>;

async function findAccount(identifier: string): Promise<Account | null> {
  const needle = identifier.trim().toLowerCase();
  if (!needle) return null;

  if (getDbStatus().isConnected) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE LOWER(email) = $1 OR LOWER(name) = $1 OR LOWER(id) = $1 LIMIT 1',
        [needle]
      );
      if (result.rows.length > 0) return result.rows[0];
      return null;
    } catch (err: any) {
      console.warn('[Auth] Could not query users:', err.message);
    }
  }

  const stored = readDataFile<any[]>('users.json', []);
  return (
    stored.find(
      (u) =>
        String(u.email || '').toLowerCase() === needle ||
        String(u.name || '').toLowerCase() === needle ||
        String(u.id || '').toLowerCase() === needle
    ) || null
  );
}

/** Replaces a legacy clear-text password with a hash, once, on a good sign-in. */
async function upgradeStoredPassword(account: Account, plain: string): Promise<void> {
  const hashed = hashPassword(plain);
  if (getDbStatus().isConnected) {
    try {
      await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, account.id]);
      return;
    } catch (err: any) {
      console.warn('[Auth] Could not upgrade stored password:', err.message);
    }
  }
  const stored = readDataFile<any[]>('users.json', []);
  const idx = stored.findIndex((u) => u.id === account.id);
  if (idx >= 0) {
    stored[idx].password = hashed;
    writeDataFile('users.json', stored);
  }
}

function toClientUser(account: Account) {
  const assigned = account.assigned_brands ?? account.assignedBrands ?? ['all'];
  return withoutPassword({
    id: account.id,
    name: account.name,
    email: account.email,
    phone: account.phone || '',
    role: account.role || 'editor',
    assignedBrands: typeof assigned === 'string' ? JSON.parse(assigned) : assigned,
    avatarUrl: account.avatar_url ?? account.avatarUrl ?? '',
    status: account.status || 'active',
    createdAt: account.created_at ?? account.createdAt,
    lastActiveAt: account.last_active_at ?? account.lastActiveAt ?? 'Recently'
  });
}

const SUPERADMIN_USER = {
  id: 'superadmin_master',
  name: 'Superadmin',
  email: 'admin@707designstudio.internal',
  role: 'superadmin',
  assignedBrands: ['all'],
  status: 'active',
  createdAt: new Date().toISOString()
};

authRouter.post('/signin', async (req: Request, res: Response) => {
  const identifier = String(req.body?.identifier ?? '').trim();
  const password = String(req.body?.password ?? '').trim();

  if (!password) {
    return res.status(400).json({ success: false, error: 'Please enter your password or PIN.' });
  }

  // The superadmin passkey is the configured studio password, not a constant
  // in the source.
  if (safeEqual(password, STUDIO_PASSWORD)) {
    return res.json({
      success: true,
      token: issueToken(),
      user: SUPERADMIN_USER,
      isSuperAdmin: true,
      expiresInMs: SESSION_TTL_MS
    });
  }

  if (!identifier) {
    return res.status(401).json({ success: false, error: 'Incorrect master passkey PIN for Superadmin.' });
  }

  const account = await findAccount(identifier);
  if (!account) {
    return res.status(401).json({
      success: false,
      error: 'Account not found. Access is restricted to team accounts registered by Superadmin.'
    });
  }

  if (String(account.status || 'active') === 'suspended') {
    return res.status(403).json({
      success: false,
      error: 'This account has been suspended. Please contact Superadmin.'
    });
  }

  const stored = String(account.password || '');
  if (!stored || !verifyPassword(password, stored)) {
    return res.status(401).json({
      success: false,
      error: 'Incorrect password. Please verify your credentials and try again.'
    });
  }

  if (!isHashed(stored)) {
    await upgradeStoredPassword(account, password);
  }

  res.json({
    success: true,
    token: issueToken(),
    user: toClientUser(account),
    isSuperAdmin: String(account.role) === 'superadmin',
    expiresInMs: SESSION_TTL_MS
  });
});

// Tokens are stateless, so signing out is a client-side discard. Kept as an
// endpoint so the frontend has one obvious thing to call.
authRouter.post('/logout', (_req: Request, res: Response) => {
  res.json({ success: true });
});

authRouter.get('/session', (req: Request, res: Response) => {
  res.json({ authenticated: verifyToken(readBearer(req)) });
});

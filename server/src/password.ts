import crypto from 'crypto';

/**
 * Password hashing for team accounts.
 *
 * Accounts were stored with the password in clear text and handed out by
 * GET /api/users, so anyone could read every password including the
 * superadmin's. Passwords are hashed from now on, and an account still holding
 * a clear-text password is upgraded the first time its owner signs in — nobody
 * has to be told to reset anything.
 *
 * scrypt comes with Node, deliberately: adding bcrypt would pull in a native
 * module, and native builds on this deploy server have broken before.
 */

const PREFIX = 'scrypt$';
const KEY_LENGTH = 32;

export function hashPassword(plain: string): string {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(plain, salt, KEY_LENGTH);
  return `${PREFIX}${salt.toString('hex')}$${derived.toString('hex')}`;
}

export function isHashed(stored: string): boolean {
  return typeof stored === 'string' && stored.startsWith(PREFIX);
}

function safeEqual(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Verifies a password against either a stored hash or a legacy clear-text value. */
export function verifyPassword(plain: string, stored: string): boolean {
  if (!stored) return false;

  if (!isHashed(stored)) {
    // Legacy clear-text. Compared in constant time all the same.
    return safeEqual(
      crypto.createHash('sha256').update(plain).digest(),
      crypto.createHash('sha256').update(stored).digest()
    );
  }

  const [, saltHex, hashHex] = stored.split('$');
  if (!saltHex || !hashHex) return false;

  try {
    const derived = crypto.scryptSync(plain, Buffer.from(saltHex, 'hex'), KEY_LENGTH);
    return safeEqual(derived, Buffer.from(hashHex, 'hex'));
  } catch {
    return false;
  }
}

/** Removes the password from anything on its way to a browser. */
export function withoutPassword<T extends Record<string, any>>(user: T): Omit<T, 'password'> {
  const { password, ...rest } = user;
  return rest;
}

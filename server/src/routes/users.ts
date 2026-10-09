import { Router, Request, Response } from 'express';
import { pool, getDbStatus } from '../db.js';
import { readDataFile, writeDataFile } from '../fileStorage.js';
import { hashPassword, withoutPassword } from '../password.js';
import { getClaims, isSuperAdminClaims } from '../auth.js';

export const usersRouter = Router();

/**
 * Gate-security accounts (door scanner only) must name the one campaign they may scan and
 * the moment they stop working. Returns an error message, or null when the fields are fine.
 */
function gateProblem(role: unknown, assignedProject: unknown, expiresAt: unknown): string | null {
  if (role !== 'gate') return null;
  if (!String(assignedProject || '').trim()) return 'A gate account needs the campaign it may scan.';
  const at = new Date(String(expiresAt || '')).getTime();
  if (!expiresAt || Number.isNaN(at)) return 'A gate account needs an expiry date and time.';
  if (at <= Date.now()) return 'The expiry must be in the future.';
  return null;
}

/** The account as the studio UI sees it (never the password). */
function clientUser(r: any) {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone || '',
    role: r.role || 'editor',
    assignedBrands: typeof r.assigned_brands === 'string' ? JSON.parse(r.assigned_brands) : (r.assigned_brands || ['all']),
    assignedProject: r.assigned_project || '',
    expiresAt: r.expires_at || null,
    avatarUrl: r.avatar_url || '',
    status: r.status || 'active',
    createdAt: r.created_at,
    lastActiveAt: r.last_active_at || 'Recently'
  };
}

/**
 * Team accounts are managed by the superadmin. Anyone else may only edit their
 * own profile, and never their own role, brands or status — before this any
 * signed-in brand editor could create a superadmin account.
 */
const SELF_EDITABLE = new Set(['name', 'email', 'phone', 'password', 'avatarUrl']);

usersRouter.use((req: Request, res: Response, next) => {
  if (req.method === 'GET') return next();
  const claims = getClaims(res);
  if (isSuperAdminClaims(claims)) return next();

  if (req.method === 'PUT') {
    const target = String(req.params?.id || req.path.slice(1) || '');
    const isSelf = decodeURIComponent(target) === claims.sub || decodeURIComponent(target).toLowerCase() === claims.email.toLowerCase();
    if (isSelf) {
      req.body = Object.fromEntries(Object.entries(req.body || {}).filter(([k]) => SELF_EDITABLE.has(k)));
      return next();
    }
  }
  return res.status(403).json({ success: false, error: 'Only the superadmin can manage team accounts.' });
});

// Persistent fallback storage for standalone mode
let inMemoryUsers: any[] = readDataFile<any[]>('users.json', []);

// GET /api/users - List all users / team accounts
usersRouter.get('/', async (req: Request, res: Response) => {
  if (getDbStatus().isConnected) {
    try {
      const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
      const formatted = result.rows.map(clientUser);
      return res.json({ success: true, data: formatted });
    } catch (err: any) {
      console.error('[DB] Error fetching users from DB:', err.message);
    }
  }
  inMemoryUsers = readDataFile<any[]>('users.json', inMemoryUsers);
  // Never hand the stored password to a browser.
  return res.json({ success: true, data: inMemoryUsers.map(withoutPassword) });
});

// POST /api/users - Create new team user
usersRouter.post('/', async (req: Request, res: Response) => {
  const { name, email, phone, password, role, assignedBrands, avatarUrl, status, assignedProject, expiresAt } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, error: 'Name and email are required.' });
  }
  const problem = gateProblem(role, assignedProject, expiresAt);
  if (problem) return res.status(400).json({ success: false, error: problem });

  // The name can be used to sign in, so two accounts must not share one.
  if (getDbStatus().isConnected) {
    try {
      const clash = await pool.query('SELECT 1 FROM users WHERE LOWER(name) = LOWER($1) AND LOWER(email) <> $2 LIMIT 1', [String(name).trim(), String(email).trim().toLowerCase()]);
      if (clash.rows.length) return res.status(409).json({ success: false, error: 'Another account already uses that name. Use a different name so sign-in by name stays unambiguous.' });
    } catch (err: any) {
      console.warn('[DB] Could not check for a duplicate name:', err.message);
    }
  }

  const newUser = {
    id: `user_${Date.now()}`,
    name,
    email: email.trim().toLowerCase(),
    phone: phone || '',
    password: password ? hashPassword(password) : '',
    role: role || 'editor',
    // A gate account is tied to one campaign, not to brands.
    assignedBrands: role === 'gate' ? [] : (Array.isArray(assignedBrands) ? assignedBrands : [assignedBrands || 'all']),
    assignedProject: role === 'gate' ? String(assignedProject) : '',
    expiresAt: role === 'gate' ? new Date(String(expiresAt)).toISOString() : null,
    avatarUrl: avatarUrl || '',
    status: status || 'active',
    createdAt: new Date().toISOString(),
    lastActiveAt: 'Just now'
  };

  if (getDbStatus().isConnected) {
    try {
      const result = await pool.query(
        `INSERT INTO users (id, name, email, phone, password, role, assigned_brands, avatar_url, status, created_at, last_active_at, assigned_project, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (email) DO UPDATE SET
           name = EXCLUDED.name,
           phone = EXCLUDED.phone,
           password = EXCLUDED.password,
           role = EXCLUDED.role,
           assigned_brands = EXCLUDED.assigned_brands,
           status = EXCLUDED.status,
           assigned_project = EXCLUDED.assigned_project,
           expires_at = EXCLUDED.expires_at
         RETURNING *`,
        [
          newUser.id,
          newUser.name,
          newUser.email,
          newUser.phone,
          newUser.password,
          newUser.role,
          JSON.stringify(newUser.assignedBrands),
          newUser.avatarUrl,
          newUser.status,
          newUser.createdAt,
          newUser.lastActiveAt,
          newUser.assignedProject || null,
          newUser.expiresAt
        ]
      );
      return res.status(201).json({ success: true, data: clientUser(result.rows[0]) });
    } catch (err: any) {
      console.error('[DB] Error saving user to DB:', err.message);
    }
  }

  inMemoryUsers = readDataFile<any[]>('users.json', inMemoryUsers);
  inMemoryUsers.unshift(newUser);
  writeDataFile('users.json', inMemoryUsers);
  return res.status(201).json({ success: true, data: withoutPassword(newUser) });
});

// PUT /api/users/:id - Update user / reset password
usersRouter.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  // Moving an account to (or keeping it on) the gate role needs the gate fields.
  if (updates.role === 'gate') {
    const problem = gateProblem('gate', updates.assignedProject, updates.expiresAt);
    if (problem) return res.status(400).json({ success: false, error: problem });
    updates.assignedBrands = [];
    updates.expiresAt = new Date(String(updates.expiresAt)).toISOString();
  }

  inMemoryUsers = readDataFile<any[]>('users.json', inMemoryUsers);
  const idx = inMemoryUsers.findIndex(u => u.id === id || u.email === id);
  if (idx !== -1) {
    const fileUpdates = { ...updates };
    if (fileUpdates.password) fileUpdates.password = hashPassword(fileUpdates.password);
    inMemoryUsers[idx] = { ...inMemoryUsers[idx], ...fileUpdates };
    writeDataFile('users.json', inMemoryUsers);
  }

  if (getDbStatus().isConnected) {
    try {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.email !== undefined) dbUpdates.email = updates.email.trim().toLowerCase();
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.password !== undefined) dbUpdates.password = updates.password ? hashPassword(updates.password) : '';
      if (updates.role !== undefined) dbUpdates.role = updates.role;
      if (updates.assignedBrands !== undefined) dbUpdates.assigned_brands = JSON.stringify(updates.assignedBrands);
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.assignedProject !== undefined) dbUpdates.assigned_project = updates.assignedProject || null;
      if (updates.expiresAt !== undefined) dbUpdates.expires_at = updates.expiresAt || null;
      // Leaving the gate role drops the gate scope.
      if (updates.role !== undefined && updates.role !== 'gate' && updates.assignedProject === undefined) {
        dbUpdates.assigned_project = null;
        dbUpdates.expires_at = null;
      }

      const fields = Object.keys(dbUpdates);
      if (fields.length > 0) {
        const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
        const values = fields.map(f => dbUpdates[f]);
        values.push(id);
        const result = await pool.query(
          `UPDATE users SET ${setClause} WHERE id = $${values.length} OR email = $${values.length} RETURNING *`,
          values
        );
        if (result.rows.length > 0) {
          return res.json({ success: true, data: clientUser(result.rows[0]) });
        }
      }
    } catch (err: any) {
      console.error('[DB] Error updating user in DB:', err.message);
    }
  }

  const updated = inMemoryUsers.find(u => u.id === id || u.email === id);
  return res.json({ success: true, data: withoutPassword(updated || updates) });
});

// DELETE /api/users/:id - Delete user account
usersRouter.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  inMemoryUsers = inMemoryUsers.filter(u => u.id !== id && u.email !== id);
  writeDataFile('users.json', inMemoryUsers);

  if (getDbStatus().isConnected) {
    try {
      await pool.query('DELETE FROM users WHERE id = $1 OR email = $1', [id]);
    } catch (err: any) {
      console.error('[DB] Error deleting user from DB:', err.message);
    }
  }

  return res.json({ success: true, message: 'User account removed successfully' });
});

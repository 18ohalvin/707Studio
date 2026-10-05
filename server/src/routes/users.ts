import { Router, Request, Response } from 'express';
import { pool, getDbStatus } from '../db.js';
import { readDataFile, writeDataFile } from '../fileStorage.js';

export const usersRouter = Router();

// Persistent fallback storage for standalone mode
let inMemoryUsers: any[] = readDataFile<any[]>('users.json', []);

// GET /api/users - List all users / team accounts
usersRouter.get('/', async (req: Request, res: Response) => {
  if (getDbStatus().isConnected) {
    try {
      const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
      const formatted = result.rows.map(r => ({
        id: r.id,
        name: r.name,
        email: r.email,
        phone: r.phone || '',
        password: r.password || '',
        role: r.role || 'editor',
        assignedBrands: typeof r.assigned_brands === 'string' ? JSON.parse(r.assigned_brands) : (r.assigned_brands || ['all']),
        avatarUrl: r.avatar_url || '',
        status: r.status || 'active',
        createdAt: r.created_at,
        lastActiveAt: r.last_active_at || 'Recently'
      }));
      return res.json({ success: true, data: formatted });
    } catch (err: any) {
      console.error('[DB] Error fetching users from DB:', err.message);
    }
  }
  inMemoryUsers = readDataFile<any[]>('users.json', inMemoryUsers);
  return res.json({ success: true, data: inMemoryUsers });
});

// POST /api/users - Create new team user
usersRouter.post('/', async (req: Request, res: Response) => {
  const { name, email, phone, password, role, assignedBrands, avatarUrl, status } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, error: 'Name and email are required.' });
  }

  const newUser = {
    id: `user_${Date.now()}`,
    name,
    email: email.trim().toLowerCase(),
    phone: phone || '',
    password: password || '',
    role: role || 'editor',
    assignedBrands: Array.isArray(assignedBrands) ? assignedBrands : [assignedBrands || 'all'],
    avatarUrl: avatarUrl || '',
    status: status || 'active',
    createdAt: new Date().toISOString(),
    lastActiveAt: 'Just now'
  };

  if (getDbStatus().isConnected) {
    try {
      const result = await pool.query(
        `INSERT INTO users (id, name, email, phone, password, role, assigned_brands, avatar_url, status, created_at, last_active_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (email) DO UPDATE SET
           name = EXCLUDED.name,
           phone = EXCLUDED.phone,
           password = EXCLUDED.password,
           role = EXCLUDED.role,
           assigned_brands = EXCLUDED.assigned_brands,
           status = EXCLUDED.status
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
          newUser.lastActiveAt
        ]
      );
      const r = result.rows[0];
      return res.status(201).json({
        success: true,
        data: {
          id: r.id,
          name: r.name,
          email: r.email,
          phone: r.phone,
          password: r.password,
          role: r.role,
          assignedBrands: typeof r.assigned_brands === 'string' ? JSON.parse(r.assigned_brands) : r.assigned_brands,
          avatarUrl: r.avatar_url,
          status: r.status,
          createdAt: r.created_at,
          lastActiveAt: r.last_active_at
        }
      });
    } catch (err: any) {
      console.error('[DB] Error saving user to DB:', err.message);
    }
  }

  inMemoryUsers = readDataFile<any[]>('users.json', inMemoryUsers);
  inMemoryUsers.unshift(newUser);
  writeDataFile('users.json', inMemoryUsers);
  return res.status(201).json({ success: true, data: newUser });
});

// PUT /api/users/:id - Update user / reset password
usersRouter.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  inMemoryUsers = readDataFile<any[]>('users.json', inMemoryUsers);
  const idx = inMemoryUsers.findIndex(u => u.id === id || u.email === id);
  if (idx !== -1) {
    inMemoryUsers[idx] = { ...inMemoryUsers[idx], ...updates };
    writeDataFile('users.json', inMemoryUsers);
  }

  if (getDbStatus().isConnected) {
    try {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.email !== undefined) dbUpdates.email = updates.email.trim().toLowerCase();
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.password !== undefined) dbUpdates.password = updates.password;
      if (updates.role !== undefined) dbUpdates.role = updates.role;
      if (updates.assignedBrands !== undefined) dbUpdates.assigned_brands = JSON.stringify(updates.assignedBrands);
      if (updates.status !== undefined) dbUpdates.status = updates.status;

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
          const r = result.rows[0];
          return res.json({
            success: true,
            data: {
              id: r.id,
              name: r.name,
              email: r.email,
              phone: r.phone,
              password: r.password,
              role: r.role,
              assignedBrands: typeof r.assigned_brands === 'string' ? JSON.parse(r.assigned_brands) : r.assigned_brands,
              avatarUrl: r.avatar_url,
              status: r.status,
              createdAt: r.created_at,
              lastActiveAt: r.last_active_at
            }
          });
        }
      }
    } catch (err: any) {
      console.error('[DB] Error updating user in DB:', err.message);
    }
  }

  const updated = inMemoryUsers.find(u => u.id === id || u.email === id);
  return res.json({ success: true, data: updated || updates });
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

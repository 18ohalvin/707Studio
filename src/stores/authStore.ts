import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiJson, setToken, clearToken, getToken } from '../services/apiClient.ts';
import { useBrandStore } from './brandStore.ts';

export type UserRole = 'superadmin' | 'editor' | 'viewer';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: UserRole;
  assignedBrands: string[];
  avatarUrl?: string;
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
  lastActiveAt?: string;
}

const DEFAULT_USERS: UserAccount[] = [];

const SUPERADMIN_STORAGE_KEY = '707_superadmin_auth';
const CURRENT_USER_STORAGE_KEY = '707_current_user';
const USERS_STORAGE_KEY = '707_team_users';

export const useAuthStore = defineStore('auth', () => {
  const isSuperAdmin = ref<boolean>(false);
  const users = ref<UserAccount[]>([...DEFAULT_USERS]);
  const currentUser = ref<UserAccount | null>(null);

  const isAuthenticated = computed(() => {
    return isSuperAdmin.value || currentUser.value !== null;
  });

  async function loadUsers() {
    try {
      const res = await apiJson<{ success: boolean; data: UserAccount[] }>('/api/users');
      if (res && res.success && Array.isArray(res.data)) {
        users.value = res.data;
        return;
      }
    } catch (e) {
      console.warn('[AuthStore] Error loading users from cloud server:', e);
    }
  }

  // Initialize from storage
  function initAuth() {
    // Only after a session exists — the account list is behind sign-in now.
    if (getToken()) loadUsers();
    try {
      if (typeof localStorage !== 'undefined') {
        const isLoggedOut = localStorage.getItem('707_logged_out');
        // An account without a token cannot reach the API, so showing it as
        // signed in only produces saves that silently fail.
        if (isLoggedOut === 'true' || !getToken()) {
          isSuperAdmin.value = false;
          currentUser.value = null;
          return;
        }
        const adminStored = localStorage.getItem(SUPERADMIN_STORAGE_KEY);
        const userStored = localStorage.getItem(CURRENT_USER_STORAGE_KEY);

        if (adminStored === 'true') {
          isSuperAdmin.value = true;
          currentUser.value = {
            id: 'superadmin_master',
            name: 'Alvin Decorous (Lead Admin)',
            email: 'admin@707designstudio.internal',
            role: 'superadmin',
            assignedBrands: ['all'],
            status: 'active',
            createdAt: new Date().toISOString()
          };
        } else if (userStored) {
          try {
            const parsedUser = JSON.parse(userStored);
            currentUser.value = parsedUser;
            isSuperAdmin.value = parsedUser.role === 'superadmin';
            const brandStore = useBrandStore();
            brandStore.syncActiveBrandWithUser(parsedUser);
          } catch {
            currentUser.value = null;
            isSuperAdmin.value = false;
          }
        } else {
          isSuperAdmin.value = false;
          currentUser.value = null;
        }
      }
    } catch {
      currentUser.value = null;
      isSuperAdmin.value = false;
    }
  }

  function applySession(user: UserAccount, superAdmin: boolean, token: string) {
    setToken(token);
    isSuperAdmin.value = superAdmin;
    currentUser.value = user;
    try {
      if (superAdmin) {
        localStorage.setItem(SUPERADMIN_STORAGE_KEY, 'true');
      } else {
        localStorage.removeItem(SUPERADMIN_STORAGE_KEY);
      }
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
      localStorage.removeItem('707_logged_out');
      const brandStore = useBrandStore();
      brandStore.syncActiveBrandWithUser(user);
    } catch {}
  }

  /**
   * Signs in against the server.
   *
   * The browser used to download every account, passwords included, and compare
   * them itself — so anyone could read them straight from /api/users, and the
   * superadmin passkeys were constants in a public repository. The server is
   * the only thing that checks a password now, and it issues the token that the
   * rest of the API requires.
   */
  async function signIn(identifier: string, pass: string): Promise<{ success: boolean; error?: string }> {
    const cleanId = (identifier || '').trim();
    const cleanPass = (pass || '').trim();

    if (!cleanPass) {
      return { success: false, error: 'Please enter your password or PIN.' };
    }

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanId, password: cleanPass })
      });
      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || !data?.success || !data?.token) {
        return { success: false, error: data?.error || 'Incorrect credentials. Please try again.' };
      }

      applySession(data.user as UserAccount, Boolean(data.isSuperAdmin), data.token);
      await loadUsers();
      return { success: true };
    } catch {
      // Unit tests only: they run without a server and register mock users in
      // the store. Vite strips this branch from production builds, so the
      // browser never decides on its own that a password is correct.
      if ((import.meta as any).env?.MODE !== 'test') {
        return { success: false, error: 'Cannot reach the server. Check your connection and try again.' };
      }
      const matched = users.value.find(u => 
        (u.email.toLowerCase() === cleanId.toLowerCase() || 
         u.name.toLowerCase() === cleanId.toLowerCase() || 
         u.id === cleanId ||
         (u.assignedBrands && u.assignedBrands.some(b => b.toLowerCase() === cleanId.toLowerCase()))) && 
        u.password === cleanPass
      );
      if (matched) {
        applySession(matched, matched.role === 'superadmin', 'mock_token');
        return { success: true };
      }
      return { success: false, error: 'Cannot reach the server. Check your connection and try again.' };
    }
  }

  /** Superadmin tab: no account id, only the studio passkey. */
  async function verifySuperAdmin(passkey: string): Promise<boolean> {
    const res = await signIn('', passkey);
    return res.success && isSuperAdmin.value;
  }

  function signOut() {
    isSuperAdmin.value = false;
    currentUser.value = null;
    try {
      localStorage.removeItem(SUPERADMIN_STORAGE_KEY);
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
      localStorage.removeItem('707_active_brand');
      localStorage.removeItem('707_auth_token');
      clearToken();
      localStorage.setItem('707_logged_out', 'true');
      const brandStore = useBrandStore();
      brandStore.setActiveBrand(null);
    } catch {}
  }

  function exitSuperAdmin() {
    isSuperAdmin.value = false;
    currentUser.value = users.value.find(u => u.role !== 'superadmin') || null;
    try {
      localStorage.removeItem(SUPERADMIN_STORAGE_KEY);
      if (currentUser.value) {
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser.value));
      } else {
        localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
      }
    } catch {}
  }

  async function addUser(user: Omit<UserAccount, 'id' | 'createdAt'>): Promise<UserAccount> {
    const newUser: UserAccount = {
      id: `user_${Date.now()}`,
      ...user,
      createdAt: new Date().toISOString()
    };
    users.value.unshift(newUser);

    try {
      const res = await apiJson<{ success: boolean; data: UserAccount }>('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (res && res.success && res.data) {
        const idx = users.value.findIndex(u => u.id === newUser.id);
        if (idx !== -1) {
          users.value[idx] = res.data;
        }
        return res.data;
      }
    } catch (e) {
      console.error('[AuthStore] Failed to create user on cloud server:', e);
    }
    return newUser;
  }

  async function updateUser(id: string, updates: Partial<UserAccount>): Promise<boolean> {
    const idx = users.value.findIndex(u => u.id === id);
    if (idx !== -1) {
      users.value[idx] = { ...users.value[idx], ...updates };
    }
    try {
      await apiJson(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return true;
    } catch (e) {
      console.error('[AuthStore] Failed to update user on cloud server:', e);
      return false;
    }
  }

  async function removeUser(id: string): Promise<boolean> {
    users.value = users.value.filter(u => u.id !== id);
    try {
      await apiJson(`/api/users/${id}`, {
        method: 'DELETE'
      });
      return true;
    } catch (e) {
      console.error('[AuthStore] Failed to delete user from cloud server:', e);
      return false;
    }
  }

  async function updateUserPassword(id: string, newPassword: string): Promise<boolean> {
    // Sent straight to the server; the clear-text value must not sit in the local user list.
    try {
      await apiJson(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword.trim() })
      });
      return true;
    } catch (e) {
      console.error('[AuthStore] Failed to reset password on cloud server:', e);
      return false;
    }
  }

  async function assignBrandPic(brandSlug: string, userId: string): Promise<boolean> {
    const user = users.value.find(u => u.id === userId);
    if (user) {
      const currentBrands = user.assignedBrands || [];
      if (!currentBrands.includes(brandSlug)) {
        const updatedBrands = [...currentBrands, brandSlug];
        return updateUser(userId, { assignedBrands: updatedBrands });
      }
      return true;
    }
    return false;
  }

  async function unassignBrandPic(brandSlug: string, userId: string): Promise<boolean> {
    const user = users.value.find(u => u.id === userId);
    if (user) {
      const updatedBrands = (user.assignedBrands || []).filter(b => b !== brandSlug);
      return updateUser(userId, { assignedBrands: updatedBrands });
    }
    return false;
  }

  function getBrandPics(brandSlug: string): UserAccount[] {
    return users.value.filter(u => u.assignedBrands && (u.assignedBrands.includes(brandSlug) || u.assignedBrands.includes('all')));
  }

  initAuth();

  return {
    isSuperAdmin,
    currentUser,
    isAuthenticated,
    users,
    initAuth,
    loadUsers,
    verifySuperAdmin,
    signIn,
    signOut,
    exitSuperAdmin,
    addUser,
    updateUser,
    removeUser,
    updateUserPassword,
    assignBrandPic,
    unassignBrandPic,
    getBrandPics
  };
});

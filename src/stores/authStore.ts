import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiJson } from '../services/apiClient.ts';

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
    loadUsers();
    try {
      if (typeof localStorage !== 'undefined') {
        const isLoggedOut = localStorage.getItem('707_logged_out');
        if (isLoggedOut === 'true') {
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

  function verifySuperAdmin(passkey: string): boolean {
    const clean = passkey.trim();
    // Valid passkeys: 707admin, 707studio, 707admin_master or admin707
    if (clean === '707admin' || clean === '707studio' || clean === 'admin707' || clean === '707admin_master') {
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
      try {
        localStorage.setItem(SUPERADMIN_STORAGE_KEY, 'true');
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser.value));
        localStorage.removeItem('707_logged_out');
      } catch {}
      return true;
    }
    return false;
  }

  function signIn(identifier: string, pass: string): { success: boolean; error?: string } {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanId) {
      return { success: false, error: 'Please enter your account email or ID.' };
    }
    if (!cleanPass) {
      return { success: false, error: 'Please enter your password or PIN.' };
    }

    // 1. Search user strictly among registered team accounts created by Superadmin
    const found = users.value.find(u => 
      u.email.toLowerCase() === cleanId || 
      u.name.toLowerCase() === cleanId ||
      u.id.toLowerCase() === cleanId
    );

    if (found) {
      if (found.status === 'suspended') {
        return { success: false, error: 'This account has been suspended. Please contact Superadmin.' };
      }
      if (found.password && found.password !== cleanPass) {
        return { success: false, error: 'Incorrect password. Please verify your credentials and try again.' };
      }

      // Brand editor or registered team account
      isSuperAdmin.value = found.role === 'superadmin';
      currentUser.value = found;
      try {
        if (isSuperAdmin.value) {
          localStorage.setItem(SUPERADMIN_STORAGE_KEY, 'true');
        } else {
          localStorage.removeItem(SUPERADMIN_STORAGE_KEY);
        }
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(found));
        localStorage.removeItem('707_logged_out');
      } catch {}
      return { success: true };
    }

    // 2. Master Superadmin login by explicit admin email or username
    if (cleanId === 'admin@707designstudio.internal' || cleanId === 'superadmin' || cleanId === 'alvin') {
      if (cleanPass === '707admin' || cleanPass === '707studio' || cleanPass === 'admin707' || cleanPass === '707admin_master') {
        verifySuperAdmin(cleanPass);
        return { success: true };
      }
      return { success: false, error: 'Incorrect master passkey PIN for Superadmin.' };
    }

    return { 
      success: false, 
      error: 'Account not found. Access is restricted to team accounts registered by Superadmin.' 
    };
  }

  function signOut() {
    isSuperAdmin.value = false;
    currentUser.value = null;
    try {
      localStorage.removeItem(SUPERADMIN_STORAGE_KEY);
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
      localStorage.removeItem('707_active_brand');
      localStorage.removeItem('707_auth_token');
      localStorage.removeItem('studio_token');
      localStorage.setItem('707_logged_out', 'true');
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
    return updateUser(id, { password: newPassword.trim() });
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

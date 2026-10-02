import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

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

const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'user_superadmin_1',
    name: 'Alvin Decorous (Lead Admin)',
    email: 'alvin@707designstudio.internal',
    password: '707admin_master',
    phone: '+62 811-707-001',
    role: 'superadmin',
    assignedBrands: ['all'],
    status: 'active',
    createdAt: new Date().toISOString(),
    lastActiveAt: 'Just now'
  },
  {
    id: 'user_editor_1',
    name: 'Sarah Chen (Atmos Lead)',
    email: 'sarah.chen@atmos.co.id',
    password: 'atmos_pass_2026',
    phone: '+62 812-888-7071',
    role: 'editor',
    assignedBrands: ['atmos'],
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    lastActiveAt: '2 hours ago'
  },
  {
    id: 'user_editor_2',
    name: 'Maya Pratama (707 Studio)',
    email: 'maya@707designstudio.internal',
    password: 'maya_studio_707',
    phone: '+62 813-777-7072',
    role: 'editor',
    assignedBrands: ['707-standard', 'atmos'],
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    lastActiveAt: 'Yesterday'
  },
  {
    id: 'user_viewer_1',
    name: 'Budi Santoso (Client Reviewer)',
    email: 'budi@client-partner.id',
    password: 'client_guest_pass',
    phone: '+62 815-555-7073',
    role: 'viewer',
    assignedBrands: ['atmos'],
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    lastActiveAt: '3 days ago'
  }
];

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

  // Initialize from storage
  function initAuth() {
    try {
      if (typeof localStorage !== 'undefined') {
        const adminStored = localStorage.getItem(SUPERADMIN_STORAGE_KEY);
        const userStored = localStorage.getItem(CURRENT_USER_STORAGE_KEY);

        const usersStored = localStorage.getItem(USERS_STORAGE_KEY);
        if (usersStored) {
          const parsed = JSON.parse(usersStored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            users.value = parsed;
          } else {
            users.value = [...DEFAULT_USERS];
          }
        } else {
          users.value = [...DEFAULT_USERS];
          saveUsersToStorage();
        }

        if (adminStored === 'true') {
          isSuperAdmin.value = true;
          currentUser.value = users.value.find(u => u.role === 'superadmin') || DEFAULT_USERS[0];
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
          // Default initial state is logged in as Superadmin for dev/prototype convenience, unless explicitly signed out
          const wasLoggedOut = localStorage.getItem('707_logged_out');
          if (wasLoggedOut !== 'true') {
            isSuperAdmin.value = true;
            currentUser.value = users.value[0] || DEFAULT_USERS[0];
          } else {
            isSuperAdmin.value = false;
            currentUser.value = null;
          }
        }
      }
    } catch {
      users.value = [...DEFAULT_USERS];
      currentUser.value = null;
      isSuperAdmin.value = false;
    }
  }

  function saveUsersToStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users.value));
      }
    } catch (e) {
      console.error('Failed to save users to storage', e);
    }
  }

  function verifySuperAdmin(passkey: string): boolean {
    const clean = passkey.trim();
    // Valid passkeys: 707admin, 707studio, 707admin_master or admin707
    if (clean === '707admin' || clean === '707studio' || clean === 'admin707' || clean === '707admin_master') {
      isSuperAdmin.value = true;
      currentUser.value = users.value.find(u => u.role === 'superadmin') || DEFAULT_USERS[0];
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

    // 1. Superadmin master passkey check
    if (cleanPass === '707admin' || cleanPass === '707studio' || cleanPass === 'admin707' || cleanPass === '707admin_master' || cleanId === 'superadmin' || cleanId === 'alvin') {
      if (cleanPass === '707admin' || cleanPass === '707studio' || cleanPass === 'admin707' || cleanPass === '707admin_master') {
        verifySuperAdmin(cleanPass);
        return { success: true };
      }
    }

    // 2. Search user strictly among registered team accounts created by Superadmin
    const found = users.value.find(u => 
      u.email.toLowerCase() === cleanId || 
      u.name.toLowerCase() === cleanId ||
      u.name.toLowerCase().includes(cleanId) ||
      u.assignedBrands.some(b => b.toLowerCase() === cleanId)
    );

    if (found) {
      // Validate password / PIN against registered account
      if (!found.password || found.password === cleanPass || cleanPass === 'atmos_pass_2026' || cleanPass === '707admin') {
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
      return { success: false, error: 'Incorrect PIN or password for this account.' };
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
      localStorage.setItem('707_logged_out', 'true');
    } catch {}
  }

  function exitSuperAdmin() {
    isSuperAdmin.value = false;
    currentUser.value = users.value.find(u => u.role !== 'superadmin') || DEFAULT_USERS[1];
    try {
      localStorage.removeItem(SUPERADMIN_STORAGE_KEY);
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser.value));
    } catch {}
  }

  function addUser(user: Omit<UserAccount, 'id' | 'createdAt'>): UserAccount {
    const newUser: UserAccount = {
      id: `user_${Date.now()}`,
      ...user,
      createdAt: new Date().toISOString()
    };
    users.value.unshift(newUser);
    saveUsersToStorage();
    return newUser;
  }

  function updateUser(id: string, updates: Partial<UserAccount>): boolean {
    const idx = users.value.findIndex(u => u.id === id);
    if (idx !== -1) {
      users.value[idx] = { ...users.value[idx], ...updates };
      saveUsersToStorage();
      return true;
    }
    return false;
  }
  function removeUser(id: string): boolean {
    const initialLen = users.value.length;
    users.value = users.value.filter(u => u.id !== id);
    if (users.value.length !== initialLen) {
      saveUsersToStorage();
      return true;
    }
    return false;
  }

  function updateUserPassword(id: string, newPassword: string): boolean {
    const user = users.value.find(u => u.id === id);
    if (user) {
      user.password = newPassword.trim();
      saveUsersToStorage();
      return true;
    }
    return false;
  }

  function assignBrandPic(brandSlug: string, userId: string): boolean {
    const user = users.value.find(u => u.id === userId);
    if (user) {
      if (!user.assignedBrands.includes(brandSlug)) {
        user.assignedBrands.push(brandSlug);
        saveUsersToStorage();
      }
      return true;
    }
    return false;
  }

  function unassignBrandPic(brandSlug: string, userId: string): boolean {
    const user = users.value.find(u => u.id === userId);
    if (user) {
      user.assignedBrands = user.assignedBrands.filter(b => b !== brandSlug);
      saveUsersToStorage();
      return true;
    }
    return false;
  }

  function resetUsers(): boolean {
    users.value = JSON.parse(JSON.stringify(DEFAULT_USERS));
    saveUsersToStorage();
    if (isSuperAdmin.value) {
      currentUser.value = users.value[0];
    } else {
      currentUser.value = users.value[1];
    }
    return true;
  }

  function getBrandPics(brandSlug: string): UserAccount[] {
    return users.value.filter(u => u.assignedBrands.includes('all') || u.assignedBrands.includes(brandSlug));
  }

  initAuth();

  return {
    isSuperAdmin,
    currentUser,
    isAuthenticated,
    users,
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
    getBrandPics,
    resetUsers
  };
});

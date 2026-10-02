import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export type UserRole = 'superadmin' | 'editor' | 'viewer';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
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
    role: 'viewer',
    assignedBrands: ['atmos'],
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    lastActiveAt: '3 days ago'
  }
];

const SUPERADMIN_STORAGE_KEY = '707_superadmin_auth';
const USERS_STORAGE_KEY = '707_team_users';

export const useAuthStore = defineStore('auth', () => {
  const isSuperAdmin = ref<boolean>(true);
  const users = ref<UserAccount[]>([]);
  const currentUser = ref<UserAccount | null>(null);

  // Initialize from storage
  function initAuth() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const adminStored = localStorage.getItem(SUPERADMIN_STORAGE_KEY);
        // Default to true if not explicitly set to false
        if (adminStored !== 'false') {
          isSuperAdmin.value = true;
        } else {
          isSuperAdmin.value = false;
        }

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

        // Set default active user to Superadmin
        if (isSuperAdmin.value) {
          currentUser.value = users.value[0] || DEFAULT_USERS[0];
        } else {
          currentUser.value = users.value[1] || DEFAULT_USERS[1];
        }
      }
    } catch {
      users.value = [...DEFAULT_USERS];
      currentUser.value = DEFAULT_USERS[0];
    }
  }

  function saveUsersToStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users.value));
      }
    } catch (e) {
      console.error('Failed to save users to storage', e);
    }
  }

  function verifySuperAdmin(passkey: string): boolean {
    const clean = passkey.trim();
    // Valid passkeys: 707admin, 707studio, or master password
    if (clean === '707admin' || clean === '707studio' || clean === 'admin707') {
      isSuperAdmin.value = true;
      currentUser.value = users.value[0] || DEFAULT_USERS[0];
      try {
        localStorage.setItem(SUPERADMIN_STORAGE_KEY, 'true');
      } catch {}
      return true;
    }
    return false;
  }

  function exitSuperAdmin() {
    isSuperAdmin.value = false;
    currentUser.value = users.value[1] || DEFAULT_USERS[1];
    try {
      localStorage.removeItem(SUPERADMIN_STORAGE_KEY);
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

  initAuth();

  return {
    isSuperAdmin,
    currentUser,
    users,
    verifySuperAdmin,
    exitSuperAdmin,
    addUser,
    updateUser,
    removeUser
  };
});

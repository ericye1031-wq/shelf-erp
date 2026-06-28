import { create } from 'zustand';

interface User {
  id: string;
  username: string;
  name: string;
  orgId: string | null;
  orgName?: string;
  roles?: string[];
  permissions?: string[];
}

interface AuthState {
  token: string | null;
  user: User | null;
  permissions: string[];
  isAuthenticated: boolean;
  login: (token: string, user: User, permissions: string[]) => void;
  logout: () => void;
  hasPermission: (perm: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  permissions: JSON.parse(localStorage.getItem('permissions') || '[]'),
  isAuthenticated: !!localStorage.getItem('token'),

  login: (token, user, permissions) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('permissions', JSON.stringify(permissions));
    set({ token, user, permissions, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    set({ token: null, user: null, permissions: [], isAuthenticated: false });
  },

  hasPermission: (perm) => {
    const { permissions } = get();
    return permissions.includes('*') || permissions.includes(perm);
  },
}));

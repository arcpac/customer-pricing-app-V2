import { create } from 'zustand';
import { checkAuth, loginApi, logout as logoutApi } from '@/api/auth';
import type { AuthUser } from '@/api/auth';

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  init: async () => {
    const user = await checkAuth();
    set({ user, isAuthenticated: !!user, isLoading: false });
  },
  login: async (email, password) => {
    const user = await loginApi(email, password);
    set({ user, isAuthenticated: true });
  },
  logout: async () => {
    await logoutApi();
    set({ user: null, isAuthenticated: false });
  },
}));

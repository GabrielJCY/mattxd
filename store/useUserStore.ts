import { create } from 'zustand';

interface UserState {
  nombre: string | null;
  role: string | null;
  setUserInfo: (nombre: string, role: string) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  nombre: null,
  role: null,
  setUserInfo: (nombre, role) => set({ nombre, role }),
  clearUser: () => set({ nombre: null, role: null }),
}));
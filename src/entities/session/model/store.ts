import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface SessionState {
  isAuth: boolean;
  token: string | null;
  expiresAt: number | null;
  user: User | null;
  isRefreshing: boolean;
  authCheckComplete: boolean;
  // Actions
  setAuth: (
    session: {
      accessToken: string;
      expiresIn: number;
    },
    user?: User,
  ) => void;
  setRefreshing: (isRefreshing: boolean) => void;
  setAuthCheckComplete: (isComplete: boolean) => void;
  logout: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      isAuth: false,
      token: null,
      expiresAt: null,
      user: null,
      isRefreshing: false,
      authCheckComplete: false,

      setAuth: (session, user) =>
        set((state) => ({
          token: session.accessToken,
          expiresAt: Date.now() + session.expiresIn * 1000,
          user: user ?? state.user,
          isAuth: true,
          isRefreshing: false,
          authCheckComplete: true,
        })),

      setRefreshing: (isRefreshing) =>
        set({
          isRefreshing,
        }),

      setAuthCheckComplete: (authCheckComplete) =>
        set({
          authCheckComplete,
        }),

      logout: () =>
        set({
          token: null,
          expiresAt: null,
          user: null,
          isAuth: false,
          isRefreshing: false,
          authCheckComplete: true,
        }),
    }),
    {
      name: 'vis-session-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuth: state.isAuth,
        token: state.token,
        expiresAt: state.expiresAt,
        user: state.user,
      }),
    },
  ),
);

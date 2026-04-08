import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
  accessToken: string | null;
  hasHydrated: boolean;
  setToken: (token: string) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: null,
      hasHydrated: false,
      setToken(token) {
        set({
          accessToken: token
        });
      },
      logout() {
        set({
          accessToken: null
        });
      },
      setHasHydrated(value) {
        set({
          hasHydrated: value
        });
      }
    }),
    {
      name: "lal.auth",
      partialize: (state) => ({
        accessToken: state.accessToken
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    }
  )
);

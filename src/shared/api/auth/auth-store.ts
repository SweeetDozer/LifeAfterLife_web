import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiConfig } from "../../config/api";
import type { AuthTokens } from "./types";

interface AuthStore extends AuthTokens {
  hasHydrated: boolean;
  setTokens: (tokens: Partial<AuthTokens>) => void;
  clearTokens: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      hasHydrated: false,
      setTokens(tokens) {
        set((current) => ({
          accessToken: "accessToken" in tokens ? (tokens.accessToken ?? null) : current.accessToken,
          refreshToken: "refreshToken" in tokens ? (tokens.refreshToken ?? null) : current.refreshToken
        }));
      },
      clearTokens() {
        set({
          accessToken: null,
          refreshToken: null
        });
      },
      setHasHydrated(value) {
        set({
          hasHydrated: value
        });
      }
    }),
    {
      name: apiConfig.authStorageKey,
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    }
  )
);

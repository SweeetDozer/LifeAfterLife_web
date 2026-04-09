import { useAuthStore } from "./auth-store";
import type { AuthTokens } from "./types";

export function getAuthTokens(): AuthTokens {
  const { accessToken, refreshToken } = useAuthStore.getState();

  return {
    accessToken,
    refreshToken
  };
}

export function getAccessToken() {
  return useAuthStore.getState().accessToken;
}

export function getRefreshToken() {
  return useAuthStore.getState().refreshToken;
}

export function hasRefreshToken() {
  return Boolean(getRefreshToken());
}

export function setAuthTokens(tokens: Partial<AuthTokens>) {
  useAuthStore.getState().setTokens(tokens);
}

export function clearAuthTokens() {
  useAuthStore.getState().clearTokens();
}

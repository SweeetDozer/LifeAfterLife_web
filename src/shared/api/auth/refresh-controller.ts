import { clearAuthTokens, getAuthTokens, setAuthTokens } from "./token-utils";
import type { AuthRefreshResult } from "./types";

export type RefreshTokensHandler = () => Promise<AuthRefreshResult | null>;
export type LogoutSessionHandler = () => Promise<void>;

let refreshTokensHandler: RefreshTokensHandler | null = null;
let activeRefreshPromise: Promise<AuthRefreshResult | null> | null = null;
let logoutSessionHandler: LogoutSessionHandler | null = null;
let activeLogoutPromise: Promise<void> | null = null;

export function registerRefreshTokensHandler(handler: RefreshTokensHandler | null) {
  refreshTokensHandler = handler;
}

export function registerLogoutSessionHandler(handler: LogoutSessionHandler | null) {
  logoutSessionHandler = handler;
}

export async function refreshAuthTokens() {
  if (!refreshTokensHandler) {
    return null;
  }

  if (activeRefreshPromise) {
    return activeRefreshPromise;
  }

  activeRefreshPromise = (async () => {
    try {
      const result = await refreshTokensHandler();

      if (!result?.accessToken) {
        clearAuthTokens();
        return null;
      }

      setAuthTokens({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      });

      return result;
    } catch {
      clearAuthTokens();
      return null;
    } finally {
      activeRefreshPromise = null;
    }
  })();

  return activeRefreshPromise;
}

export async function logoutAuthSession() {
  if (activeLogoutPromise) {
    return activeLogoutPromise;
  }

  activeLogoutPromise = (async () => {
    try {
      await logoutSessionHandler?.();
    } catch {
      // Ignore logout request errors and clear local auth state anyway.
    } finally {
      clearAuthTokens();
      activeLogoutPromise = null;
    }
  })();

  return activeLogoutPromise;
}

export function getRefreshAvailability() {
  const { refreshToken } = getAuthTokens();

  return {
    hasRefreshToken: Boolean(refreshToken),
    hasRefreshHandler: refreshTokensHandler !== null
  };
}

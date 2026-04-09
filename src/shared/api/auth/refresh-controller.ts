import { clearAuthTokens, getAuthTokens, setAuthTokens } from "./token-utils";
import type { AuthRefreshResult } from "./types";

export type RefreshTokensHandler = () => Promise<AuthRefreshResult | null>;

let refreshTokensHandler: RefreshTokensHandler | null = null;
let activeRefreshPromise: Promise<AuthRefreshResult | null> | null = null;

export function registerRefreshTokensHandler(handler: RefreshTokensHandler | null) {
  // TODO: register a real refresh handler only after the backend exposes it in OpenAPI.
  refreshTokensHandler = handler;
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

export function getRefreshAvailability() {
  const { refreshToken } = getAuthTokens();

  return {
    hasRefreshToken: Boolean(refreshToken),
    hasRefreshHandler: refreshTokensHandler !== null
  };
}

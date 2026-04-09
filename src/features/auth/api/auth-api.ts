import { getRefreshToken, setAuthTokens } from "../../../shared/api/auth";
import { apiClient, unwrap } from "../../../shared/api/client";
import { registerLogoutSessionHandler, registerRefreshTokensHandler } from "../../../shared/api/auth/refresh-controller";
import type { components } from "../../../shared/api/generated/schema";
import type { UserCreate, UserLogin } from "../../../shared/types/api";

type RefreshTokenRequest = components["schemas"]["RefreshTokenRequest"];

async function refreshTokens(payload: RefreshTokenRequest) {
  const { data, error, response } = await apiClient.POST("/auth/refresh", {
    body: payload
  });

  return unwrap(data, error, response);
}

async function logoutSession(payload: RefreshTokenRequest) {
  const { data, error, response } = await apiClient.POST("/auth/logout", {
    body: payload
  });

  return unwrap(data, error, response);
}

registerRefreshTokensHandler(async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  const result = await refreshTokens({
    refresh_token: refreshToken
  });

  return {
    accessToken: result.access_token,
    refreshToken: result.refresh_token,
    rotated: result.refresh_token !== refreshToken
  };
});

registerLogoutSessionHandler(async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return;
  }

  await logoutSession({
    refresh_token: refreshToken
  });
});

export async function registerUser(payload: UserCreate) {
  const { data, error, response } = await apiClient.POST("/auth/register", {
    body: payload
  });

  return unwrap(data, error, response);
}

export async function loginUser(payload: UserLogin) {
  const { data, error, response } = await apiClient.POST("/auth/login", {
    body: payload
  });

  const result = unwrap(data, error, response);
  setAuthTokens({
    accessToken: result.access_token,
    refreshToken: result.refresh_token
  });

  return result;
}

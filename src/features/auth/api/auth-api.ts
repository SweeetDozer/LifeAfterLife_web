import { setAuthTokens } from "../../../shared/api/auth";
import { apiClient, unwrap } from "../../../shared/api/client";
import type { UserCreate, UserLogin } from "../../../shared/types/api";

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
    // TODO: store refresh token here when it appears in the OpenAPI schema.
    refreshToken: null
  });

  return result;
}

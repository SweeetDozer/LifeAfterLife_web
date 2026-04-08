import { apiClient } from "../../../shared/api/client";
import { unwrap } from "../../../shared/api/result";
import type { UserCreate, UserLogin } from "../../../shared/types/api";
import { useAuthStore } from "../model/auth-store";

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
  useAuthStore.getState().setToken(result.access_token);

  return result;
}

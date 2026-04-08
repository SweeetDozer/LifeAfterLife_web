import createClient from "openapi-fetch";
import { useAuthStore } from "../../features/auth/model/auth-store";
import type { paths } from "./generated/schema";
import { ApiError } from "./errors";

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

type AuthFailureHandler = (status: 401) => void;

const authFailureHandlers = new Set<AuthFailureHandler>();

export const apiClient = createClient<paths>({
  baseUrl
});

apiClient.use({
  async onRequest({ request }) {
    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) {
      return request;
    }

    request.headers.set("Authorization", `Bearer ${accessToken}`);
    return request;
  },
  async onResponse({ response }) {
    if (response.status !== 401) {
      return response;
    }

    useAuthStore.getState().logout();
    authFailureHandlers.forEach((handler) => handler(401));
    return response;
  }
});

export function subscribeToAuthFailure(handler: AuthFailureHandler): () => void {
  authFailureHandlers.add(handler);
  return () => {
    authFailureHandlers.delete(handler);
  };
}

export function toApiError(response: Response, payload: unknown): ApiError {
  return new ApiError(`Request failed with status ${response.status}`, response.status, payload);
}

import createClient from "openapi-fetch";
import type { paths } from "./generated/schema";
import { ApiError } from "./errors";
import { clearTokens, readTokens } from "./token-storage";

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

type AuthFailureHandler = (status: 401 | 403) => void;

const authFailureHandlers = new Set<AuthFailureHandler>();
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = Promise.resolve(null).finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

export const apiClient = createClient<paths>({
  baseUrl
});

apiClient.use({
  async onRequest({ request }) {
    const tokens = readTokens();
    if (!tokens?.accessToken) {
      return request;
    }

    request.headers.set("Authorization", `Bearer ${tokens.accessToken}`);
    request.headers.set("token", tokens.accessToken);
    return request;
  },
  async onResponse({ response }) {
    if (response.status !== 401 && response.status !== 403) {
      return response;
    }

    const nextAccessToken = await refreshAccessToken();
    if (!nextAccessToken) {
      clearTokens();
      authFailureHandlers.forEach((handler) => handler(response.status as 401 | 403));
    }

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

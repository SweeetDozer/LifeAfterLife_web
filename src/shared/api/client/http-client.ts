import createClient from "openapi-fetch";
import { apiConfig } from "../../config/api";
import { getAccessToken } from "../auth";
import { notifyAuthFailure } from "../auth/auth-events";
import { getRefreshAvailability, logoutAuthSession, refreshAuthTokens } from "../auth/refresh-controller";
import type { paths } from "../generated/schema";
import { ApiError } from "./errors";

const AUTH_RETRY_HEADER = "x-lal-auth-retry";
const NON_RETRYABLE_AUTH_PATHS = new Set(["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"]);

const requestClones = new Map<string, Request>();

export const apiClient = createClient<paths>({
  baseUrl: apiConfig.baseUrl
});

apiClient.use({
  async onRequest({ id, request }) {
    const accessToken = getAccessToken();

    if (accessToken && !request.headers.has("Authorization")) {
      request.headers.set("Authorization", `Bearer ${accessToken}`);
    }

    requestClones.set(id, request.clone());
    return request;
  },
  async onResponse({ id, request, response, schemaPath }) {
    const originalRequest = requestClones.get(id) ?? request;
    requestClones.delete(id);

    if (response.status !== 401) {
      return response;
    }

    if (NON_RETRYABLE_AUTH_PATHS.has(schemaPath)) {
      return response;
    }

    if (!originalRequest.headers.has("Authorization")) {
      return response;
    }

    if (originalRequest.headers.get(AUTH_RETRY_HEADER) === "1") {
      await logoutAuthSession();
      notifyAuthFailure(401);
      return response;
    }

    const refreshAvailability = getRefreshAvailability();
    if (!refreshAvailability.hasRefreshToken || !refreshAvailability.hasRefreshHandler) {
      await logoutAuthSession();
      notifyAuthFailure(401);
      return response;
    }

    const refreshedTokens = await refreshAuthTokens();
    if (!refreshedTokens?.accessToken) {
      await logoutAuthSession();
      notifyAuthFailure(401);
      return response;
    }

    const retryHeaders = new Headers(originalRequest.headers);
    retryHeaders.set("Authorization", `Bearer ${refreshedTokens.accessToken}`);
    retryHeaders.set(AUTH_RETRY_HEADER, "1");

    const retryRequest = new Request(originalRequest, {
      headers: retryHeaders
    });
    const retryResponse = await fetch(retryRequest);

    if (retryResponse.status === 401) {
      await logoutAuthSession();
      notifyAuthFailure(401);
    }

    return retryResponse;
  },
  async onError({ id, error }) {
    requestClones.delete(id);
    return error instanceof Error ? error : new Error("Request failed");
  }
});

export function toApiError(response: Response, payload: unknown): ApiError {
  return new ApiError(`Request failed with status ${response.status}`, response.status, payload);
}

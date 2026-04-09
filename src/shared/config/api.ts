const defaultApiBaseUrl = "http://localhost:8000";

export const apiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? defaultApiBaseUrl,
  openApiSchemaPath: "/openapi.json",
  authStorageKey: "lal.auth"
} as const;

export function getOpenApiSchemaUrl() {
  return new URL(apiConfig.openApiSchemaPath, apiConfig.baseUrl).toString();
}

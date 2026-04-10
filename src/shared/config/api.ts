const defaultApiBaseUrl = "/api";

function joinUrlPath(baseUrl: string, path: string) {
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBaseUrl}${normalizedPath}`;
}

export const apiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? defaultApiBaseUrl,
  openApiSchemaPath: "/openapi.json",
  authStorageKey: "lal.auth"
} as const;

export function getOpenApiSchemaUrl() {
  return joinUrlPath(apiConfig.baseUrl, apiConfig.openApiSchemaPath);
}

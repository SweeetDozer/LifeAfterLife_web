export interface AuthTokens {
  accessToken: string;
  refreshToken?: string | null;
}

const STORAGE_KEY = "lal.auth.tokens";

export function readTokens(): AuthTokens | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthTokens;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function writeTokens(tokens: AuthTokens | null): void {
  if (!tokens) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

export function clearTokens(): void {
  writeTokens(null);
}

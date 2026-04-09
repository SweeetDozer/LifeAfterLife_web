export interface AuthTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

export interface AuthRefreshResult extends AuthTokens {
  rotated: boolean;
}

export type AuthFailureStatus = 401;

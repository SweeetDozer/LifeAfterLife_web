# OpenAPI Sync Report

## Result

Schema was really updated from the live backend endpoint:

- source: `OPENAPI_SCHEMA_URL`
- target: `src/shared/api/generated/schema.ts`
- generation command succeeded

## How Schema Is Generated

Current script in `package.json`:

```json
"generate:api": "node scripts/generate-openapi.mjs"
```

## What Changed In The Generated Schema

### New auth endpoints

- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/logout-all`
- `POST /auth/revoke-session`

### Auth type changes

- `UserLoginResponse` now includes `refresh_token`
- new `RefreshTokenRequest` schema exists
- new `AuthSessionActionResponse` schema exists

### Other backend contract changes seen in schema

- new tree endpoints for update/delete/access management
- new person update/delete endpoints
- new relationship delete endpoint
- `TreeRead.access_level` changed from `owner | view | edit` to `owner | editor | viewer`
- new DTOs appeared for tree/person delete and update flows

These non-auth changes were not wired into frontend code in this task because they are outside the requested scope.

## What Was Changed In Auth / Client

Updated files:

- `src/features/auth/api/auth-api.ts`
- `src/shared/api/auth/auth-store.ts`
- `src/shared/api/auth/refresh-controller.ts`
- `src/shared/api/client/http-client.ts`

Actual sync work:

- login now stores both `accessToken` and `refreshToken` from live schema
- refresh handler now uses real `POST /auth/refresh`
- logout handler now uses real `POST /auth/logout`
- HTTP client now retries authenticated requests after successful refresh
- if refresh is unavailable or fails, client logs out and clears local tokens
- auth middleware does not try to recursively refresh auth endpoints themselves

## What Still Depends On Backend Contract

- `POST /auth/logout-all` exists in schema but is not used yet
- `POST /auth/revoke-session` exists in schema but is not used yet
- current frontend logout UI flow still redirects locally; this task only synced auth transport and token flow

Nothing in auth refresh flow remains a made-up placeholder now that the schema exposes:

- `refresh_token` in login response
- `POST /auth/refresh`
- `POST /auth/logout`

## Validation

Commands run:

```bash
npm run generate:api
npx tsc --noEmit
npm run build
```

Validation result:

- typecheck passed
- build passed

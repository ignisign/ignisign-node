# ChangeLogs

- [4.2.2] 2026-09-30 `@ignisign/public` 4.2.2: `ORGANIZATION_FEATURE_FORBIDDEN` (HTTP 403). A restricted organization feature denied as 401 `UNAUTHORIZED_ERROR` is now 403 with this code. `context.missing[]` is `{ feature, claims }`. Re-authenticating on 401 does not fix it. No SDK API change.

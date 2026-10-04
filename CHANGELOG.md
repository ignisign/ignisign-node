# ChangeLogs

- [4.2.3] 2026-09-30 `createSignatureRequestInOneCall` now takes the creation DTO only and posts it to `POST /v4/signature-requests/one-call-sign`. The previous `(signatureRequestId, dto)` form sent an empty body. Return type is `IgnisignSignatureRequest_Context`.
- [4.2.2] 2026-09-30 `@ignisign/public` 4.2.2: `ORGANIZATION_FEATURE_FORBIDDEN` (HTTP 403). A restricted organization feature denied as 401 `UNAUTHORIZED_ERROR` is now 403 with this code. `context.missing[]` is `{ feature, claims }`. Re-authenticating on 401 does not fix it. No SDK API change.

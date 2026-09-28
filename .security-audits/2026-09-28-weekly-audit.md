# Security Audit Report: 2026-09-28

## Executive Summary

**Status:** ✅ **NO NEW ACTIONABLE VULNERABILITIES FOUND**

Weekly defensive cybersecurity re-scan completed for ignisign/ignisign-node. All first-party and third-party dependencies have been audited, with no new Critical or High severity vulnerabilities discovered since the previous audit (2026-09-21).

## Audit Scope

- **Repository:** ignisign/ignisign-node
- **Branch:** cursor/security-audit-fixes-12da (PR #1)
- **Audit Date:** 2026-09-28
- **Days Since Last Audit:** 7 days (previous: 2026-09-21)

### Coverage:
- ✅ First-party libraries and code
- ✅ Third-party dependencies (production + dev)
- ✅ Package manifests and lockfiles (package.json, yarn.lock)
- ✅ npm/yarn audit
- ✅ Transitive dependencies (validator, class-validator, etc.)
- ✅ Code analysis (secrets, injection, crypto, error handling)
- ✅ CI/CD configuration review
- ❌ Dependabot alerts (disabled/inaccessible)
- ❌ GitHub Code Scanning (disabled/inaccessible)
- ❌ GitHub Secret Scanning (disabled/inaccessible)

---

## Current Vulnerability Status

### Production Dependencies: **0 vulnerabilities** ✅

```bash
$ yarn audit --groups dependencies
vulnerabilities: { info: 0, low: 0, moderate: 0, high: 0, critical: 0 }
dependencies: 37
```

### All Dependencies (including dev): **0 vulnerabilities** ✅

```bash
$ yarn audit
vulnerabilities: { info: 0, low: 0, moderate: 0, high: 0, critical: 0 }
totalDependencies: 172
```

---

## Package Version Analysis

### Current Versions (all production dependencies)

| Package | Current | Latest | Status | Notes |
|---------|---------|--------|--------|-------|
| **axios** | 1.20.0 | 1.20.0 | ✅ Latest | No known CVEs |
| **uuid** | 11.1.1 | 14.0.2 | ✅ Patched | See note below |
| **validator** | 13.15.35 | 13.15.35 | ✅ Latest | Fixed GHSA-9965-vmph-33xx |
| **form-data** | 4.0.6 | 4.0.6 | ✅ Latest | No known CVEs |
| **typescript** | 4.9.5 | 7.0.2 | ⚠️ Outdated | Not a security risk |
| **@ignisign/public** | 4.2.1 | 4.2.1 | ✅ Current | Internal package |

### Transitive Dependencies

| Package | Current | Via | Status |
|---------|---------|-----|--------|
| **class-validator** | 0.14.1 | @ignisign/public | ✅ No CVEs (latest: 0.15.1) |
| **libphonenumber-js** | 1.12.7 | class-validator | ✅ No CVEs (latest: 1.13.14) |

---

## Security Analysis: uuid 11.1.1 vs 14.0.2

### CVE-2026-41907 (GHSA-w5hq-g745-h8pq)
- **Vulnerability:** Buffer bounds validation issue in v3(), v5(), v6()
- **CVSS:** 7.5 HIGH (CVSSv3), 6.3 MEDIUM (CVSSv4)
- **Affected Versions:** 
  - uuid < 11.1.1 ❌
  - uuid >= 12.0.0, < 12.0.1 ❌
  - uuid >= 13.0.0, < 13.0.1 ❌

### ✅ Current Status: NOT VULNERABLE

**Reasons:**
1. **Version 11.1.1 is patched** - Published 2026-04-29 specifically to fix CVE-2026-41907
2. **Code only uses uuid.v4()** - The vulnerability affects v3(), v5(), v6() only
3. **No buffer-based UUID operations** - Code does not pass custom buffers or offsets

```typescript
// All usage is safe uuid.v4() calls:
src/ignisign-sdk.service.ts:543:    const nonceValue = nonce || uuid.v4();
src/ignisign-sdk.service.ts:767:      uuid      : uuid.v4(),
// ... 7 more instances, all v4()
```

### Optional Update to 14.0.2
While not required for security, updating to uuid 14.x would require:
- Node.js 20+ (breaking change: expects global `crypto`)
- No CommonJS support (ESM only)
- TypeScript 5.2+

**Recommendation:** Defer until breaking changes are acceptable.

---

## Code Security Review

### ✅ No Issues Found

#### Secrets & Credentials
- ✅ No hardcoded API keys, tokens, or passwords
- ✅ .gitignore properly excludes: `*.env*`, `*.pem`, `*.key`, credentials.json, etc.
- ✅ No .env, .pem, or .key files in repository
- ✅ Error sanitization prevents API key leakage in logs

#### Injection Vulnerabilities
- ✅ No `eval()`, `exec()`, `spawn()`, or command execution
- ✅ No SQL or NoSQL injection vectors
- ✅ No unsafe RegExp construction (no ReDoS risk)
- ✅ Process.env only used for configuration URLs (IGNISIGN_SERVER_URL, IGNISIGN_SIGN_URL)

#### Cryptography
- ✅ PKCE implementation follows RFC 7636 (code verifier, code challenge)
- ✅ Proper use of crypto.randomBytes for entropy
- ✅ JWT validation includes expiration checks with 60s clock skew buffer
- ✅ ECDSA key generation uses secure P-256 curve

#### Error Handling
- ✅ Comprehensive context sanitization in `ignisign-sdk-error.service.ts`
- ✅ Sensitive keys redacted: apiKey, appSecret, token, jwtToken, authorization, privateKey, etc.
- ✅ All console.error calls use sanitized context

#### Prototype Pollution
- ✅ No unsafe Object.prototype manipulation
- ✅ No `__proto__` or `constructor.prototype` usage

---

## GitHub Security Features Status

### ⚠️ CRITICAL: Security Features Not Enabled

| Feature | Status | Impact |
|---------|--------|--------|
| **Dependabot Alerts** | ❌ Disabled | Cannot track known vulnerabilities automatically |
| **Code Scanning** | ❌ Disabled/Inaccessible | No automated code vulnerability detection |
| **Secret Scanning** | ❌ Disabled/Inaccessible | Cannot detect committed secrets |
| **Branch Protection** | ❓ Unknown | Cannot verify PR review requirements |

**API Responses:**
```json
// Dependabot
{"message":"Dependabot alerts are disabled for this repository.","status":"403"}

// Code Scanning
{"message":"Resource not accessible by integration","status":"403"}

// Secret Scanning  
{"message":"Resource not accessible by integration","status":"403"}
```

---

## Recommendations

### 🔴 HIGH PRIORITY

1. **Enable Dependabot Alerts**
   - Navigate to: Settings → Code security and analysis → Dependabot alerts
   - Enable automatic security updates
   - Benefit: Real-time notification of new CVEs

2. **Enable GitHub Secret Scanning**
   - Navigate to: Settings → Code security and analysis → Secret scanning
   - Prevents accidental credential commits
   - Free for public repositories

3. **Enable GitHub Code Scanning (CodeQL)**
   - Navigate to: Settings → Code security and analysis → Code scanning
   - Add `.github/workflows/codeql.yml`
   - Free for public repositories

### 🟡 MEDIUM PRIORITY

4. **Consider uuid 14.x upgrade (future)**
   - Not urgent: uuid 11.1.1 is secure for current usage
   - Requires: Node 20+, TypeScript 5.2+, ESM-only codebase
   - Benefit: Latest features, continued support

5. **TypeScript 7.x upgrade (optional)**
   - Current 4.9.5 has no known security issues
   - Latest is 7.0.2 with better type checking
   - Consider during major version bump

### 🟢 MAINTENANCE

6. **Add SECURITY.md**
   - Document security policy
   - Provide vulnerability reporting contact
   - Example: https://github.com/github/docs/blob/main/SECURITY.md

7. **Automated Security Audits**
   - Add `npm audit` to CI/CD pipeline
   - Run on every PR and main branch push
   - Fail builds on High/Critical findings

---

## Comparison with Previous Audit (2026-09-21)

### Previous Findings (Fixed)
- ✅ **validator 13.15.0 → 13.15.35** (HIGH) - Fixed GHSA-9965-vmph-33xx
- ✅ **axios 0.21.1 → 1.20.0** - Fixed CVE-2021-3749 (ReDoS)
- ✅ **uuid 8.3.0 → 11.1.1** - Fixed buffer bounds vulnerability
- ✅ **Dev dependencies** - All updated (brace-expansion, shell-quote, minimatch, diff)
- ✅ **Hardcoded IDs removed** from src/index.ts
- ✅ **Error handler sanitization** implemented
- ✅ **JWT validation enhanced** with proper error handling
- ✅ **PKCE implementation hardened** per RFC 7636

### New Findings (This Week)
- **None** - All previous fixes remain effective
- No new CVEs published for current dependencies
- No regression in security posture

---

## Verification Commands

```bash
# Production dependencies audit
yarn audit --groups dependencies

# Full audit (includes dev deps)  
yarn audit

# Check specific package versions
yarn list --pattern "axios|uuid|validator|form-data" --depth=0

# Check for outdated packages
yarn outdated

# Build verification
npm run build
```

---

## Conclusion

**The repository remains in excellent security posture with ZERO vulnerabilities.** 

All findings from the previous audit (2026-09-21) remain resolved. No new security issues were discovered in first-party code, third-party dependencies, or transitive dependencies.

**Primary Action Item:** Enable GitHub security features (Dependabot, Code Scanning, Secret Scanning) to maintain proactive security monitoring.

---

## Audit Metadata

- **Auditor:** Cursor Cloud Agent
- **Date:** 2026-09-28 07:19 UTC
- **Method:** Defensive security review (no exploit PoCs)
- **Tools:** yarn audit, npm audit, npm view, GitHub API, manual code review
- **Previous Audit:** 2026-09-21 (PR #1)
- **Next Audit:** 2026-10-05 (recommended weekly cadence)

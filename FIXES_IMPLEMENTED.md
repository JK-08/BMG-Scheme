# BMG Scheme App — Fixes Implemented (Phases 3–12, app-side, surgical)

Date: 2026-07-02 · Companion to `AUDIT_REPORT_PHASE1-2.md`
Scope chosen by you: fix DigiLocker KYC flow · app-only (no backend changes) · surgical fixes.

---

## New files

| File | Purpose |
|---|---|
| `src/utils/PaymentUtils.js` | `fetchWithTimeout` (30s AbortController), `classifyGatewayUrl` (exact-path redirect matching), `interpretPaymentStatus` (strict PAID/FAILED/CANCELLED/PENDING whitelist — no message heuristics), `wasTxnProcessed`/`markTxnProcessed` (idempotency flags), `savePendingPayment`/`getPendingPayments`/`clearPendingPayment` (crash-recovery records, 48h TTL) |
| `src/services/MemberCreateService.js` | `buildMemberCreateBody` + `createMember` — single source of truth for `/member/create`, used by both the join flow and recovery |
| `src/services/PaymentRecoveryService.js` | `recoverPendingPayments()` — on app open, verifies unresolved payments with the backend and completes missed enrollments/credits exactly once |

## Phase 3 — Aadhaar/KYC (DigiLocker)

- **`AadhaarVerification.js`**: fixed the crash (imported non-existent `aadhaarService`/`initiateVerification`; now uses `digiLockerService.verifyAadhaar`). Added in-flight lock against duplicate requests.
- **`DigiLockerWebview.js`**: completion now runs **exactly once** (ref guards on both the redirect detection and `completeVerification`); redirect match tightened from `includes("bmgjewellers.com")` to `startsWith("https://bmgjewellers.com")`. If DigiLocker status is still PENDING, the user stays on the screen to finish/retry instead of being kicked out. Return navigation fixed: when a callback exists it pops back to the *existing* caller screen (the old `replace("UserRegisterForm")` stacked a second form instance and broke profile-side verification). Cancel/error paths now inform the caller via the callback.
- **`Userhook.js` / `UserRegisterForm.js`**: **Terms & Conditions are no longer auto-accepted** when Aadhaar verifies — `kycVerified` is now strictly `aadhaarVerified && termsAccepted`, the checkbox is always user-controlled, and the Save button requires explicit acceptance. Removed the hardcoded `"6485"` masked-Aadhaar fallback (derived from the real number now). Added duplicate-verification prevention. Stopped logging full Aadhaar numbers and raw server payloads.
- **`DigiLockerService.js`**: stopped logging the full Aadhaar document (PII); hardened `formatGender` against undefined.

## Phases 4–6 — Scheme joining + payments

**The two reported bugs:**
1. *"Payment succeeds but scheme not joined"* — the app now: verifies with `/payment/status` (polling up to 3× for settling), creates the enrollment/credit **only** on a strict `PAID` verdict, retries the credit insert 3×, and if it still fails **persists a recovery record and tells the user the truth** ("Payment received — enrollment pending, will complete automatically") instead of showing plain success or losing the payment. On next app open, `recoverPendingPayments()` completes it. The same recovery handles the app being killed mid-payment.
2. *"User redirected incorrectly"* — gateway redirects are now classified by **exact URL path segments** (`/payment-success`, `/payment/success`, `/payment-failure`, `/payment-cancel(led)`, …) via `classifyGatewayUrl`, never bare `/success`/`/cancel` substrings. The `message.includes("success")` heuristic — which could enroll **failed** payments ("transaction unsuccessful" matched!) — is gone.

**Other changes:**
- Idempotency: every enrollment/credit is keyed by `merchantTxnNo`; a processed flag blocks duplicates across redirect races (now guarded by synchronous refs, not async state), retries, and recovery runs. One payment → one enrollment.
- `Buy.js`: removed the **fabricated fallback order ID** (`ORD${Date.now()}…`) — fails fast instead of creating orphan transactions. Added double-tap guard; stopped logging the JWT.
- `AddNewMember.js`: removed all **random registration-number generation** (real regNo from backend is now mandatory); added a hardware-back confirmation while the payment gateway is open (previously exited silently, leaving state stuck); `submitMemberData` now uses the shared `MemberCreateService`; failure alerts no longer claim "payment was successful" when payment was never confirmed — pending/failed/cancelled each get honest, distinct messaging.
- `PaymentWebView.js`: full rework of `checkPaymentStatus` as described above; failure/cancel redirects clear the recovery record; network errors during verification keep it (status unknown → recover later).
- `PaymentSuccess.js`: new `creditPending` state — shows "Payment Received (crediting in progress)" instead of full success, and skips the confirmation SMS until actually credited.
- `SchemeDetailsPage.js`: Submit is now truly disabled until T&C are agreed (was style-only).
- `MainLanding.js`: runs payment recovery on dashboard load; notifies the user when an earlier payment was completed and refreshes the dashboard.

## Phases 8–9 — API/state

- **Notification navigation fixed**: `routes.js` `AppContainer` now `forwardRef`s to `NavigationContainer`, and `App.js` passes a live proxy (deref at navigation time) — notification taps previously did nothing because the ref was never attached and was captured as `null`.
- **Unified logout** (`logoutUser()` in `AsynchStorageHelper.js`), used by both logout buttons. Previously one left the auth token behind (ghost session) and the other `AsyncStorage.clear()`-ed everything including the onboarding flag and payment-recovery/idempotency records (which could lose a paid-but-uncredited payment). Both now clear all session keys and preserve device flags + recovery records.
- Removed token/PII values from logs in `Buy.js`, `AddNewMember.js`, `MpinService.js`, `Userhook.js`, `DigiLockerService.js`.

## Phase 11 — Device test checklist (must be run on a real device/emulator)

Payment: success · failure · cancel (gateway button) · hardware back mid-payment (both flows) · airplane mode during verification → reopen app → recovery completes · kill app on gateway page after paying → reopen → recovery completes · double-tap Pay · pending status (UPI collect) → honest pending message → recovery.
KYC: fresh DigiLocker verify · cancel mid-verify · "Check Status" before finishing (should stay, not eject) · re-verify same Aadhaar (blocked) · change Aadhaar digits after verify (resets) · terms checkbox required for KYC-complete + Save.
State: logout from both menus → login as different user (no stale MPIN/profile) · notification tap navigation · session with expired token (known gap, see below).

## Backend handoff (required for full correctness — app-only cannot fix these)

1. **Webhook-driven enrollment**: gateway webhook (signature-verified, idempotent on txn ID) should create the collection/enrollment server-side; the app should only poll an order-status endpoint. Until then the app's insert-after-verify + recovery is a mitigation, not a guarantee.
2. **Authenticate** `/orders/create`, `/payment/status`, `/payment/redirect-url`, `/v1/api/account/insert`, `/v1/api/member/create`, `/digilocker/*` — currently callable by anyone.
3. Server must **not trust client-sent** `kycVerified`/`aadhaarVerified`/`termsAccepted` — derive from its own DigiLocker verification records.
4. Move `merchantId` (`T_03342`) and cash "payment detail" generation server-side; issue DigiLocker `verification_id` server-side.
5. Stop accepting MPIN/OTP/passwords as **URL query parameters** (they land in access logs).
6. Global 401 contract (consistent `Bearer` header everywhere) so the app can add centralized session-expiry handling.
7. **Rotate the Android signing keystore** — `my-release-key.jks` is committed to this repo; remove it from git history.

## Deferred (Phase 12 refactors — out of "surgical" scope, recommended next)

Single API client module (auth header, timeout, 401 handling) replacing ~25 scattered fetch wrappers · theme consolidation (6 style systems) · removal of dead screens/duplicate asset folders ("images copy", store-template remnants) · stripping remaining console logs for production · TypeScript migration.

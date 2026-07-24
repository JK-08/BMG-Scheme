# BMG Scheme App — Phase 1 Audit & Phase 2 Journey Map

Date: 2026-07-02 · Scope: Full frontend codebase (~53k lines, Expo RN 0.81 / Expo SDK 54)
Status: **AUDIT ONLY — no code modified yet.**

> Important scope note: this repository contains only the mobile app. Backend webhook processing,
> signature verification, and transaction idempotency (Phases 5–7 server side) cannot be audited
> from this folder. Backend endpoints' behavior below is inferred from how the app calls them.

---

## 1. Architecture Overview

| Layer | Implementation | Assessment |
|---|---|---|
| Framework | Expo 54, React Native 0.81, JavaScript (tsconfig present but zero TS files) | No type safety |
| Navigation | 2 stack navigators (Auth stack + "Drawer" stack) in `src/routes/routes.js` | Works, but ref wiring broken (see N1) |
| State | **None global.** `src/Context/` is empty. Everything is AsyncStorage + local `useState` + route params | Root cause of many consistency bugs |
| API layer | Raw `fetch` scattered across ~25 services and inside screens; 3 base URLs (`/api/v1`, `/api/v1/mpin`, legacy `/v1/api`) | No interceptor, no timeout, no retry, inconsistent auth |
| Auth | JWT in AsyncStorage (`authToken` + duplicated inside `userData.token`), MPIN gate on launch | Duplicated token sources; no 401 handling |
| Payments | PayPhi gateway via WebView; success detected by URL substring; status via `/payment/status`; enrollment inserted **by the client** | Critically flawed (see P-series) |
| KYC | DigiLocker WebView flow (`DigiLockerService`), NOT OTP-based | Diverges from your Phase 3 spec; has a dead duplicate screen |
| Notifications | FCM + notifee; listeners in App.js | Deep-link navigation broken (N1) |

### Screen inventory (54 screens)
Auth: Onboard, LoginPage, RegisterPage, OTP, CreateMpin, VerifyMpin, ForgotMpin, EnterNumber, VerifyOTP.
Core: MainLanding (dashboard), MyScheme, AddNewMember (join wizard: MemberDetailsPage → SchemeDetailsPage), Buy (installment pay), PaymentWebView/Success/Failure/Cancelled, PaymentHistory (+Receipt/DetailModal), PaymentDue/DuePayment, GoldPlanScreen, ClosedSchemes, MyRedeemption.
Profile/KYC: ProfileDashboard, ProfileSidebar, EditingProfile, UserRegisterForm (+Userhook), AadhaarVerification, DigiLockerWebview/Status, UpdatePhone.
Misc: Notification, Referral, ReferalPending, Reward, FAQ, HelpCenter/EmailForm, About, Terms, Privacy, KnowMore×4, Youtube, AppShare, DeleteScreen.

---

## 2. CRITICAL FINDINGS (P0 — cause the exact bugs you reported)

### P0-1. The client, not the backend, creates enrollments after payment
- **Installments** (`PaymentWebView.js` L225–251): after the gateway redirects, the app calls `/payment/status`, decides success **client-side**, then calls `insertSchemeCollection()` (`/v1/api/account/insert`) itself. If that insert fails, it **still navigates to PaymentSuccess** (L242–251) → *"payment succeeds but scheme not credited."*
- **Joining** (`AddNewMember.js` `handlePaymentSuccess`): same pattern — client calls `/member/create` after checking status. If member creation fails post-payment, user sees "contact support" → *"paid but not joined."*
- If the app is killed between gateway success and the insert call, **the payment is lost entirely** — nothing server-side creates the enrollment.
- **Correct design**: backend webhook/verification must create the collection/enrollment atomically; the app should only poll an order status endpoint. This requires backend work — the app alone cannot fully fix this.

### P0-2. Zero idempotency
- No idempotency key anywhere. `handleRequest` in both WebViews can fire multiple times before React state (`paymentProcessed`) commits → double `checkPaymentStatus` → double insert.
- Installment number is computed client-side (`insPaid + 1`) — races/duplicates possible.
- Retry paths (`handleBuyRef` retry Alert) can create a second order for the same intent.

### P0-3. Client-fabricated identifiers sent to the ledger
- `Buy.js` L314–318: if `/orders/create` returns no ID, the app **generates a fake order ID** (`ORD${Date.now()}...`) and proceeds to payment → orphan transaction that `/payment/status` can never match.
- `generateCashPaymentDetails()` (Buy.js, AddNewMember.js): random 10-digit "card numbers" and `CASH-xxxxxx` reasons inserted into the ledger.
- `generateRandomRegNo()` (AddNewMember.js L1119): registration numbers invented client-side when the API omits one → potential collisions with real accounts.
- `userID` hardcoded to `"999"`/`"9999"` in financial inserts.

### P0-4. Unauthenticated money-moving endpoints (backend exposure)
Called with **no auth token**: `/orders/create`, `/payment/status`, `/payment/redirect-url`, `/v1/api/account/insert`, `/v1/api/member/create`, `/digilocker/*`. Anyone with the base URL can insert collections or create members. `initiate-sale` sends the raw token without `Bearer ` prefix while `UserService` uses `Bearer ` — inconsistent contract.

### P0-5. Fragile success/failure detection
- URL matching by substring: `url.includes("/success")`, `"/cancel"` — any gateway intermediate URL containing those strings misfires (this is the likely cause of *"user redirected incorrectly"*).
- `/payment/status` result interpreted by heuristics incl. `message.toLowerCase().includes("success")` (PaymentWebView L209–216). A message like "transaction unsuccessful" **contains "success"** → false positive → enrollment on a failed payment. **This can enroll schemes for failed payments.**
- `merchantId: "T_03342"` hardcoded in the app.

### P0-6. Broken screen: `AadhaarVerification.js`
Imports `{ aadhaarService }` from DigiLockerService, which **only exports `digiLockerService`**, then calls a method `initiateVerification()` that **doesn't exist on either**. This screen crashes on "Verify" — dead code path reachable from routes.

### P0-7. KYC is self-attested to the server
`Userhook.js` sends `kycVerified: true`, `aadhaarVerified: true` from the client after the DigiLocker webview. The client also **auto-accepts Terms & Conditions** on Aadhaar verify (L179–192, L560–585) — a legal/compliance problem and a bypass vector (server trusts client flags).

---

## 3. HIGH-PRIORITY FINDINGS (P1)

### Payments
- **No pending-payment recovery**: `paymentResponse` is saved to AsyncStorage but never read on app restart to resume/verify an in-flight payment.
- **No back-handler in AddNewMember's WebView**: hardware back exits mid-payment silently (Buy flow's PaymentWebView has one; join flow doesn't). State can stay stuck in `isProcessingPayment`.
- **No timeout on any fetch** — a hung `/payment/status` call leaves the user on "Processing Payment" forever.
- Amounts handled as floats (`parseFloat`); no amount echo-verification against `/payment/status` response.
- `PaymentSuccess.js` sends success SMS **from the client** and determines "joining vs installment" from route params only.
- Cash flow: pressing Confirm inserts the ledger row immediately with zero server-side validation of who's collecting the cash.

### Aadhaar/KYC (actual flow: DigiLocker, not OTP)
- Your Phase 3 spec describes an **Aadhaar-OTP** flow; the app implements **DigiLocker redirect**. `AadharModeService.getAadhaarMode()` suggests the backend can switch modes ("AADHAR"), but no OTP UI exists for it. Decision needed (see questions at end).
- `verificationId` generated client-side (`VER_${Date.now()}_random`) — the server should issue it.
- Success detected by redirect to any URL containing `bmgjewellers.com` + 2s `setTimeout`; `onNavigationStateChange` can fire several times → `completeVerification()` runs multiple times (no guard) → duplicate server calls, double navigation.
- A "Yes, I completed it" manual button triggers the same path; the status API is checked (good), but the document endpoint is unauthenticated.
- `DigiLockerWebview` **always** `navigation.replace("UserRegisterForm")` — even when launched from other screens (`sourceScreen` param is ignored) → wrong navigation after profile-side verification.
- Hardcoded masked-Aadhaar fallback `"6485"` (Userhook L540).
- Full Aadhaar numbers stored in AsyncStorage, passed through route params, and **logged via console.log** everywhere.
- No duplicate-verification prevention, no expiry handling, no in-flight request lock.
- MemberDetailsPage *does* gate joining on `aadhaarVerified` + basic profile (good) — but since flags are client-attested (P0-7), the gate is soft.

### API layer & state
- `UserService.request` flags any 200 response whose message contains "invalid/failed/error" as failure → false positives on legitimate messages.
- **No global 401/session-expiry handling** (only MPIN reset maps 401→SESSION_EXPIRED). Expired token = silent failures across the app; launch flow sends users with dead tokens straight to VerifyMpin → "logged in" but every call fails.
- Secrets in URLs: `?mpin=1234`, `?otp=`, `?newPassword=` — captured by server/proxy access logs.
- Two different logout implementations (`clearAuthData` vs `clearUserData`) clear different key sets; `isMpinCreated`/`hasSeenOnboarding` handling can leave inconsistent launch state.
- App.js passes `ref={navigationRef}` to `AppContainer`, which is a plain function component (no `forwardRef`) and never attaches it to `NavigationContainer` → **notification tap navigation is dead**; `navigationService.setGlobalRef` never wired.

### Security/repo hygiene
- **Release keystore `my-release-key.jks` committed to the repo** alongside `google-services.json`. The signing key must be treated as compromised if this repo was ever shared.
- PII (Aadhaar, tokens, MPIN headers, full payloads) logged with `console.log` in production paths.

---

## 4. MEDIUM (P2) — quality/UX
- 6 competing theme/style systems (AppTheme, Theme, MainTheme, colors, Global_Styles, CommonStyles); emoji icons in payment UI.
- `SchemeDetailsPage` Submit `disabled` prop omits `!isAgreed` (only the style greys out); double-tap windows exist wherever loading state is set after async work begins.
- Duplicated asset folders (`images` + `images copy`, ~30 files) shipped in bundle; unused screens (CheckOut, ProductDescription remnants of a store template, "zipsii" assets).
- Alert.alert used for all errors (no consistent toast/dialog system despite FlashMessage being installed).
- `Buy.js` styles recreated on every render (StyleSheet.create inside component).
- Console logging (~hundreds of statements) left in production.

---

## 5. Phase 2 — Customer Journey Map with Failure Points

```
App Launch
 ├─ getAppStatus() fails → app permanently shows DevelopmentScreen (no retry)          [F1]
 └─ authToken exists but EXPIRED → VerifyMpin → dead session, all APIs fail silently  [F2]
Login / Registration
 ├─ OTP/password sent as URL query params                                              [F3]
 └─ Business errors detected by substring heuristics → false failures                  [F4]
Profile Completion (UserRegisterForm)
 └─ Server update fails → "verified locally" — server/client KYC state diverge         [F5]
Aadhaar KYC (DigiLocker)
 ├─ AadhaarVerification screen crashes (broken import)                                 [F6]
 ├─ completeVerification fires multiple times (no guard)                               [F7]
 ├─ Wrong return navigation (always UserRegisterForm)                                  [F8]
 └─ T&C auto-accepted; kycVerified self-attested                                       [F9]
Dashboard → Scheme Selection → Details → Join (AddNewMember)
 ├─ KYC gate relies on client-attested flags                                           [F10]
 ├─ regNo/groupCode chosen client-side, random regNo fallback                          [F11]
 └─ Cash join: member+ledger created with fabricated payment details                   [F12]
Payment (WebView)
 ├─ Substring URL detection → false success/cancel                                     [F13]
 ├─ Hardware back (join flow): exits silently, state stuck                             [F14]
 ├─ App killed/backgrounded here → payment lost, no recovery                           [F15]
 └─ No fetch timeout → eternal "Processing Payment"                                    [F16]
Payment Verification
 ├─ "success" substring heuristic → can enroll FAILED payments                         [F17]
 └─ Client-side check only; backend not source of truth                                [F18]
Scheme Enrollment / Receipt
 ├─ insert/member-create fails AFTER payment → paid-but-not-enrolled                   [F19]  ← your reported bug
 └─ Duplicate inserts possible (no idempotency, racy paymentProcessed)                 [F20]
Dashboard Refresh
 └─ useFocusEffect refetch works, but no invalidation contract; installment flow
    navigates before data settles                                                      [F21]
Installments (Buy) → repeat of F13–F20 with fake fallback order IDs                    [F22]
Claim / Redemption / History
 └─ Read-only lists; history depends on ledger rows the client inserted (F19/F20
    corrupt history)                                                                   [F23]
```

---

## 6. Recommended Fix Plan (for your approval)

**Phase 3 (Aadhaar/KYC)** — fix broken screen, single-flight + guarded completion, honor `sourceScreen` return navigation, remove T&C auto-accept, stop logging/storing full Aadhaar, server-issued verificationId (needs 1 backend change), remove hardcoded "6485".

**Phase 4 (Join flow)** — enforce KYC gate from server profile fetch, remove random regNo, add back-handler to join WebView, disable Submit until agreed, single-submit lock.

**Phases 5–6 (Payments — highest value)** — app side:
1. Strict redirect matching (exact success/failure/cancel URLs).
2. Replace substring status heuristics with a strict whitelist (`orderStatus === "PAID"` / `txnStatus === "SUC"` only).
3. Idempotency: client-generated idempotency key per payment intent, persisted before opening gateway; block duplicate inserts with a persisted "processed" flag keyed by merchantTxnNo.
4. Pending-payment recovery: persist intent at initiate; on app start / screen focus, re-poll `/payment/status` for unresolved intents and resume the flow.
5. Never show PaymentSuccess if enrollment insert failed — show "Payment received, activation pending" state with retry that is idempotent.
6. Remove fake order-ID fallback (fail fast instead), remove client cash-detail fabrication where backend permits.
7. Fetch timeouts (AbortController) + bounded retry on status polling.

**Phase 7 (Webhooks)** — requires backend repo access; from the app side I can only align to a verified-order contract. Flag: the *proper* fix for P0-1 (server creates enrollment on verified payment) is backend work.

**Phases 8–9** — single API client (base URL, Bearer header, timeout, 401 → global logout/re-auth), unify logout, fix navigation ref, remove secrets from URLs (needs backend contract change), strip PII logs.

**Phases 10–12** — double-tap guards, consistent error UI, remove dead code/assets, consolidate theme, TypeScript migration optional.

**Repo hygiene (urgent, outside app code)** — remove `my-release-key.jks` from the repo and rotate the keystore if it ever left your machines.

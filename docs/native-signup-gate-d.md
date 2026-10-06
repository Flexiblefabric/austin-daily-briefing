# Native Signup — Gate D Controlled Production

**Status:** Staging  
**Public signup:** remains Google Form  
**Native signup production mode:** must remain DISABLED until preflight completes

## Architecture decision

FORM-7 Gate D reuses the existing shared production modes `GOOGLE + NATIVE CONTROLLED` / `GOOGLE + NATIVE`; it does not add a new shared intake mode. Native signup gets a separate feature gate:

- Integration Config → `Native Signup Mode`;
- Integration Config → `Native Signup Controlled Email`;
- Script Property → `ADB_NATIVE_SIGNUP_PROD_ENABLED`;
- Script Property → `ADB_NATIVE_SIGNUP_PROD_MODE`;
- Script Property → `ADB_NATIVE_SIGNUP_PROD_ALLOWLIST`;
- Script Property → `ADB_NATIVE_SIGNUP_PROD_SITE_ORIGIN`.

This allows native customization to remain LIVE while native signup is tested in CONTROLLED mode.

## Staging sequence

### D1 — repository staging

- production endpoint source: `apps-script/NativeSignupProd.gs`;
- endpoint QA: `tests/native-signup-prod.test.js`;
- production processor contract: `docs/native-signup-production-processing.md`;
- Welcome renderer compatibility test remains required;
- production-change compatibility matrix must be completed before enabling the endpoint.

### D2 — production schema/config preparation

Only after repository checks pass:

1. create `Native Signup Requests` with the exact Gate B/C schema;
2. create `Native Signup Diagnostics` with the exact Gate B/C schema;
3. add Integration Config row `Native Signup Mode = DISABLED`;
4. add Integration Config row `Native Signup Controlled Email` blank;
5. verify current shared Processor Mode and database Intake Mode remain unchanged;
6. create a fresh production workbook backup if the project backup policy requires one for the schema write.

At this point the feature is installed but inert.

### D3 — separate production web app

Create a **separate Apps Script project/deployment** for native signup production intake. Do not add a second `doPost` to the existing native-customization Apps Script project.

Install the exact current `apps-script/NativeSignupProd.gs`.

Initial Script Properties:

- `ADB_NATIVE_SIGNUP_PROD_ENABLED=FALSE`;
- `ADB_NATIVE_SIGNUP_PROD_MODE=CONTROLLED`;
- `ADB_NATIVE_SIGNUP_PROD_ALLOWLIST` blank;
- `ADB_NATIVE_SIGNUP_PROD_SITE_ORIGIN=https://austindailybriefing.com`.

Before deployment, run `getNativeSignupProdRuntimeStatusV1` for readback and `validateNativeSignupProdPreflightV1` for fail-closed enforcement. The validator must pass only with the endpoint disabled, runtime mode CONTROLLED, blank allowlist, exact site origin, Native Signup Mode DISABLED, blank controlled email, native-capable shared Processor Mode, and empty native request/diagnostic tables.

Deploy a versioned web app and record its `/exec` URL in project documentation. Do not point the public website at it yet.

### D4 — processor integration

Integrate `docs/native-signup-production-processing.md` into the canonical Subscriber Operations prompt without changing Google or native-customization semantics.

Until `Native Signup Mode` is CONTROLLED/LIVE, the live six-hour task must ignore native signup sheets.

Synchronize the active scheduler copy only after the repository prompt merge and exact Specification ID check are reconciled.

### D5 — executable compatibility preflight

Complete `docs/production-change-compatibility-checklist.md`.

Required consumers:

- production Subscriber Operations;
- Welcome Resend dispatcher;
- Daily Resend dispatcher;
- signup-completion/watchdog logic;
- website signup client;
- production native-signup Apps Script endpoint.

FAIL or UNKNOWN blocks enabling controlled native signup.

After synchronizing the current repository copy of `apps-script/ResendTransport.gs`, run `getAdbResendRuntimeStatusV1` for readback and `validateForm7GateDTransportCompatibilityV1` for fail-closed compatibility enforcement. The validator must confirm the shared native-capable mode, valid Native Signup Mode, return-safe Welcome copy in both renderers, and `deliveryInvoked: false` / `writes: false`.

### D6 — controlled identity

Use a two-step controlled identity sequence:

1. **Safety no-op:** the existing production QA profile on Admin Hold may be used first to prove endpoint → processor routing while confirming the hold cannot be bypassed and no Welcome is created.
2. **Mutating case:** choose one operator-owned address that is either a new subscriber or a deliberately prepared Unsubscribed test identity.

Do not use an ordinary reader account for a destructive state transition. The Admin Hold safety test does not satisfy the mutating Gate D pass criterion by itself.

Set:

- `Native Signup Controlled Email` to that normalized address;
- endpoint allowlist to the same address;
- `Native Signup Mode = CONTROLLED`;
- `ADB_NATIVE_SIGNUP_PROD_ENABLED=TRUE`;
- `ADB_NATIVE_SIGNUP_PROD_MODE=CONTROLLED`.

The public website still remains on the Google signup route. Submit only through a controlled test page/request.

### D7 — verify and replay

Verify:

- one staged native request;
- one authorized subscriber-state transition;
- exactly one Signup Action when mutation occurs;
- exactly one Queued Welcome when mutation occurs;
- dispatcher sends exactly once;
- provider ID recorded;
- second processor/dispatcher pass creates/sends zero duplicates;
- non-allowlisted synthetic request produces generic no-op and no staged request.

### D8 — Gate D closeout

Record evidence and return the endpoint to a safe controlled/inert state until Gate E promotion is explicitly approved.

Gate E will separately decide:

- production endpoint LIVE mode;
- public `signup.html` configuration;
- navigation/CTA cutover;
- Google signup fallback retention;
- production observation window.


## D2 result — COMPLETE

Completed 2026-10-04 with the feature inert.

Before the production intake schema change, a fresh private copy of the production intake workbook was created in the same restricted production folder:

- backup ID: `1iJ4i4bRmgs0PwQd-k_g8i3Z374QWLexekmab7d5Acl8`.

Production intake changes:

- created empty `Native Signup Requests` with the approved 11-column schema;
- created empty `Native Signup Diagnostics` with the approved 9-column schema;
- added `Native Signup Mode = DISABLED`;
- added blank `Native Signup Controlled Email`;
- preserved shared production `Intake Mode = GOOGLE + NATIVE`;
- preserved shared production `Processor Mode = GOOGLE + NATIVE`.

Read-back confirmed the two new tabs contain headers only. No request was staged and no subscriber/profile/preference/Signup Action/Outbound Message record was changed.

D3/D4 remain blocked on runtime deployment, canonical Subscriber Operations integration, monitoring integration, runtime parity, and controlled-address selection.


## D4 repository integration — READY FOR MERGE

The canonical repository contracts have been upgraded while Native Signup Mode remains `DISABLED`:

- Subscriber Operations → `ADB-SUBOPS-PROD-1.1`;
- completion contract → `ADB-COMPLETION-0.2`;
- manual reconciler → `ADB-COMPLETION-RECON-0.2`;
- production watchdog → `ADB-WATCHDOG-PROD-2.4`.

All native behavior is feature-gated. With production Native Signup Mode still DISABLED, Subscriber Operations must not read/mutate Native Signup Requests and the watchdog/reconciler must preserve prior Google-only completion behavior.

After repository merge, synchronize the active Subscriber Operations and watchdog scheduler copies to the new exact Specification IDs before considering D4 complete. Do not enable Native Signup Mode during that synchronization.


## D4 scheduler synchronization — COMPLETE

The canonical contract merge was followed immediately by scheduler-copy synchronization:

- Subscriber Operations is enabled and requires `ADB-SUBOPS-PROD-1.1`.
- Watchdog scheduler copy requires `ADB-WATCHDOG-PROD-2.4`.

At the October 4 D4 synchronization check, the watchdog was disabled. That historical state was preserved rather than changed implicitly. October 5 live readback later confirmed the existing watchdog enabled on `ADB-WATCHDOG-PROD-2.4` with its unchanged 09:30 America/Chicago schedule.

Native Signup Mode remains `DISABLED`; the D4 synchronization processed no native signup rows.

## D5 read-only runtime preflight — PARTIAL PASS

A live read-only preflight on 2026-10-04 confirmed D2 remains inert and D4 Subscriber Operations prompt parity remains intact. Production Native Signup Mode is still `DISABLED`, both native-signup production tables are header-only, shared Intake/Processor Mode remains `GOOGLE + NATIVE`, and the retained Admin Hold QA profile is available for the safety no-op.

At the October 4 preflight, live scheduler metadata confirmed the watchdog task had the correct `ADB-WATCHDOG-PROD-2.4` prompt but was disabled. October 5 reconciliation subsequently confirmed it enabled; the October 4 finding remains historical evidence only.

Repository source now exposes harmless runtime status probes:

- `getNativeSignupProdRuntimeStatusV1`;
- `getAdbResendRuntimeStatusV1`.

These allow D3/D5 runtime parity to be demonstrated without sending mail or mutating subscriber state. Exact manual install/parity steps and current blockers are recorded in `docs/native-signup-gate-d-runtime-preflight.md`.

Controlled activation remains blocked until the separate production endpoint is deployed disabled, Resend runtime parity passes, and a mutating operator-owned controlled address is selected.

## October 5 watchdog reconciliation

The disabled-watchdog findings above describe the October 4 preflight. Live scheduler readback on October 5 confirms the existing task is enabled on ADB-WATCHDOG-PROD-2.4 with the unchanged 09:30 America/Chicago schedule and current-day monitoring evidence. The watchdog disabled-state blocker is resolved; this reconciliation did not change tasks. Native Signup Mode remains DISABLED and the separate endpoint, transport runtime parity and mutating controlled-test identity requirements remain open. This update does not authorize Gate D activation.

## D6 readiness — deployment and identities recorded

The separate production native-signup web app has been deployed and its exact `/exec` URL is stored only in the private production Integration Config, not in GitHub. The endpoint remains disabled/inert and the public website still routes signup through the Google Form.

The operator-owned deliverable address for the mutating Gate D test has been selected and is also stored only in the private production control workbook. The retained Admin Hold QA identity is currently prepared as the Sheet-side `Native Signup Controlled Email` for the first safety no-op.

Current safety state:

- `Native Signup Mode = DISABLED`;
- `ADB_NATIVE_SIGNUP_PROD_ENABLED` remains FALSE until the operator arms the test;
- the native-signup Script Property allowlist is not yet configured;
- no production native-signup request has been staged;
- no subscriber/profile/preference/Signup Action/Welcome mutation has occurred.

### Next controlled sequence

1. Set `ADB_NATIVE_SIGNUP_PROD_ALLOWLIST` to the retained Admin Hold QA address.
2. Set `ADB_NATIVE_SIGNUP_PROD_ENABLED=TRUE` while leaving mode `CONTROLLED`.
3. After runtime properties are confirmed, change production `Native Signup Mode` from DISABLED to CONTROLLED and leave the Sheet-side controlled email on the Admin Hold QA identity.
4. Submit one controlled signup request through the separate production endpoint.
5. Run/reconcile Subscriber Operations and verify `admin_hold_noop`, unchanged Admin Hold status, no Welcome queue row and no duplicate identity.
6. Return the endpoint to inert state, then switch both Sheet-side controlled email and Script Property allowlist to the privately selected operator-owned mutating identity for the second controlled test.

Do not commit either private address or the deployment URL to GitHub.

## D6 safety attempt — validator defect and rollback

On 2026-10-06 the first Admin Hold safety request reached the production native-signup endpoint while the feature was armed only for the retained QA identity. The endpoint wrote a privacy-safe `received` diagnostic and then returned `validation_error / invalid_email`; no native request row was staged.

Readback confirmed:

- the Admin Hold subscriber remained unchanged;
- the existing profile remained unchanged;
- no new Signup Action was created;
- no new Welcome was queued or delivered;
- no native request was staged.

Root cause was a production-source escaping defect in `adbSignupProdValidEmail_`: whitespace patterns had been emitted as `/s/` and `[^s@]` rather than `/\\s/` and `[^\\s@]`. This caused any address containing the letter `s` to be rejected as invalid.

Immediate safety response:

- production Integration Config `Native Signup Mode` was returned to `DISABLED`;
- the prepared Admin Hold controlled email was retained for retry;
- public signup remained the Google Form;
- no processor or dispatcher action was run.

Corrective requirement before retry:

1. merge the repository validator fix and regression coverage;
2. synchronize the production Apps Script source to the corrected `NativeSignupProd.gs`;
3. create/update the versioned production web-app deployment so the `/exec` endpoint serves corrected build `native-signup-prod-stage-v1.1`;
4. run runtime readback with the Sheet-side mode still DISABLED and confirm build `native-signup-prod-stage-v1.1`;
5. only then return Sheet-side mode to CONTROLLED;
6. run `runGateDDeploymentSafetyRequestV1()` exactly once. This helper reads the private production `/exec` URL and controlled email from Integration Config and posts through the actual deployed web app rather than calling `doPost()` directly in the editor;
7. verify one staged request, then process/reconcile it through Subscriber Operations for the Admin Hold no-op.

## D6 Admin Hold safety retry — PASS

The corrected production build `native-signup-prod-stage-v1.1` was deployed and the retry was submitted through the actual configured versioned `/exec` endpoint. The request staged successfully and was processed under `ADB-SUBOPS-PROD-1.1` / `ADB-NATIVE-SIGNUP-PROD-0.1` as `Processed / admin_hold_noop`.

Readback confirmed the administrative hold remained intact, the existing profile was unchanged, no native Signup Action was created, no deterministic native Welcome was created, no delivery was invoked, and Subscriber Operations monitoring recorded one processed native-signup Admin Hold no-op with zero errors.

After the pass, Sheet-side `Native Signup Mode` was returned to `DISABLED`. The operator-owned mutating QA identity was verified absent from production Subscribers, Signup Actions and Outbound Messages and is prepared privately for the next controlled test.

Durable evidence: `docs/native-signup-gate-d-safety-result.md`.

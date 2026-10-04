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

The watchdog itself is currently disabled. This state predated the FORM-7 synchronization and was preserved rather than changed implicitly. Gate D controlled-production activation remains blocked until the watchdog is explicitly re-enabled or the project approves another monitoring disposition.

Native Signup Mode remains `DISABLED`; the D4 synchronization processed no native signup rows.

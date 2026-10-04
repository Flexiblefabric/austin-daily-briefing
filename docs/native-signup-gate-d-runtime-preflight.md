# Native Signup — Gate D Runtime Preflight

**FORM-7:** Gate D controlled production  
**Date:** 2026-10-04  
**Status:** PARTIAL PASS — activation still blocked  
**Production mutation:** Not authorized by this preflight

## Purpose

Record the read-only production/runtime state immediately before FORM-7 controlled-production activation and define the exact runtime evidence required to convert remaining UNKNOWN/BLOCKED items to PASS.

## Current production state

Verified read-only:

- production database Environment = `PRODUCTION`;
- production Schema Baseline = `GOOGLE-23-1`;
- production Intake Mode = `GOOGLE + NATIVE`;
- intake Processor Mode = `GOOGLE + NATIVE`;
- Native Signup Mode = `DISABLED`;
- Native Signup Controlled Email is blank;
- Native Signup Requests contains headers only;
- Native Signup Diagnostics contains headers only;
- Subscriber Operations scheduler is enabled and requires `ADB-SUBOPS-PROD-1.1`;
- production watchdog scheduler copy requires `ADB-WATCHDOG-PROD-2.4` but the task is currently disabled;
- a retained Admin Hold QA identity exists for the Gate D safety no-op;
- public production signup still routes through the Google signup form;
- the website native-signup page remains noindex/unlinked and configured for DEV.

No production subscriber/profile/preference/Signup Action/Welcome mutation was performed by this preflight.

## Repository compatibility

PASS:

- `apps-script/NativeSignupProd.gs` production endpoint source and QA;
- `ADB-NATIVE-SIGNUP-PROD-0.1` processor contract;
- Subscriber Operations canonical/scheduler parity at `ADB-SUBOPS-PROD-1.1`;
- completion/reconciler/watchdog repository contracts at their FORM-7 versions;
- state-neutral `WELCOME_V1` copy in repository source;
- existing `GOOGLE + NATIVE` mode remains accepted by the Resend transport;
- D2 production schema/config is installed inert.

## Runtime evidence still required

### 1. Separate production native-signup web app

Create a separate Apps Script project containing the exact current `apps-script/NativeSignupProd.gs`.

Initial Script Properties:

- `ADB_NATIVE_SIGNUP_PROD_ENABLED=FALSE`
- `ADB_NATIVE_SIGNUP_PROD_MODE=CONTROLLED`
- `ADB_NATIVE_SIGNUP_PROD_ALLOWLIST` blank
- `ADB_NATIVE_SIGNUP_PROD_SITE_ORIGIN=https://austindailybriefing.com`

Run `setupNativeSignupProdV1`, then run `getNativeSignupProdRuntimeStatusV1`.

Expected pre-activation status:

- build = `native-signup-prod-stage-v1`;
- production database/intake IDs exact;
- enabled = `false`;
- mode = `CONTROLLED`;
- allowlistConfigured = `false`;
- siteOrigin = `https://austindailybriefing.com`;
- integrationNativeSignupMode = `DISABLED`;
- integrationControlledEmailConfigured = `false`;
- sharedProcessorMode = `GOOGLE + NATIVE`.

Then deploy a versioned web app and record its `/exec` URL. Do not point the public website at it.

### 2. Production Resend runtime parity

Replace the live production Apps Script copy of `ResendTransport.gs` with the exact current repository `main` copy.

Run `getAdbResendRuntimeStatusV1` only. Do not invoke a dispatcher during parity verification.

Expected status:

- build = `resend-transport-form7-v1`;
- currentIntakeMode = `GOOGLE + NATIVE`;
- currentProcessorMode = `GOOGLE + NATIVE`;
- welcomeDeliveryMode = `ENABLED`;
- welcomeCopy = `state-neutral-v1`;
- supportedIntakeModes includes `GOOGLE + NATIVE`.

The current Welcome/Daily script modes should be recorded from the returned status but not changed by parity verification.

### 3. Watchdog operational disposition

Live scheduler metadata shows the canonical `ADB-WATCHDOG-PROD-2.4` prompt is synchronized but disabled.

Gate D activation remains blocked until one of these is explicitly approved:

- re-enable the existing 09:30 America/Chicago watchdog task; or
- approve a temporary alternate monitoring disposition for Gate D.

The recommended path is to re-enable the existing watchdog so controlled native-signup behavior is observed through the production monitoring contract already designed for it.

### 4. Controlled mutating identity

The retained Admin Hold QA profile may be used for the first safety no-op. A separate operator-owned deliverable address is still required for the mutating controlled case.

Do not use an ordinary reader account.

## Activation decision

Current result: **BLOCKED**.

D1, D2 and D4 are complete. D5 repository/data checks pass, but activation is blocked by:

1. D3 production web-app runtime/deployment not yet verified;
2. production Resend runtime parity not yet verified;
3. watchdog task disabled;
4. mutating controlled-test address not yet selected.

Native Signup Mode must remain `DISABLED` until all four blockers are resolved and the compatibility matrix contains no FAIL/UNKNOWN for executable consumers.

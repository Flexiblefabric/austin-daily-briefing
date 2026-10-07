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
- production watchdog scheduler copy requires `ADB-WATCHDOG-PROD-2.4`; October 5 live readback confirms the task is enabled on the unchanged 09:30 America/Chicago schedule;
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

The status functions provide readback; the validators fail closed when Gate D safety assumptions are not satisfied. Both forms of evidence are required.

### 1. Separate production native-signup web app

Create a separate Apps Script project containing the exact current `apps-script/NativeSignupProd.gs`.

Initial Script Properties:

- `ADB_NATIVE_SIGNUP_PROD_ENABLED=FALSE`
- `ADB_NATIVE_SIGNUP_PROD_MODE=CONTROLLED`
- `ADB_NATIVE_SIGNUP_PROD_ALLOWLIST` blank
- `ADB_NATIVE_SIGNUP_PROD_SITE_ORIGIN=https://austindailybriefing.com`

Run `setupNativeSignupProdV1`, then run `getNativeSignupProdRuntimeStatusV1` and `validateNativeSignupProdPreflightV1`.

Expected pre-activation status:

- build = `native-signup-prod-stage-v1.1`;
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

Run `getAdbResendRuntimeStatusV1` and `validateForm7GateDTransportCompatibilityV1` only. Do not invoke a dispatcher during parity verification.

Expected status:

- build = `resend-transport-form7-v1`;
- currentIntakeMode = `GOOGLE + NATIVE`;
- currentProcessorMode = `GOOGLE + NATIVE`;
- welcomeDeliveryMode = `ENABLED`;
- welcomeCopy = `state-neutral-v1`;
- supportedIntakeModes includes `GOOGLE + NATIVE`.

The current Welcome/Daily script modes should be recorded from the returned status but not changed by parity verification.

### 3. Watchdog operational disposition — RESOLVED

The October 4 preflight observed the canonical `ADB-WATCHDOG-PROD-2.4` task disabled. October 5 live scheduler readback confirms the same task is now enabled on the unchanged 09:30 America/Chicago schedule with current-day monitoring evidence.

No additional watchdog action is required before controlled activation unless its live state changes again.

### 4. Controlled mutating identity

The retained Admin Hold QA profile may be used for the first safety no-op. A separate operator-owned deliverable address is still required for the mutating controlled case.

Do not use an ordinary reader account.

## Activation decision

Current result: **BLOCKED**.

D1, D2 and D4 are complete. D5 repository/data checks pass, but activation is blocked by:

1. D3 production web-app runtime/deployment not yet verified;
2. production Resend runtime parity not yet verified;
3. mutating controlled-test address not yet selected.

Native Signup Mode must remain `DISABLED` until all four blockers are resolved and the compatibility matrix contains no FAIL/UNKNOWN for executable consumers.

## October 5 watchdog reconciliation

The disabled-watchdog findings above describe the October 4 preflight. Live scheduler readback on October 5 confirms the existing task is enabled on ADB-WATCHDOG-PROD-2.4 with the unchanged 09:30 America/Chicago schedule and current-day monitoring evidence. The watchdog disabled-state blocker is resolved; this reconciliation did not change tasks. Native Signup Mode remains DISABLED and the separate endpoint, transport runtime parity and mutating controlled-test identity requirements remain open. This update does not authorize Gate D activation.

## Runtime parity evidence — 2026-10-05

Operator-run production validators passed without mutation:

- `validateNativeSignupProdPreflightV1` returned build `native-signup-prod-stage-v1`, endpointEnabled=false, endpointMode=CONTROLLED, allowlistConfigured=false, Native Signup Mode=DISABLED, Processor Mode=`GOOGLE + NATIVE`, requestRows=0, diagnosticRows=0, exact site origin, and subscriberMutation=false.
- `validateForm7GateDTransportCompatibilityV1` returned transport=Resend, Intake/Processor Mode=`GOOGLE + NATIVE`, Native Signup Mode=DISABLED, Welcome copy=`RETURN_SAFE`, deliveryInvoked=false, and writes=false.

The Apps Script UI does not permit a blank property value, so `ADB_NATIVE_SIGNUP_PROD_ALLOWLIST` is intentionally absent until the controlled mutating address is selected. The runtime treats the absent property as blank, and the endpoint preflight passed with `allowlistConfigured=false`.

Runtime parity is therefore PASS. Remaining pre-activation items are recording the production native-signup web-app `/exec` URL and selecting one operator-owned deliverable address for the mutating controlled test.

## Deployment and controlled-test readiness — 2026-10-05

The separate production native-signup web app is deployed. Its exact `/exec` URL is stored only in private production configuration and intentionally omitted from repository documentation.

A deliverable operator-owned mutating QA identity has been selected and stored privately. The retained Admin Hold QA identity is prepared as the current Sheet-side controlled email for the safety no-op. Native Signup Mode remains DISABLED and the endpoint is not armed.

The remaining pre-test action is runtime-only: configure the endpoint allowlist with the Admin Hold QA address and set `ADB_NATIVE_SIGNUP_PROD_ENABLED=TRUE`. Only after those properties are confirmed should Sheet-side Native Signup Mode move to CONTROLLED for the safety request.

## Corrected deployment verification — build v1.1

After the 2026-10-06 email-validator rollback, current production source fingerprint is `native-signup-prod-stage-v1.1`. The prior October 5 evidence showing build `native-signup-prod-stage-v1` remains valid historical preflight evidence for the earlier version but does not prove the corrected deployment is active.

Before re-arming Gate D:

1. synchronize the current repository `apps-script/NativeSignupProd.gs` into the production Apps Script project;
2. update the versioned web-app deployment so the recorded `/exec` URL serves the new version;
3. run `getNativeSignupProdRuntimeStatusV1` and confirm build `native-signup-prod-stage-v1.1` while Sheet-side Native Signup Mode remains DISABLED;
4. only after that readback may Sheet-side mode return to CONTROLLED;
5. submit the Admin Hold retry with `runGateDDeploymentSafetyRequestV1()`, which calls the private configured `/exec` URL through `UrlFetchApp` and therefore tests the deployed endpoint rather than editor head code.

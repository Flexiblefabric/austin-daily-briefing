# Native Signup — Gate D Controlled Production Result

**FORM-7 Gate:** D — controlled production  
**Result:** PASS — COMPLETE  
**Date:** 2026-10-06  
**Public routing:** unchanged; Google signup remains public

## Controlled-production evidence

Gate D completed both required production paths through the separate versioned native-signup web app.

### Administrative-hold safety path

The retained Admin Hold QA identity staged one request through deployed build `native-signup-prod-stage-v1.1`. Canonical Subscriber Operations completed it as `Processed / admin_hold_noop`.

Readback confirmed the hold and profile were preserved, with no native Signup Action, no Welcome queue row and no duplicate identity.

### Mutating new-subscriber path

A separate operator-owned deliverable QA identity with no prior production subscriber/action/Welcome record staged exactly one request through the deployed `/exec` endpoint.

Canonical production processing created exactly:

- one Active subscriber;
- one Active profile using the next sequential production Profile ID;
- 23 active interest preferences initialized to Normal / score 1;
- one deterministic native Signup Action;
- one deterministic Queued `WELCOME_V1`.

The native request completed as `Processed / new_subscriber`. No delivery fields were written by Subscriber Operations.

### Welcome delivery ownership

The live hourly Resend Welcome dispatcher delivered the queued Welcome naturally after processing.

Production queue readback confirmed:

- exactly one native Welcome row;
- status `Sent`;
- exactly one Resend provider ID recorded in the dispatcher-owned delivery field;
- eligibility was rechecked immediately before delivery.

The controlled QA inbox independently confirmed receipt of the Welcome.

A later manual invocation of `dispatchQueuedWelcomeMessagesViaResendV1()` returned `mode=LIVE, sent=0, skipped=0`. This is the required zero-send replay check and proves the already-Sent Welcome was not resent.

### Duplicate and replay verification

Post-delivery readback confirmed exactly:

- one subscriber;
- one profile;
- 23 preferences;
- one deterministic Signup Action;
- one deterministic Welcome row;
- one provider handoff.

The terminal native request is no longer eligible for processor mutation, and the manual dispatcher replay produced zero sends.

No non-allowlisted production identity was processed during Gate D. Endpoint and processor controlled-mode gates remained narrow throughout the tests.

## Safety state after pass

After the mutating processor transaction:

- Sheet-side `Native Signup Mode` was returned to `DISABLED`;
- public website signup remained on the Google Form;
- private Integration Config records Gate D controlled-production PASS;
- the separate production endpoint remains deployed but must be disarmed at the Script Property layer before Gate D is marked fully closed.

## Final closeout — PASS

The endpoint Script Property disarm was completed after the controlled-production pass:

- `ADB_NATIVE_SIGNUP_PROD_ENABLED=FALSE`;
- `ADB_NATIVE_SIGNUP_PROD_ALLOWLIST` removed;
- `ADB_NATIVE_SIGNUP_PROD_MODE=CONTROLLED` retained;
- `ADB_NATIVE_SIGNUP_PROD_SITE_ORIGIN=https://austindailybriefing.com` retained;
- Sheet-side `Native Signup Mode=DISABLED`.

The operator-run runtime logger returned build `native-signup-prod-stage-v1.1`, `enabled=false`, `mode=CONTROLLED`, `allowlistConfigured=false`, exact site origin, `integrationNativeSignupMode=DISABLED`, and shared `Processor Mode=GOOGLE + NATIVE`.

Gate D is therefore fully complete. The runtime logging wrapper used for this readback is retained in repository source as a read-only diagnostic helper. Gate E public cutover is a separate promotion step.

# Native Signup — Gate E Public Cutover

**FORM-7 Gate:** E — public cutover  
**Status:** STAGED — explicit promotion authorized 2026-10-06; runtime LIVE arm and merge remain gated  
**Gate D dependency:** COMPLETE  
**Fallback:** retain the Google signup form through observation and until FORM-10

## Goal

Promote the proven native signup path from controlled production to the public ADB website without changing subscriber-creation ownership, Welcome delivery ownership, shared Processor Mode, or the Google fallback.

Gate E changes routing and the native-signup feature gate only. Production Subscriber Operations remains the sole owner of subscriber/profile/preference/Signup Action/Welcome-queue mutation, and the Resend Welcome dispatcher remains the sole owner of delivery.

## Pre-cutover baseline

Gate D closed with:

- deployed build `native-signup-prod-stage-v1.1`;
- endpoint `enabled=false`;
- endpoint mode `CONTROLLED`;
- endpoint allowlist absent;
- Sheet-side `Native Signup Mode=DISABLED`;
- shared `Processor Mode=GOOGLE + NATIVE`;
- exact production site origin;
- one Admin Hold no-op and one new-subscriber controlled path passed;
- exactly one Welcome delivered with provider ID and zero-send replay;
- public signup still routed to the Google form.

The production transport compatibility validator passed during Gate D and no shared Processor Mode change is required for Gate E.

## E1 — repository cutover staging

Prepare, but do not merge, the public-site cutover:

- set `site/signup-config.js` to environment `production` and the versioned production native-signup endpoint;
- remove DEV-preview metadata/copy from `site/signup.html`;
- route public Join/Get Briefing CTAs to `signup.html`;
- retain an explicit Google signup fallback link on `signup.html`;
- add `signup.html` to the public sitemap;
- preserve the current generic browser response and no-enumeration behavior;
- preserve the exact Gate D endpoint source and processor contracts.

The prepared branch must remain unmerged while the endpoint is disabled.

## E2 — runtime LIVE arm

Immediately before public merge, set the production native-signup Apps Script properties to:

- `ADB_NATIVE_SIGNUP_PROD_ENABLED=TRUE`;
- `ADB_NATIVE_SIGNUP_PROD_MODE=LIVE`;
- `ADB_NATIVE_SIGNUP_PROD_ALLOWLIST` absent;
- `ADB_NATIVE_SIGNUP_PROD_SITE_ORIGIN=https://austindailybriefing.com`.

Set production Integration Config:

- `Native Signup Mode=LIVE`;
- `Native Signup Controlled Email` blank;
- shared `Processor Mode` remains exactly `GOOGLE + NATIVE`.

Then run `logNativeSignupProdRuntimeStatusV1()`. Promotion is blocked unless readback shows:

- build `native-signup-prod-stage-v1.1`;
- `enabled=true`;
- `mode=LIVE`;
- `allowlistConfigured=false`;
- exact site origin;
- `integrationNativeSignupMode=LIVE`;
- `integrationControlledEmailConfigured=false`;
- `sharedProcessorMode=GOOGLE + NATIVE`.

## E3 — compatibility gate

Before merge, verify:

- production Subscriber Operations remains enabled on `ADB-SUBOPS-PROD-1.1`;
- the production watchdog remains enabled on `ADB-WATCHDOG-PROD-2.4`;
- Welcome and daily Resend transport compatibility remains PASS for `GOOGLE + NATIVE`;
- no Gate D request remains eligible for replay or duplicate mutation;
- no shared Intake/Processor mode is being changed by Gate E;
- repository endpoint source matches deployed build `native-signup-prod-stage-v1.1` aside from the read-only runtime logging wrapper if that wrapper was added directly during closeout.

FAIL or UNKNOWN blocks public merge.

## E4 — public merge and verification

After E2/E3 pass:

1. merge the prepared Gate E branch;
2. require the GitHub Pages deployment to complete successfully;
3. verify `https://austindailybriefing.com/signup.html` loads the production page;
4. verify homepage and public Get the Briefing links resolve to `signup.html`;
5. verify the page retains the Google signup fallback;
6. verify the browser config reports environment `production` and points to the production endpoint;
7. verify no unrelated public navigation or customization route regressed.

Gate E passes when the native page is publicly routed and the runtime LIVE gate is verified. Normal-cycle behavior moves to Gate F observation.

## Gate F handoff

Observe normal production behavior for:

- native requests staged from the public page;
- processor health and terminal outcomes;
- no duplicate subscriber/profile/action/Welcome creation;
- Welcome queue ownership and Resend provider handoff;
- rate-limit/honeypot diagnostics;
- unrelated Google/native customization processing;
- daily briefing delivery and watchdog health.

Keep the Google signup fallback available during this observation.

## Rollback

If Gate E must be reversed:

1. restore public Get the Briefing links to the Google signup form;
2. set Sheet-side `Native Signup Mode=DISABLED`;
3. set `ADB_NATIVE_SIGNUP_PROD_ENABLED=FALSE`;
4. restore `ADB_NATIVE_SIGNUP_PROD_MODE=CONTROLLED`;
5. keep the endpoint allowlist absent;
6. do not delete native request/diagnostic history;
7. explicitly review any staged-but-unprocessed native request before later replay;
8. record any completed public rollback in the changelog and registry.

Rollback does not require changing the shared `GOOGLE + NATIVE` Processor Mode because native customization independently uses that shared production state.

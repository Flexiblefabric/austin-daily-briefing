# Native customization production cutover

Status: controlled production rollout. Gates A–D are complete; Gate E public cutover is pending. Google customization remains the public route.

## Objective

Promote the validated native customization flow into production without replacing the existing production subscriber control plane.

Target production flow:

`customize.html → production Apps Script native intake → confirmation email → confirm.html#env=production&token=… → confirm-prod.austindailybriefing.com → production confirmation relay → production Native Verification Queue → Production Subscriber Operations → Profiles / Preferences`

The Google customization form remains available as an operator/fallback path through the observation window.

## Ownership boundary

The production native Apps Script endpoint may:

- validate/normalize requests;
- look up the matching production subscriber/profile;
- rate-limit and suppress abuse;
- write production Native Customize Requests / Native Verification Queue / privacy-safe diagnostics;
- send the single-use confirmation email;
- validate the signed relay;
- mark a valid request and verification Confirmed.

It must not mutate production Profiles or Preferences.

Production Subscriber Operations remains the sole owner of applying confirmed native customization payloads to Profiles / Preferences and marking native request/verification rows Applied.

## Gate A — freeze known-good DEV

Required:

- first-party DEV confirmation QA is recorded as passed;
- PR #44 is merged;
- DEV endpoint, Worker, and confirmation page remain available as rollback/reference;
- no additional DEV behavior changes during the production staging cycle unless a production-discovered defect requires a new DEV round.

Status at staging start: satisfied.

## Gate B — production backend staging

Repository components:

- `apps-script/NativeCustomizationProd.gs`
- `apps-script/NativeCustomizationProdQa.gs`
- `workers/confirmation-relay-prod/`
- environment-aware `site/confirm.js` / `confirm-config.js`
- staged native-processing rules in the canonical Production Subscriber Operations prompt

Production Apps Script is a separate deployment/project from DEV.

Required production Script Properties:

- `ADB_NATIVE_CUSTOMIZE_PROD_ENABLED`
- `ADB_NATIVE_CUSTOMIZE_PROD_MODE` = CONTROLLED initially
- `ADB_NATIVE_CUSTOMIZE_PROD_WEB_APP_URL`
- `ADB_NATIVE_CUSTOMIZE_PROD_SITE_ORIGIN=https://austindailybriefing.com`
- `ADB_NATIVE_CUSTOMIZE_PROD_SEND_EMAIL=TRUE`
- `ADB_NATIVE_CUSTOMIZE_PROD_ALLOWLIST` = controlled-test recipient(s) only
- `ADB_NATIVE_CUSTOMIZE_PROD_CONFIRM_PAGE_URL=https://austindailybriefing.com/confirm.html`
- `ADB_NATIVE_CUSTOMIZE_PROD_RELAY_SECRET` = new production-only secret
- `RESEND_API_KEY`

Do not reuse the DEV relay secret.

Before any controlled production request:

1. copy production Apps Script files into the production native Web Script project;
2. set properties with `ENABLED=FALSE` first;
3. run `runNativeCustomizationProdUnitTestsV1()`;
4. run `validateNativeCustomizationProdV1()`;
5. confirm exact production IDs and Environment/Integration Config checks pass;
6. deploy the production web app;
7. configure the production relay Worker secrets;
8. with `ADB_NATIVE_CUSTOMIZE_PROD_ENABLED=FALSE`, POST to `/api/customize/probe` and require `relay_ready`; this validates Worker → HMAC → Apps Script without creating production native sheets;
9. attach `confirm-prod.austindailybriefing.com` and verify the probe plus CORS/preflight;
10. keep the public customization page on DEV / non-production intake.

Production intake currently remains `Processor Mode = GOOGLE ONLY`. That is expected during Gate B.

## Gate C — production relay validation

Deploy `adb-confirmation-relay-prod` first on workers.dev.

Worker secrets:

- `ADB_APPS_SCRIPT_CONFIRM_URL` = current production native Apps Script /exec URL
- `ADB_CONFIRM_RELAY_SECRET` = exact production relay secret matching Apps Script

Expected non-writing probe result through Worker while the production endpoint is still disabled:

`{"ok":true,"status":"relay_ready","productionWritesPerformed":false}`

The probe does not call the production confirmation transaction and does not create production native sheets.

Then attach Worker Custom Domain:

`confirm-prod.austindailybriefing.com`

Verify:

- POST `/api/customize/probe` remains `relay_ready`;
- OPTIONS from `https://austindailybriefing.com` returns allowed origin/method/header;
- DEV Worker/domain remains unchanged.

### Gate C result

Status: **Passed**.

Operator-confirmed production relay checks:

- workers.dev probe returned `relay_ready` with `productionWritesPerformed:false`;
- production Worker Custom Domain `confirm-prod.austindailybriefing.com` resolved and served the Worker;
- custom-domain `/api/customize/probe` returned `relay_ready`;
- browser preflight from `https://austindailybriefing.com` passed with the expected CORS policy;
- production Apps Script remained disabled during validation;
- no production native intake sheets or subscriber preference writes were required for Gate C.

Gate D is the first intentional production native-intake write and still requires explicit approval immediately before execution.

## Gate D — controlled production request

This gate is the first intentional native production-data write and requires explicit operator approval immediately before execution.

Preparation:

1. after explicit Gate D approval, create/validate production Native Customize Requests, Native Verification Queue, and Native Customize Diagnostics sheets by running `setupNativeCustomizationProdV1()`;
2. add Integration Config row `Native Customize Controlled Email` with the one approved production test address;
3. change Integration Config Processor Mode from `GOOGLE ONLY` to `GOOGLE + NATIVE CONTROLLED`;
4. update the active Production Subscriber Operations scheduler copy from the staged canonical prompt;
5. set Apps Script `ADB_NATIVE_CUSTOMIZE_PROD_MODE=CONTROLLED`;
6. set the same approved address in `ADB_NATIVE_CUSTOMIZE_PROD_ALLOWLIST`;
7. set `ADB_NATIVE_CUSTOMIZE_PROD_ENABLED=TRUE`;
8. keep public `customize.html` pointed away from production.

Controlled request sequence:

1. submit exactly one native production customization for the approved address using a controlled/manual production endpoint invocation or controlled page configuration;
2. verify one Pending Confirmation request and one Pending verification;
3. verify confirmation email links to `https://austindailybriefing.com/confirm.html#env=production&token=…`; the earlier `prod` alias remains compatibility-only;
4. confirm via the ADB page;
5. verify request + verification become Confirmed;
6. run Production Subscriber Operations once;
7. verify requested production profile/preferences changed and native request + verification became Applied;
8. run Production Subscriber Operations again or reconcile immediately;
9. verify zero duplicate application;
10. verify no unrelated subscriber/profile was changed.

Abort Gate D immediately on any identity, schema, environment, linkage, or exactly-once mismatch.

### Gate D result

Status: **Passed**.

Controlled production validation completed successfully:

- exactly one native production request was staged for the authorized controlled profile;
- the request entered `Pending Confirmation` and the linked verification entered `Pending`;
- the first-party confirmation email was delivered;
- an environment-alias defect in the first production confirmation link (`env=prod` vs canonical `production`) was identified before token consumption, fixed in PR #50, and the original single-use token remained valid;
- confirmation then moved both records to `Confirmed`;
- the controlled native payload applied one preference change to P001 and updated only that profile's native submission metadata;
- request and verification then moved to `Applied` with matching application timestamps;
- a post-application eligibility check found no remaining eligible copy of the request, demonstrating the exactly-once guard for the controlled request;
- the native request identifier appears only on the intended P001 preference row and P001 profile metadata;
- no unrelated subscriber/profile mutation was identified in the controlled verification.
- a second browser-originated controlled request was intentionally submitted to validate the production page path. It was confirmed but was not intended for application. During the 2026-10-03 reconciliation, the request and linked verification were closed as `Cancelled` without changing subscriber preferences.

The controlled preference change from the first request is test state and may be restored separately before or during Gate E.

## Gate E — public cutover

### Gate E preflight

Before changing the public Customize route:

- require no unintended Pending or Confirmed controlled native request;
- align production Intake Mode, intake Processor Mode, and Release Config Processor Mode with the intended rollout state;
- confirm the canonical Daily Briefing and Production Health Watchdog safety gates permit that authorized intake state;
- synchronize the active task wrappers to the canonical Daily Briefing and Watchdog specification IDs;
- reconcile `PROJECT_STATE.json`, generated internal documentation, changelog, and immutable snapshot;
- preserve Production Subscriber Operations as the only owner that applies confirmed native payloads to Profiles / Preferences;
- keep the Google customization form available as fallback during observation.

Only after this preflight passes:

- change `customize-config.js` from DEV endpoint to production native endpoint;
- remove Controlled DEV presentation from `customize.html`;
- production endpoint mode remains CONTROLLED for a final browser-originated control test if desired;
- then change Apps Script mode to LIVE;
- change Integration Config Processor Mode to `GOOGLE + NATIVE`;
- production confirm links use canonical `#env=production`; `prod` remains compatibility-only;
- Google customization form remains available as fallback/operator path;
- update any public copy that materially describes the old Google handoff.

LIVE mode in `NativeCustomizationProd.gs` fails closed unless Processor Mode is exactly `GOOGLE + NATIVE`.

## Gate F — observation

Minimum observation: 24 hours and at least one normal Subscriber Operations cycle after public cutover.

Observe:

- requests staged;
- confirmation delivery;
- first-party confirmation success;
- pending/confirmed/applied state transitions;
- rate-limit/honeypot diagnostics;
- processor success;
- no duplicate application;
- no unrelated subscriber changes;
- no Welcome/daily briefing ownership regressions.

Keep Google Form fallback available.

## Gate G — closeout

After a clean observation window:

- mark FORM-6 Complete;
- keep or explicitly retire the Google fallback only through a later FORM-10 decision;
- record production architecture change in CHANGELOG;
- update PROJECT_STATE.json;
- create required immutable snapshot;
- regenerate internal Architecture/Operations/Status docs;
- record final production verification.

## Rollback

If production native intake must be stopped:

1. set `ADB_NATIVE_CUSTOMIZE_PROD_ENABLED=FALSE`;
2. restore public Customize link/endpoint to the Google fallback or previous safe path;
3. set Integration Config Processor Mode back to `GOOGLE ONLY`;
4. do not delete production native request/verification/diagnostic history;
5. confirmed-but-unapplied native requests must be reviewed explicitly before any later replay;
6. do not delete or mutate Google Form history;
7. record rollback in changelog/snapshot if public production cutover had occurred.

Rollback does not require disabling the production relay Worker; an invalid/expired token remains non-mutating when the production endpoint is disabled.

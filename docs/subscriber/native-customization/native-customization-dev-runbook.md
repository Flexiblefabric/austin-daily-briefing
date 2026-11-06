# Native Customization DEV Runbook

**Status:** DEV QA complete; retained as historical/reference runbook  
**Applies to:** `apps-script/NativeCustomizationDev.gs`, `apps-script/NativeCustomizationDevQa.gs`  
**Production writes:** Prohibited

## 1. Purpose

This runbook covers the first controlled implementation of the native customization intake and verification flow.

The DEV code is hard-wired to the existing DEV spreadsheets:

- Google Forms DEV Intake
- DEV Subscriber Preferences

The code also contains explicit production IDs only for collision checks. It must never write to them.

## 2. Recommended Apps Script project

Use a **separate standalone DEV Apps Script project** for this endpoint.

This keeps the public web-app deployment isolated from the larger production transport project and allows a smaller permission surface while preserving the same Google Sheets + Apps Script architecture.

Copy into the DEV project:

- `NativeCustomizationDev.gs`
- `NativeCustomizationDevQa.gs`

Do not copy production subscriber-operation code into the DEV endpoint project unless a later test specifically requires it.

## 3. Initial Script properties

Set:

```text
ADB_NATIVE_CUSTOMIZE_DEV_ENABLED=TRUE
ADB_NATIVE_CUSTOMIZE_DEV_SITE_ORIGIN=https://austindailybriefing.com
ADB_NATIVE_CUSTOMIZE_DEV_SEND_EMAIL=FALSE
ADB_NATIVE_CUSTOMIZE_DEV_TEST_EMAIL=<controlled DEV subscriber>
ADB_NATIVE_CUSTOMIZE_DEV_ALLOWLIST=<same controlled address>
```

Do **not** set the Resend key or enable email yet.

## 4. Initial validation

Run in order:

1. `setupNativeCustomizationDevV1()`
2. `validateNativeCustomizationDevV1()`
3. `runNativeCustomizationDevUnitTestsV1()`
4. `stageNativeCustomizationDevControlledTestV1()`
5. `inspectNativeCustomizationDevStateV1()`

Expected initial behavior:

- two DEV-only sheets are created if absent;
- unit tests pass;
- one request is staged as `Staged — Email Suppressed`;
- no verification email is sent;
- no DEV profile preference is changed;
- no production spreadsheet is touched.

## 5. DEV web-app deployment

After the initial checks pass:

1. Deploy as a **Web app**.
2. Execute as the deploying operator.
3. Allow anonymous access for the narrow request endpoint.
4. Copy the current `/exec` deployment URL into Script property:
   `ADB_NATIVE_CUSTOMIZE_DEV_WEB_APP_URL`.
5. Re-run `validateNativeCustomizationDevV1()`.

Do not enable controlled email until the deployed URL is current.

## 6. Controlled email confirmation

For one allowlisted address:

1. confirm `ADB_NATIVE_CUSTOMIZE_DEV_ALLOWLIST` contains only the test address;
2. add `RESEND_API_KEY` to Script properties;
3. set `ADB_NATIVE_CUSTOMIZE_DEV_SEND_EMAIL=TRUE`;
4. clear the test throttle if needed with `clearNativeCustomizationDevTestThrottleV1()`;
5. run `stageNativeCustomizationDevControlledTestV1()`;
6. confirm receipt of the controlled DEV message;
7. open the link;
8. verify that simply opening the page does not apply changes;
9. press **Confirm changes** and verify the browser navigates to the confirmation result page;
10. run `inspectNativeCustomizationDevStateV1()` and confirm one verification is `Confirmed`;
11. run `processConfirmedNativeCustomizationDevV1()`;
12. verify the intended DEV profile changes occurred exactly once;
13. run the processor a second time and verify zero additional applications.

## 7. Security tests

Before connecting the website prototype:

- unknown email returns the same accepted browser state as a known subscriber;
- malformed email returns only a form-validation error;
- all Keep current is rejected as no change;
- unsupported fields/values fail server-side;
- duplicate parameter names fail;
- honeypot submissions no-op;
- request body size limit works;
- rapid repeat requests are throttled;
- repeated identical requests do not generate duplicate confirmations;
- invalid token does not confirm;
- expired token does not confirm;
- opening a valid token link does not consume it;
- first explicit confirmation click submits a top-level POST to the deployed `/exec` URL and confirms it;
- a repeated confirmation attempt does not confirm again;
- processor applies Confirmed request once;
- production IDs receive no writes.

## 8. Website connection

The staged browser client uses:

- `site/customize-config.js` for the environment-specific DEV endpoint;
- a real POST form targeting a hidden iframe;
- `application/x-www-form-urlencoded` browser submission to the DEV Apps Script `/exec` URL;
- the existing `company` honeypot;
- a `postMessage` result listener limited to the hidden result frame and expected Apps Script / Googleusercontent origins;
- local rendering of generic accepted, validation, throttling, and temporary-error states;
- no subscriber-existence or saved-preference disclosure;
- `noindex` and no public navigation link while in DEV.

The committed DEV endpoint remains blank until the operator supplies the exact current Apps Script `/exec` URL. With an empty or invalid endpoint, the browser client disables submission instead of falling back to another target.

Controlled website QA sequence:

1. set the exact current DEV `/exec` URL in `site/customize-config.js`;
2. build and inspect the site preview;
3. deploy the unlinked/noindex page;
4. submit one known allowlisted DEV subscriber request through the website;
5. verify the page renders the generic accepted state without revealing subscriber status;
6. verify one new Pending Confirmation request and verification appear in the DEV intake;
7. confirm through the emailed single-use link;
8. verify Confirmed state, then run the DEV processor;
9. verify one application and zero on immediate replay;
10. exercise invalid email, no-change, duplicate, throttle, honeypot, unknown-email, and malformed/unsupported-field cases before any production promotion.

## 9. Promotion boundary

DEV success does not authorize production promotion.

Production requires:

- reviewed production web-app deployment settings;
- final endpoint/runtime property review;
- controlled end-to-end test against production-compatible staging;
- privacy copy update where Google Forms handoff changes;
- public navigation/link update;
- fallback Google customization form retained;
- explicit promotion approval.


## 10. Confirmation UI implementation note

Apps Script `HtmlService` pages are rendered in a sandboxed iframe. Controlled browser QA showed that the `google.script.run` confirmation path was not reliable in this deployment: clicking **Confirm changes** navigated to a blank Apps Script shell and left the verification in `Pending`.

The DEV confirmation page now uses a plain HTML form with `method="post"`, `target="_top"`, and the configured DEV `/exec` URL as its action. The POST contains only `action=confirm` and the raw verification token. The existing `doPost` confirmation route hashes and validates the token under the script lock, enforces expiry and single use, and returns a minimal confirmation result page.

Opening the email link remains read-only. The raw token exists only in the email URL and transient confirmation form; it is not written to Sheets or logs.

The unit suite includes a regression check that the generated confirmation page contains an explicit POST, a top-level target, the confirmation action, and a token field, and does not depend on `google.script.run`.


### Browser result postMessage regression

Controlled website QA on 2026-09-27 proved that the request itself was accepted and the confirmation email was sent, but the ADB page timed out waiting for the hidden iframe result. The cause matched the earlier HtmlService script-closure defect: the result messenger emitted an escaped `<\\/script>` sequence, so `window.parent.postMessage(...)` did not execute. The DEV endpoint now emits a real closing script tag, and the unit suite verifies both the postMessage call and valid script closure.

### Browser result relay refinement

A second controlled website submission confirmed the request and email path worked while the ADB page still timed out. The HtmlService result runs inside Google's sandboxed frame hierarchy, so sending to `window.parent` is not sufficient to reach the ADB top-level page reliably. The staged fix now sends the result to `window.top` and binds each browser submission/result pair with a per-request random nonce. The ADB page accepts only HTTPS Apps Script/Googleusercontent result origins and a matching nonce before showing the generic accepted state.


### Browser acknowledgment fallback

A fresh Incognito-window test ruled out stale browser assets. The ADB page still remained in the `Submitting…` state even when the cross-origin result relay did not arrive. The browser client therefore no longer treats Apps Script `postMessage` as the only completion signal.

The hidden result iframe now provides a transport-level fallback: once the form-target iframe finishes loading after a submission, the page shows a privacy-preserving generic submitted state if no authenticated `postMessage` result arrives within 500 ms. A matching nonce-bound `postMessage` still takes precedence and can render validation, throttling, or temporary-error states.

The fallback copy deliberately does not claim that the address is subscribed or that an email was definitely sent. It says the request was submitted and that an eligible subscribed address will receive a confirmation link.

Client-side email validation was also tightened to reject obviously malformed domain labels, including labels ending in a hyphen, before submission.


### Honeypot/autofill diagnostic refinement

After the iframe-load fallback was deployed, a valid active DEV subscriber submission still produced no new request row and no confirmation email. Because the request did not reach the staging-row creation step, the remaining silent pre-stage paths were narrowed to honeypot, throttling, inactive/unknown subscriber handling, or recent-duplicate suppression.

The original honeypot field used the semantic name `company`, which can be populated by browser autofill even though it is visually hidden. The website now uses the opaque `form_check` field with no business/profile meaning. The DEV endpoint temporarily continues accepting the legacy `company` key during the transition, but only the new field is rendered by the website.

The endpoint also writes privacy-safe console events for silent no-op reasons: `honeypot`, `rate_limited_*`, `unknown_or_inactive`, and `recent_duplicate`. These diagnostics do not log the raw email address, token, or preference payload and remain DEV-only.


### Durable DEV diagnostics

The Apps Script Executions view does not reliably expose console output for anonymous web-app `doPost` calls. Do not depend on execution-log visibility for browser QA.

The DEV endpoint now persists privacy-safe diagnostics to a third DEV-only sheet named `Native Customize Diagnostics`. Each browser request records a `received` event with a truncated SHA-256 email hash, whether a client nonce was present, and a build ID. Early exits record a second row with the precise reason, including `honeypot`, `rate_limited_cooldown`, `rate_limited_address_cap`, `unknown_or_inactive`, `recent_duplicate`, or validation errors. Successfully staged requests record `staged`.

No raw email address, raw token, or preference payload is written to this sheet.

After copying the updated Apps Script files into Web Scripts, run `setupNativeCustomizationDevV1()` once to create/validate the diagnostics sheet, run `runNativeCustomizationDevUnitTestsV1()`, and deploy a new web-app version. After the next website submission, the diagnostics sheet can be inspected directly or by running `inspectNativeCustomizationDevDiagnosticsV1()`.


### Controlled DEV QA closeout

Controlled browser QA passed after correcting deployment URL drift between the public site configuration and the current Apps Script DEV web-app deployment.

Final passing sequence:
- live customization page submitted a valid active DEV subscriber request;
- durable diagnostics recorded `received` and `staged / confirmation_attempted`;
- request row was created as `Pending Confirmation`;
- verification row was created and the confirmation email was delivered;
- confirmation changed the request/verification state to `Confirmed`;
- first processor run applied exactly one request;
- immediate second processor run applied zero requests;
- productionTouched remained false throughout.

The failed tests immediately before this were caused by `site/customize-config.js` still pointing to an older Apps Script deployment ID. The website transport fallback was functioning, but the request was being posted to stale server code. Treat website endpoint / Script-property deployment mismatch as a release-blocking configuration error.

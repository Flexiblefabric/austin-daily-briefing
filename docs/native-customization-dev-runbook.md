# Native Customization DEV Runbook

**Status:** Staged  
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
9. press **Confirm changes**;
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
- first explicit confirmation click confirms it through the HtmlService `google.script.run` server call;
- a repeated confirmation attempt does not confirm again;
- processor applies Confirmed request once;
- production IDs receive no writes.

## 8. Website connection

Only after backend QA:

- add a hidden iframe target to `site/customize.html`;
- change the prototype button to a real submit button;
- submit `application/x-www-form-urlencoded` to the DEV web-app URL;
- include the honeypot field;
- listen for `postMessage`;
- accept result messages only from the expected Apps Script / Googleusercontent origin;
- render the generic accepted state without exposing subscriber existence;
- keep the page `noindex` and unlinked while in DEV.

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

Apps Script `HtmlService` pages are rendered in a sandboxed iframe. The confirmation page therefore must not rely on ordinary form navigation to invoke the web-app `doPost` route. The staged implementation uses an explicit button and `google.script.run` to call `confirmNativeCustomizationDevFromUiV1()` on the server.

Opening the email link remains read-only. The raw token is held only in the transient confirmation page and is passed to the server only after the reader explicitly presses **Confirm changes**. It is not written to Sheets or logs.

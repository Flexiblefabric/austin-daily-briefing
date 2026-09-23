# Native Customization — Intake Architecture

**Status:** Proposed for controlled DEV implementation  
**Goal:** Keep the public page on austindailybriefing.com while using the existing Google Sheets + Apps Script control plane.

## Chosen pattern

Use the static ADB page as the visible interface and a narrowly scoped Apps Script web app as the intake service.

Request path:

1. `/customize.html` validates basic input in the browser.
2. The form submits a standard POST to the Apps Script web app.
3. The Apps Script handler performs all authoritative validation.
4. The handler writes only the normalized customization request into the existing production-compatible intake structure.
5. The existing subscriber processor remains responsible for verification and eventual application.
6. The browser receives only a generic success/failure signal; no subscriber data is returned.

## Why not use cross-origin JSON fetch as the primary design

Apps Script Content Service responses are redirected through `script.googleusercontent.com`, and Apps Script does not provide a conventional configurable CORS layer for this use case.

The implementation should therefore avoid depending on readable cross-origin JSON responses from the public site.

## Browser-to-Apps-Script transport

Preferred DEV pattern:

- ordinary `application/x-www-form-urlencoded` form POST;
- target a hidden iframe so the reader remains on austindailybriefing.com;
- Apps Script returns a minimal HTML response that posts a result message back to the parent page with `window.parent.postMessage`;
- the parent accepts messages only from the expected Apps Script / Googleusercontent origin(s);
- the response contains only a generic status and a non-sensitive request-correlation value;
- the visible ADB page then renders the branded generic confirmation state.

If iframe embedding requires Apps Script `XFrameOptionsMode.ALLOWALL`, the returned page must contain no sensitive data and must be designed solely as a POST result messenger. Google explicitly warns that ALLOWALL removes the default frame protection, so no reusable UI or privileged action should be exposed through that response.

## Endpoint security boundary

The public endpoint is intentionally anonymous because an unverified reader must be able to request a confirmation email.

Therefore authorization is not based on access to the endpoint. Security comes from:

- strict field allowlists;
- strict value allowlists;
- server-side normalization;
- request-size limits;
- generic browser responses;
- no subscriber lookup result returned;
- no direct preference mutation;
- single-use email confirmation before application;
- per-address cooldown/caps;
- global abuse ceiling;
- no raw-token storage;
- idempotent processor behavior.

## Apps Script deployment

For DEV:

- deploy a dedicated versioned web app;
- execute as the deploying operator account;
- allow anonymous submission only to the narrow POST handler;
- do not expose a subscriber-data GET endpoint;
- explicitly review OAuth scopes before deployment;
- store runtime configuration in Apps Script properties, not in GitHub or browser JavaScript;
- keep DEV and production deployments distinct.

Before production, verify the Apps Script project's editor list and deployment access manually.

## Spreadsheet access

The endpoint should write to the existing intake workbook only.

Because Apps Script web apps do not retain the bound document's active-document context, do not assume `getActiveSpreadsheet()` will work in a web-app request. The endpoint should use a configured target spreadsheet reference and the minimum practical Spreadsheet scope.

This is one reason to keep the web-app project small: it should contain no unrelated Google-service access and no code path that returns spreadsheet contents to callers.

## Response states

Browser-visible states:

- accepted for processing;
- temporarily unavailable / try again later;
- local validation error before submission.

Do not expose:

- subscriber exists / does not exist;
- profile ID;
- current preferences;
- verification ID;
- token hash;
- internal row numbers;
- processor status.

For both known and unknown addresses, the accepted state is:

> **Check your inbox.**
>
> If that address is connected to Austin Daily Briefing, we’ll send a confirmation link for the requested changes. Nothing changes until the request is confirmed.

## Failure behavior

If Apps Script validation fails or the request cannot be written:

- make no partial write;
- do not send a confirmation;
- return only a generic temporary-error state;
- log a privacy-safe reason server-side;
- preserve enough request correlation for operator debugging without recording raw tokens or unnecessary free text.

## DEV gate before production

Require:

- direct POST test;
- hidden-iframe / postMessage test on the real site origin;
- origin-validation test;
- malformed/unexpected-field rejection;
- duplicate and rapid-submit behavior;
- unknown-address non-enumeration;
- Apps Script editor/deployment permission review;
- OAuth-scope review;
- confirmation/replay tests;
- successful handoff to the existing subscriber processor;
- zero direct preference mutations by the web endpoint.

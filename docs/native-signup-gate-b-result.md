# Native Signup — Gate B Result

**FORM-7 Gate:** B — DEV intake  
**Result:** PASS  
**Date:** 2026-10-04  
**Environment:** Development only

## Scope

Gate B verified the first-party signup page/client, dedicated DEV Apps Script intake endpoint, request/diagnostic storage, validation, idempotent staging controls, and production-write boundary. It did not create or modify subscribers, profiles, preferences, Signup Actions, or Outbound Messages.

## Repository/runtime evidence

- Native signup page remains `noindex, nofollow` and outside public navigation.
- `site/signup-config.js` points only to the dedicated FORM-7 DEV Apps Script deployment.
- Repository QA executes the actual `NativeSignupDev.gs` source under a mocked Apps Script runtime.
- Runtime QA covers valid staging, normalization, validation errors, honeypot no-op, same-nonce replay, recent-equivalent suppression, cooldown handling, oversized requests, and refusal of both production workbook IDs.
- Site-preview CI passed after endpoint connection.
- GitHub Pages deployed the configured DEV preview successfully.

## Live DEV smoke

The first live smoke proved endpoint reachability by successfully staging one DEV request. That workflow was reported failed because its HTTP client incorrectly expected Apps Script `HtmlService` output to expose the embedded `postMessage` payload directly in the raw response body. The underlying DEV request was correctly staged; no processor work occurred.

The corrected smoke used HTTP success for transport reachability and the DEV Sheets as authoritative behavioral evidence.

Observed DEV diagnostics for the corrected run:

- one valid request was staged;
- replay with the same client nonce was a `same_nonce` no-op;
- an equivalent request with a different nonce inside the duplicate window was a `recent_equivalent` no-op;
- invalid email produced `validation_error / invalid_email`;
- missing consent produced `validation_error / consent_required`;
- honeypot submission produced `noop / honeypot`;
- only one request row was created for the valid corrected-run identity.

The staged request contained:

- an immutable `NSDEV-` Request ID;
- normalized email;
- affirmative consent;
- source `website`;
- a 32-character client nonce;
- a 43-character URL-safe SHA-256 Response Key;
- status `Staged`.

## Production boundary

`NativeSignupDev.gs` is hard-wired to the DEV intake workbook and explicitly refuses both production workbook IDs. Gate B did not authorize or execute production subscriber writes. Public production signup continues to use the Google signup form.

## Decision

Gate B passes. FORM-7 advances to Gate C processor parity.

Gate C must prove new signup, Active no-op, Paused no-op, Unsubscribed re-subscribe with preference preservation, replay/idempotency, partial-write fail-closed behavior, exactly-one Welcome queue creation, and no direct delivery before controlled production work begins.

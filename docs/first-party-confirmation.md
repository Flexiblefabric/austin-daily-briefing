# First-party customization confirmation

Status: controlled DEV implementation.

## Goal

Remove Google Apps Script UI chrome from subscriber-facing confirmation while retaining the existing hashed-token and exactly-once customization logic.

Target flow:

`ADB email → https://austindailybriefing.com/confirm.html#token=… → /api/dev/customize/confirm → Cloudflare Worker → Apps Script DEV relay → existing verification/request sheets`

Production promotion is separate and remains gated.

## Design

### Browser page

`site/confirm.html` is a noindex ADB-branded confirmation page.

The email token is carried in the URL fragment, not the query string. Browser fragments are not included in the HTTP request for the page itself. `confirm.js` reads the token into memory and immediately removes the fragment from the visible address bar with `history.replaceState`.

Opening the page does not consume the token. The token is consumed only when the reader presses **Confirm changes** and the existing Apps Script confirmation transaction succeeds.

### Same-origin relay

The browser POSTs only the token to the first-party API endpoint `https://confirm-api.austindailybriefing.com/api/dev/customize/confirm`.

A Cloudflare Worker is the origin for the dedicated `confirm-api.austindailybriefing.com` hostname. The GitHub Pages origin continues to serve `austindailybriefing.com` unchanged and can remain DNS-only.

The Worker validates request method, origin, content type, and token shape. It then signs `<timestamp>:<token>` with HMAC-SHA-256 using `ADB_CONFIRM_RELAY_SECRET` and forwards the token, timestamp, and signature to the current Apps Script DEV `/exec` endpoint.

### Apps Script relay authentication

Apps Script stores the same relay secret in Script Property `ADB_NATIVE_CUSTOMIZE_DEV_RELAY_SECRET`. The relay action accepts signatures only when:

- the timestamp is a 13-digit millisecond timestamp;
- it is within five minutes of the Apps Script clock;
- the signature is 64 hexadecimal characters;
- a constant-time comparison matches the locally calculated HMAC.

The raw relay secret is never sent over the relay request and is never committed to GitHub.

After relay authentication, Apps Script calls the existing `adbNativeConfirmRequestDevV1_` function. Token hashing, expiry, request binding, single-use behavior, and exactly-once processor semantics remain unchanged.

## Migration switch

The existing Google-hosted confirmation link remains the default until the first-party path has passed controlled DEV QA.

Set Script Property:

`ADB_NATIVE_CUSTOMIZE_DEV_CONFIRM_PAGE_URL=https://austindailybriefing.com/confirm.html`

only after the Worker route and first-party page are validated. When the property is absent, confirmation emails continue using the current Apps Script confirmation URL.

## Controlled QA sequence

1. Merge/stage this implementation without setting `ADB_NATIVE_CUSTOMIZE_DEV_CONFIRM_PAGE_URL`.
2. Copy the updated Apps Script files to DEV Web Scripts.
3. Add `ADB_NATIVE_CUSTOMIZE_DEV_RELAY_SECRET` to Script Properties.
4. Run `runNativeCustomizationDevUnitTestsV1()`.
5. Redeploy the existing DEV web-app deployment version without changing its deployment ID.
6. Deploy the Worker on `workers.dev` with:
   - `ADB_APPS_SCRIPT_CONFIRM_URL`
   - `ADB_CONFIRM_RELAY_SECRET`
7. Confirm a signed relay test reaches the DEV Apps Script endpoint.
8. Attach the Worker Custom Domain `confirm-api.austindailybriefing.com`. Cloudflare creates the DNS record and certificate for that subdomain.
9. Verify a POST to `https://confirm-api.austindailybriefing.com/api/dev/customize/confirm` reaches the Worker, then open `https://austindailybriefing.com/confirm.html` directly and verify the missing-token state.
10. Set `ADB_NATIVE_CUSTOMIZE_DEV_CONFIRM_PAGE_URL` to the first-party page.
11. Submit one fresh native customization request.
12. Verify the confirmation email links to `austindailybriefing.com/confirm.html#token=…`, not `script.google.com`.
13. Open the email link and verify the token disappears from the address bar.
14. Press **Confirm changes** and verify the ADB page displays **Request confirmed.**
15. Verify the DEV request and verification states become `Confirmed`.
16. Run the processor once and expect `applied: 1`.
17. Run it immediately again and expect `applied: 0`.
18. Reopen the same email link and verify it cannot confirm a second time.

## Promotion gates

Do not promote to production until all of these pass:

- no Google-hosted UI is visible in the normal confirmation path;
- the token is never present in a query string;
- relay requests require a valid HMAC and fresh timestamp;
- invalid, expired, and replayed tokens fail safely;
- the browser receives only minimal status information;
- DEV/production spreadsheet boundaries remain intact;
- exactly-once processor behavior remains unchanged;
- the Worker route affects only the intended API path;
- the old Google Form remains available as operator/fallback until FORM-6 is explicitly approved.

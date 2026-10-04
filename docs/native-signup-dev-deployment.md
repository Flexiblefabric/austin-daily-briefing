# Native Signup — DEV Deployment and Gate B QA

**Scope:** FORM-7 Gate B only  
**Environment:** Development  
**Production impact:** None authorized

## Purpose

Deploy the isolated `apps-script/NativeSignupDev.gs` source as a dedicated DEV web app, connect the noindex `site/signup.html` preview to that endpoint, and execute controlled intake tests before any Gate C subscriber-processor work is promoted.

Google Apps Script distinguishes test/head deployments from versioned deployments. Use a **versioned web-app deployment** for this controlled DEV endpoint so the URL remains stable while code versions change.

## Manual deployment

The deployment itself must be performed in the Google Apps Script interface because the currently connected project tools do not expose Apps Script project/deployment APIs.

1. Open the DEV Apps Script project used for this isolated native-signup endpoint.
2. Ensure the saved project code matches `apps-script/NativeSignupDev.gs` on the current repository `main`.
3. Run `runNativeSignupDevQaV1` once from the editor to authorize required spreadsheet access and confirm the structural checks pass.
4. Select **Deploy → New deployment**.
5. Select **Web app**.
6. Set the deployment to execute as the deploying operator account.
7. Allow access appropriate for an anonymous public signup endpoint.
8. Use a description identifying FORM-7 Gate B DEV.
9. Deploy and copy the resulting `https://script.google.com/macros/s/.../exec` URL.
10. Do not reuse the production native-customization deployment URL.

The endpoint source itself hard-fails if its configured workbook identity is changed to either production workbook ID.

## DEV deployment record

Dedicated FORM-7 Gate B DEV web-app endpoint:

`https://script.google.com/macros/s/AKfycbzx2Ktealkm7PnFf1aXCcrZOzmffG7KBUE3NUsVA-pxsaq0lLkzn-O9F_Ajruov5v1l/exec`

This is distinct from the production native-customization deployment and remains development-only.

## Repository connection

After deployment:

1. Set `site/signup-config.js` `endpoint` to the dedicated DEV web-app URL. **Completed 2026-10-04.**
2. Keep `environment: 'development'`.
3. Do not add `signup.html` to public navigation or the sitemap.
4. Run the site-preview CI checks.
5. Allow GitHub Pages to deploy the configured DEV preview.

## Controlled browser/intake QA

Use only DEV/test addresses.

### Required tests

| Test | Expected browser result | Expected DEV intake result |
| --- | --- | --- |
| Valid email + affirmative consent | Warm generic success | One Staged request |
| Invalid email | Inline validation error | No request row |
| Consent unchecked | Inline validation error | No request row |
| Honeypot populated | Generic accepted/no-op | No request row; diagnostic no-op |
| Same page retry / same nonce | Generic success | Existing request reused; no second row |
| Equivalent request inside 10 minutes | Generic success | Existing request reused; no second row |
| Cooldown/rate limit | Brief retry-later message | No additional request row |
| Oversized or malformed POST | Validation error | No request row |
| Unexpected source/action | Validation error | No request row |

### Data checks

For a valid staged request verify:

- normalized lowercase email;
- Consent = `Yes`;
- Source = `website`;
- 32-character client nonce;
- immutable `NSDEV-` Request ID;
- 43-character URL-safe SHA-256 Response Key;
- Status = `Staged`;
- no subscriber/profile/preference/Signup Action/Outbound Message mutation.

### Privacy checks

The visible browser response must be identical regardless of whether the test address would later resolve as new, Active, Paused, or Unsubscribed. Gate B does not perform that subscriber lookup at all.

## Pass criteria

Gate B passes only when:

- repository runtime QA passes;
- dedicated DEV deployment is reachable;
- all controlled browser/intake tests above pass;
- only the DEV intake workbook changes;
- no production workbook is touched;
- the page remains noindex and unlinked;
- the deployment URL recorded in `signup-config.js` is the dedicated DEV web-app URL.

After Gate B passes, proceed to Gate C processor parity using `docs/native-signup-processor-contract.md`.

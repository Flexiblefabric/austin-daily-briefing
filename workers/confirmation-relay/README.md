# ADB first-party confirmation relay — DEV

This Worker is the controlled DEV relay for native customization confirmations.

Flow:

`confirm.html#token=…` → same-origin POST to `/api/dev/customize/confirm` → Worker → signed POST to the Apps Script DEV endpoint → existing hashed-token confirmation logic.

## Secrets

Configure these as Cloudflare Worker secrets. Never commit their values.

- `ADB_APPS_SCRIPT_CONFIRM_URL` — current Apps Script DEV web-app `/exec` URL.
- `ADB_CONFIRM_RELAY_SECRET` — random secret, at least 32 bytes of entropy. The same raw value must be stored in Apps Script property `ADB_NATIVE_CUSTOMIZE_DEV_RELAY_SECRET`.

The Worker never sends the raw relay secret to Apps Script. It signs `<timestamp>:<token>` using HMAC-SHA-256 and sends the timestamp and signature.

## Controlled deployment sequence

1. Copy the updated Apps Script files from this branch into the DEV Web Scripts project.
2. Add `ADB_NATIVE_CUSTOMIZE_DEV_RELAY_SECRET` to Apps Script Script Properties.
3. Run the Apps Script unit tests and deploy a new version of the existing DEV web-app deployment. Keep the deployment ID stable.
4. Create/deploy this Worker first on its `workers.dev` URL with the two Worker secrets configured.
5. Test a signed relay request against DEV.
6. Add the Worker Custom Domain `confirm-api.austindailybriefing.com`. Do not proxy or change the existing apex GitHub Pages DNS record.
7. Verify `https://austindailybriefing.com/confirm.html` can reach `https://confirm-api.austindailybriefing.com/api/dev/customize/confirm`.
8. Only after the relay passes should `ADB_NATIVE_CUSTOMIZE_DEV_CONFIRM_PAGE_URL` be set to `https://austindailybriefing.com/confirm.html`. Until then, DEV confirmation emails continue to use the Google Apps Script confirmation page.

Because the existing apex site is DNS-only GitHub Pages, the relay uses a dedicated Worker Custom Domain instead of proxying the whole site. Cloudflare owns only `confirm-api.austindailybriefing.com`; GitHub Pages continues serving the apex site unchanged.

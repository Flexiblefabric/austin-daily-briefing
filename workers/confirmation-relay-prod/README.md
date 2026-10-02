# ADB production customization confirmation relay

Status: staged; not deployed.

This Worker is intentionally separate from the DEV relay.

Controlled production path:

`austindailybriefing.com/confirm.html#env=prod&token=…`
→ `https://confirm-prod.austindailybriefing.com/api/customize/confirm`
→ this Worker
→ signed POST to the production Apps Script native customization endpoint
→ production Native Verification Queue.

## Secrets

Store values only in Cloudflare Worker secrets:

- `ADB_APPS_SCRIPT_CONFIRM_URL` — production native customization Apps Script `/exec` URL.
- `ADB_CONFIRM_RELAY_SECRET` — production-only HMAC secret. It must exactly match Apps Script property `ADB_NATIVE_CUSTOMIZE_PROD_RELAY_SECRET`.

Do not reuse the DEV relay secret.

## Deployment gates

1. Production Apps Script unit/readiness validation passes.
2. Deploy Worker to `workers.dev` with production secrets.
3. Fake-token relay returns `invalid_or_expired`.
4. Attach Custom Domain `confirm-prod.austindailybriefing.com`.
5. Test CORS/preflight from `https://austindailybriefing.com`.
6. Only then enable the controlled production confirmation-email path.

The DEV Worker and `confirm-api.austindailybriefing.com` remain unchanged until production observation is complete.

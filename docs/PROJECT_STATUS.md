# Austin Daily Briefing — Internal Project Status

> Generated from `PROJECT_STATE.json`. Do not edit this generated document directly.

- Schema version: `1.2`
- Registry version: `2026-10-04.4`
- Last reviewed: `2026-10-04`
- Production status: **live**
- Public site: https://austindailybriefing.com/

## Production data

- Subscriber database: Austin Daily Briefing — Subscriber Preferences (`1pqVjQFqWoRb24jn86lOq6LoYjzBccf4WpE1kOI8_Jk0`)
- Intake database: Austin Daily Briefing — Google Forms Production Intake (`1zL3og3MOXgm5LdUF2VfIN4Sh9oFss6NVzAGRa-Zlmho`)

## Services

- **control_plane** — live — Google Sheets + Google Apps Script
- **email_delivery** — live — Resend
- **reply_routing** — live — Cloudflare Email Routing
- **website** — live — GitHub Pages
- **native_customization_intake** — live — Google Apps Script
- **customization_confirmation_relay** — live — Cloudflare Workers

## Automation

- **subscriber_processor** — live — every 6 hours
- **daily_generation** — live — 08:00 America/Chicago
- **welcome_dispatch** — live — hourly
- **daily_dispatch** — live — hourly
- **documentation_sync** — live — on PROJECT_STATE.json or generator changes to main
- **production_health_watchdog** — live — 09:30 America/Chicago

## Runtime configuration names

- `RESEND_API_KEY` — Resend API authentication
- `ADB_RESEND_TEST_RECIPIENT` — controlled transport test recipient
- `ADB_RESEND_WELCOME_MODE` — welcome dispatcher CONTROLLED/LIVE mode
- `ADB_RESEND_WELCOME_ALLOWLIST` — controlled welcome-delivery allowlist
- `ADB_RESEND_DAILY_MODE` — daily dispatcher CONTROLLED/LIVE mode
- `ADB_RESEND_DAILY_ALLOWLIST` — controlled daily-delivery allowlist
- `ADB_SENDER_CHANGE_APPROVAL` — manual sender-change announcement approval gate
- `ADB_NATIVE_CUSTOMIZE_PROD_ENABLED` — production native customization endpoint enable gate
- `ADB_NATIVE_CUSTOMIZE_PROD_MODE` — production native customization CONTROLLED/LIVE mode
- `ADB_NATIVE_CUSTOMIZE_PROD_WEB_APP_URL` — production native customization Apps Script deployment URL
- `ADB_NATIVE_CUSTOMIZE_PROD_SITE_ORIGIN` — allowed ADB website origin for native customization
- `ADB_NATIVE_CUSTOMIZE_PROD_SEND_EMAIL` — production native confirmation email enable gate
- `ADB_NATIVE_CUSTOMIZE_PROD_ALLOWLIST` — controlled production native-customization recipient allowlist
- `ADB_NATIVE_CUSTOMIZE_PROD_CONFIRM_PAGE_URL` — first-party confirmation page URL
- `ADB_NATIVE_CUSTOMIZE_PROD_RELAY_SECRET` — Apps Script HMAC secret for production confirmation relay
- `ADB_APPS_SCRIPT_CONFIRM_URL` — Cloudflare Worker secret containing production Apps Script relay target
- `ADB_CONFIRM_RELAY_SECRET` — Cloudflare Worker HMAC secret matching the production Apps Script relay secret

Secret and private configuration values are intentionally excluded from the registry and generated documentation.

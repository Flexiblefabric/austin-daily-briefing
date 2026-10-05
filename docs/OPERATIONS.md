# Austin Daily Briefing — Operations

> Generated from `PROJECT_STATE.json`. Do not edit this generated document directly.

## Routine automation

- **subscriber_processor** — live — every 6 hours
- **daily_generation** — live — 08:00 America/Chicago
- **welcome_dispatch** — live — hourly — `dispatchQueuedWelcomeMessagesViaResendV1`
- **daily_dispatch** — live — hourly — `dispatchQueuedDailyBriefingsViaResendV1`
- **documentation_sync** — live — on PROJECT_STATE.json or generator changes to main — `python scripts/docs_sync.py update`
- **production_health_watchdog** — live — 09:30 America/Chicago

## Manual operational checks

- **domain_health_check** — available — manual only — `docs/domain-health-check.md`
  - Reporting: compact pass/fail table with a brief explanation for each failure.
  - Form validation: after form changes only.
- **v2_shadow_review** — retired — manual only — `docs/v2-shadow-review-prompt.md`
  - Reporting: V2 Top 10, live-production comparison, material-update audit, notable rejects, and evaluation.
- **completion_observation** — retired — one-time; completed 2026-09-20 — `docs/automation-prompts/end-to-end-completion-observation.md`
- **task_reconciliation** — available — manual/read-only — `docs/task-reconciliation.md`
  - Reporting: exact registered task ID, enabled state, recurrence/timezone, recent-run plausibility, and Unknown when scheduler evidence is unavailable.
- **completion_reconciliation** — development — manual/read-only — `docs/automation-prompts/end-to-end-completion-reconcile.md`
  - Reporting: privacy-safe full-scan Google plus feature-gated native signup-to-Welcome classification using ADB-COMPLETION-0.2.
- **native_customization_cutover** — complete — completed gated rollout — `docs/native-customization-production-cutover.md`
  - Reporting: Gates A–F passed; Gate G closeout recorded 2026-10-04; public native customization is live with Google fallback retained pending FORM-10.
- **v2_production_observation** — observation — October 4 first cycle and October 5 one-time follow-up completed — `docs/v2-promotion-2026-10-03.md`
  - Reporting: Verify editorial selection, one-time notice, queue/history and downstream delivery; no automatic replay or resend.
- **native_signup_development** — development — manual gated rollout — `docs/native-signup-gate-d.md`
  - Reporting: FORM-7 Gates A–C complete. Gate D endpoint runtime preflight and production Resend transport compatibility now pass. Remaining items before controlled mutation are recording the production native-signup /exec URL and selecting one operator-owned mutating controlled-test address.

## Runtime configuration

- `RESEND_API_KEY` — secret — Resend API authentication
- `ADB_RESEND_TEST_RECIPIENT` — private_config — controlled transport test recipient
- `ADB_RESEND_WELCOME_MODE` — config — welcome dispatcher CONTROLLED/LIVE mode
- `ADB_RESEND_WELCOME_ALLOWLIST` — private_config — controlled welcome-delivery allowlist
- `ADB_RESEND_DAILY_MODE` — config — daily dispatcher CONTROLLED/LIVE mode
- `ADB_RESEND_DAILY_ALLOWLIST` — private_config — controlled daily-delivery allowlist
- `ADB_SENDER_CHANGE_APPROVAL` — config — manual sender-change announcement approval gate
- `ADB_NATIVE_CUSTOMIZE_PROD_ENABLED` — config — production native customization endpoint enable gate
- `ADB_NATIVE_CUSTOMIZE_PROD_MODE` — config — production native customization CONTROLLED/LIVE mode
- `ADB_NATIVE_CUSTOMIZE_PROD_WEB_APP_URL` — private_config — production native customization Apps Script deployment URL
- `ADB_NATIVE_CUSTOMIZE_PROD_SITE_ORIGIN` — config — allowed ADB website origin for native customization
- `ADB_NATIVE_CUSTOMIZE_PROD_SEND_EMAIL` — config — production native confirmation email enable gate
- `ADB_NATIVE_CUSTOMIZE_PROD_ALLOWLIST` — private_config — controlled production native-customization recipient allowlist
- `ADB_NATIVE_CUSTOMIZE_PROD_CONFIRM_PAGE_URL` — config — first-party confirmation page URL
- `ADB_NATIVE_CUSTOMIZE_PROD_RELAY_SECRET` — secret — Apps Script HMAC secret for production confirmation relay
- `ADB_APPS_SCRIPT_CONFIRM_URL` — secret — Cloudflare Worker secret containing production Apps Script relay target
- `ADB_CONFIRM_RELAY_SECRET` — secret — Cloudflare Worker HMAC secret matching the production Apps Script relay secret
- `ADB_NATIVE_SIGNUP_PROD_ENABLED` — config — production native signup endpoint enable gate
- `ADB_NATIVE_SIGNUP_PROD_MODE` — config — production native signup CONTROLLED/LIVE mode
- `ADB_NATIVE_SIGNUP_PROD_ALLOWLIST` — private_config — controlled production native-signup address allowlist
- `ADB_NATIVE_SIGNUP_PROD_SITE_ORIGIN` — config — allowed ADB website origin for native signup

No runtime property values belong in this repository. Secret and private configuration values remain in their external runtime stores.

## Documentation maintenance

- `python scripts/docs_sync.py status` — display authoritative state.
- `python scripts/docs_sync.py audit` — validate registry, references, and snapshot integrity.
- `python scripts/docs_sync.py preview` — preview all generated internal documentation.
- `python scripts/docs_sync.py update` — audit and regenerate the generated internal documentation set.
- `python scripts/docs_sync.py snapshot --reason "..."` — create an immutable point-in-time registry capture before or after a material production change.

## Change-control rules

- Changelog entry required: production architecture changes.
- Changelog entry required: development-to-production promotions.
- Changelog entry required: production dependency replacements.
- Changelog entry required: data storage or routing changes.
- Changelog entry required: new production subsystems.
- Changelog entry required: rollbacks and migrations.

The same material-change classes require a registry snapshot. Existing snapshots must never be edited or deleted.

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
- **v2_shadow_review** — development — manual only — `docs/v2-shadow-review-prompt.md`
  - Reporting: V2 Top 10, live-production comparison, material-update audit, notable rejects, and evaluation.
- **completion_observation** — retired — one-time; completed 2026-09-20 — `docs/automation-prompts/end-to-end-completion-observation.md`
- **task_reconciliation** — available — manual/read-only — `docs/task-reconciliation.md`
  - Reporting: exact registered task ID, enabled state, recurrence/timezone, recent-run plausibility, and Unknown when scheduler evidence is unavailable.

## Runtime configuration

- `RESEND_API_KEY` — secret — Resend API authentication
- `ADB_RESEND_TEST_RECIPIENT` — private_config — controlled transport test recipient
- `ADB_RESEND_WELCOME_MODE` — config — welcome dispatcher CONTROLLED/LIVE mode
- `ADB_RESEND_WELCOME_ALLOWLIST` — private_config — controlled welcome-delivery allowlist
- `ADB_RESEND_DAILY_MODE` — config — daily dispatcher CONTROLLED/LIVE mode
- `ADB_RESEND_DAILY_ALLOWLIST` — private_config — controlled daily-delivery allowlist
- `ADB_SENDER_CHANGE_APPROVAL` — config — manual sender-change announcement approval gate

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

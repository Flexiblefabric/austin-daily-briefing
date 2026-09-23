# Austin Daily Briefing — Technical Changelog

This file records material internal production changes. Newest entries appear first.

## 2026-09-23 — Signup completion incident monitoring promotion

**Type:** Development-to-production monitoring promotion  
**Components:** production watchdog, signup-to-Welcome reconciliation, administrator alerts  
**Registry impact:** Yes

Austin Daily Briefing promoted the first completion-specific incident class into the existing 09:30 America/Chicago production watchdog.

### Changes

- Advanced the production watchdog to `ADB-WATCHDOG-PROD-2.1`.
- Added a stateless signup-to-Welcome full scan using the established `ADB-COMPLETION-0.1` joins and timing rules.
- Promoted only `Unhealthy — intake incomplete` for administrator alerting: a valid signup older than eight hours without a reconciled ledger result or eligible queue/disposition.
- Added a dedicated `Signup Completion` Operations Status component and locked Release Config controls for the staged completion-monitoring policy.
- Preserved one-alert-per-component-per-Central-day deduplication and silent recovery.
- Kept all other completion Unhealthy/Unknown classifications report-only for this first stage.
- Preserved subscriber processor and Resend dispatcher ownership; the watchdog cannot repair, resend, replay, or alter subscriber-facing records.

### Validation

- All 15 documented completion vectors passed the controlled DEV classifier.
- The no-mutation fixture guard passed.
- All 10 staged alert-policy checks passed.
- A synthetic `[CONTROLLED TEST]` administrator alert was accepted by Gmail and observed in the inbox.
- The pre-promotion production full-scan baseline contained no intake-incomplete journeys.
- No subscriber-facing message, profile, preference, status, or delivery record was modified by the controlled tests.

## 2026-09-21 — Newsletter identity and Welcome redesign promotion

**Type:** Development-to-production promotion  
**Components:** daily briefing presentation, Welcome email, brand assets, subscriber-facing release communication  
**Registry impact:** Yes

Austin Daily Briefing completed controlled client QA for the new newsletter identity and redesigned Welcome experience and began production promotion through the existing queue and Resend delivery architecture.

### Changes

- Promoted the approved masthead, centered branded footer, Featured/Top Story hierarchy, Why It Matters treatment, Under the Radar header-band treatment, More for You orientation, Austin Ahead taxonomy, and mobile Weather behavior.
- Added an optional `What's New` component for material subscriber-facing product updates.
- Added a one-time-per-profile redesign notice with an expiry after September 28, 2026.
- Redesigned the Welcome email using the same masthead, typography, color system, subscriber controls, and live feedback/privacy/terms destinations.
- Advanced the canonical morning briefing prompt to `ADB-DAILY-PROD-1.2`.
- Preserved the existing subscriber database, queue model, Resend transport ownership, dispatcher cadence, and 08:00 America/Chicago morning-generation schedule.

### Validation

- Controlled newsletter rendering passed desktop and mobile review.
- Dark mode and image-blocked states remained usable.
- Newsletter and Welcome HTML/plain-text destination parity passed.
- The controlled production queue-path message transitioned from Queued to Sent exactly once with one Resend provider ID.
- The matching Briefing History QA row transitioned from Pending to Sent with the same provider ID.
- The received queue-path message matched the approved design.
- Replay/duplicate verification passed: rerunning the daily dispatcher after the controlled QA send reported `0 sent`.
- Promotion PR #18 merged after documentation CI passed.
- The active 08:00 America/Chicago scheduler prompt was synchronized to canonical `ADB-DAILY-PROD-1.2`.
- The production Apps Script Welcome renderer was synchronized from `main`.
- A post-promotion controlled Welcome send reached the QA inbox using the new production Welcome template.
- No subscriber eligibility, queue ownership, transport, trigger, or schedule changes were introduced.

## 2026-09-14 — Production watchdog restoration and prompt durability

**Type:** Production operations and governance  
**Components:** production watchdog, automation prompt registry, scheduler slot policy, documentation CI  
**Registry impact:** Yes

The production health watchdog was recreated after a disabled scheduler copy became unavailable. A durable GitHub-backed prompt lifecycle now prevents paused or deleted scheduler tasks from becoming the only lost copy.

### Changes

- Recreated the production watchdog on a daily 09:30 America/Chicago schedule.
- Expanded watchdog coverage to distinguish morning generation, daily Resend delivery, welcome queue health, and subscriber operations.
- Added canonical GitHub prompt files for the production daily briefing, subscriber operations, and watchdog.
- Established Active, Held, Development, and Retired prompt lifecycle states.
- Established a five-slot budget: three vital ADB tasks, one non-ADB weekly task, and one unallocated reserve.
- Held and development tasks now remain repository-only instead of relying on disabled scheduler records.
- Updated documentation CI so pushes to `PROJECT_STATE.json` can regenerate generated documentation instead of failing before the sync job runs.
- Advanced the registry to schema 1.2 and recorded current scheduler identifiers.
- Preserved a new immutable registry snapshot.

### Validation

- The replacement watchdog task was created successfully and is active.
- The production workbook and Gmail administrator-alert connection passed harmless read checks before task creation.
- Canonical prompt files were committed without subscriber addresses, private routing destinations, credentials, or raw tokens.
- The previous watchdog identifier remains recorded only as historical recovery evidence.

## 2026-09-13 — Documentation registry and automation v1 complete

**Type:** Production subsystem  
**Components:** authoritative registry, generated documentation, CI validation, immutable snapshots  
**Registry impact:** Yes

Austin Daily Briefing completed the first production-ready version of its internal documentation control system.

### Changes

- `PROJECT_STATE.json` is the authoritative technical registry for current project state.
- `scripts/docs_sync.py` now provides `status`, `audit`, `preview`, `update`, and `snapshot` commands.
- `update` generates `docs/PROJECT_STATUS.md`, `docs/ARCHITECTURE.md`, and `docs/OPERATIONS.md` from the registry.
- GitHub Actions validates registry structure, generated-document consistency, referenced paths, runtime-property safety, and snapshot integrity.
- Successful changes to the authoritative registry on `main` automatically regenerate and commit the generated internal documentation.
- `docs/snapshots/` stores immutable point-in-time registry captures for material production changes.
- CI permits new snapshots but rejects modification, rename, or deletion of an existing committed snapshot.
- `docs/CHANGELOG.md` remains human-authored and is not rewritten by automation.

### Validation

- Pull-request validation passed for schema `1.1`.
- `status`, `audit`, `preview`, and `update` completed successfully in CI.
- Snapshot creation and SHA-256 integrity validation passed in CI.
- Append-only snapshot enforcement passed in CI.
- The post-merge `main` synchronization job completed successfully.
- A permanent baseline snapshot was recorded with reason `Documentation registry and automation v1 complete`.

## 2026-09-13 — Production email and custom-domain cutover

**Type:** Production architecture  
**Components:** email delivery, reply routing, website domain, daily delivery  
**Registry impact:** Yes

Austin Daily Briefing completed the production cutover to the custom-domain delivery architecture.

### Changes

- Resend is the production email-delivery provider.
- `briefing@austindailybriefing.com` is the public sender and reply address.
- Cloudflare Email Routing handles replies and forwards them to a private monitored destination that is intentionally not recorded in project documentation.
- The public site is served from the custom domain `austindailybriefing.com` through GitHub Pages.
- Welcome and daily briefing queue dispatch use the Apps Script Resend transport.
- Daily briefing generation is scheduled for 08:00 America/Chicago; queue dispatch remains independent from generation.

### Validation

- Controlled Resend transport testing succeeded.
- Production welcome delivery was promoted after controlled queue-path QA.
- Production daily delivery was promoted after controlled QA and replay testing.
- The custom domain loaded successfully.
- Production messages were received with active links.
- Reply routing returned the expected test result.
- A replay/second-run check produced zero duplicate sends.

### Documentation

- Established `PROJECT_STATE.json` as the authoritative technical registry.
- Added `schema_version` beginning at `1.0`.
- Secret and private configuration values are prohibited from the registry; only property names and purposes may be recorded.
- Added `scripts/docs_sync.py` for registry status, audit, and documentation preview operations.

## Changelog policy

A changelog entry is required when a change modifies production architecture, promotes a development component to production, replaces a production dependency, changes data storage or routing, introduces a production subsystem, or performs a rollback or migration.

Routine documentation edits, tests, refactors without behavioral changes, development-only experiments, and cosmetic public-site changes do not require entries unless they accompany a material production change.

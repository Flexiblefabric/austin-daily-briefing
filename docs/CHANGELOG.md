# Austin Daily Briefing — Technical Changelog

This file records material internal production changes. Newest entries appear first.

## 2026-10-04 — Native signup Gate D production task contracts staged disabled

**Type:** Production automation and monitoring contract update  
**Components:** Subscriber Operations, signup completion reconciliation, production health watchdog, native signup  
**Registry impact:** Yes — 2026-10-04.12

FORM-7 Gate D integrated native-signup semantics into the canonical production task contracts while the production feature gate remains `Native Signup Mode = DISABLED`.

### Changes

- Advanced Subscriber Operations to `ADB-SUBOPS-PROD-1.1`.
- Advanced the completion contract to `ADB-COMPLETION-0.2`.
- Advanced the manual completion reconciler to `ADB-COMPLETION-RECON-0.2`.
- Advanced the production watchdog to `ADB-WATCHDOG-PROD-2.4`.
- Versioned native production-processing and monitoring contracts as `ADB-NATIVE-SIGNUP-PROD-0.1` and `ADB-NATIVE-SIGNUP-MONITOR-0.1`.
- Added feature-gated native new-signup, re-subscribe, Active/Paused/Admin Hold no-op, deterministic Welcome, partial-state and completion-monitoring rules.
- Preserved the existing promoted alert policy: only `Unhealthy — intake incomplete` remains alert-enabled.
- Preserved the existing shared `GOOGLE + NATIVE` production mode; FORM-7 adds no new shared Intake/Processor Mode.
- Scheduler-copy synchronization is required immediately after merge; repository merge alone does not establish scheduler parity.
- Post-merge synchronization completed: Subscriber Operations now requires `ADB-SUBOPS-PROD-1.1`; the watchdog copy now requires `ADB-WATCHDOG-PROD-2.4`.
- Subscriber Operations remains enabled. The watchdog was already disabled and that state was preserved; it remains a Gate D activation blocker.

### Safety state

- Production `Native Signup Mode` remains `DISABLED`.
- Production Native Signup Requests/Diagnostics remain empty.
- Public signup remains the Google Form.
- No native signup production request or subscriber mutation is authorized by this change.

## 2026-10-04 — Native signup Gate D inert production schema

**Type:** Production data-storage and configuration staging  
**Components:** production intake workbook, native signup, documentation registry  
**Registry impact:** Yes — 2026-10-04.11

FORM-7 Gate D installed the production native-signup storage/configuration boundary in a disabled state. No native signup runtime or processor integration was enabled.

### Changes

- Created empty production `Native Signup Requests` and `Native Signup Diagnostics` tabs with the approved Gate B/C schemas.
- Added `Native Signup Mode = DISABLED`.
- Added blank `Native Signup Controlled Email`.
- Preserved production `Intake Mode = GOOGLE + NATIVE`.
- Preserved production `Processor Mode = GOOGLE + NATIVE`.
- Created a fresh private production-intake backup immediately before the schema write.
- Public signup remains on the Google Form.

### Validation

- Both new production tabs were read back with headers only.
- Native Signup Mode was read back as DISABLED.
- Native Signup Controlled Email was read back blank.
- Shared Intake/Processor modes were read back unchanged.
- No native signup request, subscriber/profile/preference mutation, Signup Action, or Welcome queue record was created.

## 2026-10-04 — Native customization closeout and native signup start

**Type:** Production rollout closeout and development workstream start  
**Components:** native customization, subscriber operations, native signup, documentation registry  
**Registry impact:** Yes — 2026-10-04.2

FORM-6 was closed after operator acceptance of Gate F and final read-only reconciliation. The public native customization path remains live, the Google customization form remains available as fallback pending FORM-10, and FORM-7 native signup is now Active.

### Closeout evidence

- The 2026-10-04 09:03 CT Subscriber Operations cycle reported Healthy with zero errors.
- No Native Customize Requests were Pending or Confirmed at the closeout check.
- WEB-4 independently verified the public native Customize route and fallback behavior.
- The operator explicitly directed Gate F to be marked passing and FORM-6 complete.
- The original 24-hour elapsed-time criterion had not fully elapsed at the time of that direction; the closeout records this as an explicit governance exception rather than claiming a full 24-hour observation.

### FORM-7 start

- Added a parity-first native-signup design baseline.
- Preserved the current required email + affirmative-consent semantics.
- Preserved Production Subscriber Operations as the sole subscriber/profile creation owner.
- Preserved exactly-one WELCOME_V1 queue creation and the Resend Welcome dispatcher as sole delivery owner.
- Production signup remains on the Google Form while Gate A/B DEV artifacts are built and tested.
## 2026-10-04 — Transport compatibility release gate

**Type:** Production corrective control  
**Components:** Resend dispatch, native customization cutover, release governance  
**Registry impact:** No

The first production cycle after the native-customization promotion exposed a downstream compatibility gap: production Intake Mode and Processor Mode were correctly changed to `GOOGLE + NATIVE`, while the executable daily and welcome Resend validators still required `GOOGLE ONLY`. Morning generation succeeded, but daily delivery stopped before provider handoff.

### Corrective changes

- Updated the Resend transport validators to accept the authorized production intake modes while requiring Processor Mode to match Intake Mode.
- Added a reusable production-change compatibility checklist for configuration, routing, ownership, transport, and shared safety-gate changes.
- Made executable downstream-consumer inspection mandatory; prompt/document compatibility alone is insufficient.
- Added manual-runtime parity as a release requirement for Apps Script and other manually deployed code.
- Added an explicit Resend preflight covering both daily and welcome dispatcher validation.
- Retrofitted the native-customization Gate E record with the missed compatibility check and corrective precedent.
- Added roadmap item OPS-12 as a completed release-governance control.

A FAIL or UNKNOWN compatibility result now blocks promotion.

## 2026-10-03 — V2 story-selection production promotion

**Type:** Development-to-production promotion  
**Components:** daily generation, editorial selection, website, reader communication  
**Registry impact:** Yes — 2026-10-03.3

Promoted ADB-DAILY-PROD-2.0 with ADB-V2-SELECT-1.0 for the normal October 4 08:00 America/Chicago edition. Incorporates the approved separate MFY rubric, 60-point threshold, 10-point discovery displacement, freshness/material-change controls, independent Under the Radar search and verified evergreen discovery. No added reader-facing labels or filler.

Updated canonical authority, scheduler contract, lifecycle records, roadmap, generated documentation and immutable snapshot. Updated How ADB Works, public What's New and homepage preview; the next briefing has a date-limited, profile-deduplicated What's New note. Existing delivery, template, queue/history, native customization and Friday behavior remain unchanged.

Validation and exact rollback pair: [V2 promotion record](v2-promotion-2026-10-03.md). First production selection/queue/downstream delivery observation remains pending; promotion is not evidence that an edition has been delivered.

## 2026-10-03 — Native customization public promotion

**Type:** Development-to-production promotion and production routing change  
**Components:** native customization, first-party confirmation, Cloudflare relay, subscriber operations, public website  
**Registry impact:** Yes

Austin Daily Briefing promoted the native customization experience to the public production route after controlled production validation.

### Changes

- Promoted the production Apps Script native customization endpoint from controlled-only operation to the live `GOOGLE + NATIVE` intake state.
- Promoted the first-party confirmation relay at `confirm-prod.austindailybriefing.com` for live production confirmation.
- Switched the public `customize.html` experience from the DEV endpoint to the production Apps Script endpoint.
- Removed the Controlled DEV presentation from the public customization page.
- Retained the Google customization form as an explicit fallback/operator path during the observation window.
- Preserved Production Subscriber Operations as the sole owner of applying confirmed native customization payloads to Profiles / Preferences.
- Preserved single-use confirmation, hashed-token storage, relay HMAC validation, and the existing production identity/safety gates.
- Synchronized the Daily Briefing and Production Health Watchdog scheduler wrappers to their current native-compatible canonical specification IDs before public cutover.
- Advanced FORM-6 to Gate F observation.

### Validation

- Gates A–D completed before promotion.
- The first controlled production native request completed Pending → Confirmed → Applied exactly once.
- A second browser-originated control request was explicitly cancelled without application.
- Before cutover there were no unintended Pending or Confirmed native production requests.
- Production database Intake Mode, intake Processor Mode, and Release Config Processor Mode read back as `GOOGLE + NATIVE`.
- The production cutover state read back as live for Google + native customization and briefing delivery.
- The public production endpoint and dedicated confirmation relay had already passed signed-relay and CORS validation.
- The Google customization fallback remains available during Gate F.

## 2026-10-03 — Controlled native customization and project-state reconciliation

**Type:** Production architecture reconciliation and controlled-rollout hardening  
**Components:** native customization, first-party confirmation relay, production safety gates, watchdog, documentation registry  
**Registry impact:** Yes

Austin Daily Briefing reconciled the repository and production control-plane state after controlled native customization Gates A–D and the later watchdog delivery-contract revision.

### Changes

- Recorded the production native-customization Apps Script endpoint and dedicated Cloudflare confirmation relay as controlled production services; the public Customize route remains on the Google Form pending Gate E.
- Closed the second browser-originated controlled native request as `Cancelled` without application because it was a control-path test rather than a requested preference mutation.
- Reconciled production Intake Mode, intake Processor Mode, Release Config, and cutover-state metadata to `GOOGLE + NATIVE CONTROLLED` while preserving live daily briefing and Google subscriber delivery.
- Advanced the Daily Briefing canonical prompt to `ADB-DAILY-PROD-1.3` and the Production Health Watchdog to `ADB-WATCHDOG-PROD-2.3` so authorized controlled/native subscriber-intake modes do not falsely fail briefing or delivery checks.
- Preserved Production Subscriber Operations as the sole owner of applying confirmed native payloads to Profiles / Preferences.
- Reconciled the approved 90-day terminal verification-retention policy and documented the temporary legacy Google Verification Form raw-token exception.
- Updated the authoritative registry, generated internal documentation, V2 status, native-form lifecycle records, completion-monitoring lifecycle records, design-system implementation status, security documentation, README, and roadmap.
- Added a coordinated Gate E preflight so public native-customization cutover cannot proceed with mismatched runtime, task, registry, or fallback state.

### Validation

- Current production Daily Briefing, Daily Resend Delivery, Welcome delivery, Subscriber Operations, and Signup Completion status rows were healthy before reconciliation.
- The second controlled native request and verification were read back as `Cancelled` with no preference application.
- Production mode metadata was read back consistently as controlled native staging.
- The three registered active ADB scheduler task IDs and schedules matched live scheduler metadata before wrapper synchronization.
- V2 evidence collection is complete at 16 comparable runs; promotion remains a separate review and approval decision.

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

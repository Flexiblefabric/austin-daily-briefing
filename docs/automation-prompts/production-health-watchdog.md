# ADB Production Health Watchdog — Canonical Automation Prompt

**Specification ID:** `ADB-WATCHDOG-PROD-2.4`  
**Lifecycle:** Active production  
**Schedule:** Daily at 09:30 America/Chicago  
**Current scheduler state:** Disabled — prompt synchronized; explicit re-enable required before FORM-7 Gate D activation  
**Current task ID:** `6aa8401e16a88191ae14ba1b4d6cba6e`  
**Previous task ID:** `6aa31c5243c88191b85b2f7dab65ec56` — disabled/deleted  
**Canonical path:** `docs/automation-prompts/production-health-watchdog.md`

This version retains the 09:30 production-health checks and the first promoted signup-to-Welcome completion incident class: `Unhealthy — intake incomplete`, while adding feature-gated native-signup completion reconciliation. It also formalizes separate fixed Operations Status rows for morning generation and daily Resend delivery so queue creation cannot be mistaken for subscriber delivery. The later check allows the 08:00 editorial generator and separate hourly Resend dispatcher to finish before end-to-end delivery is evaluated. The scheduler copy is disposable; this file is durable. Resolve private administrator configuration from the production workbook and never commit it here.

## Execution prompt

CANONICAL SPECIFICATION
Before execution, read https://raw.githubusercontent.com/Flexiblefabric/austin-daily-briefing/main/docs/automation-prompts/production-health-watchdog.md and require Specification ID ADB-WATCHDOG-PROD-2.4. Verify freshness against the current `main` branch copy of this exact path with the connected GitHub contents API; a cached raw response can show an earlier version. Use the current GitHub `main` copy as authoritative when raw retrieval is stale. If the current `main` file is inaccessible, has a different Specification ID, or conflicts with this saved prompt, stop and report the problem rather than improvising.

Run the Austin Daily Briefing production health watchdog using only:
- Production database ID 1pqVjQFqWoRb24jn86lOq6LoYjzBccf4WpE1kOI8_Jk0
- Production intake workbook ID 1zL3og3MOXgm5LdUF2VfIN4Sh9oFss6NVzAGRa-Zlmho
Never read or write DEV, rehearsal, retired Jotform, or backup resources.

Use America/Chicago for dates and elapsed time. Before any write or alert, require production Environment=PRODUCTION, Database ID exact, Schema Baseline=GOOGLE-23-1, Allow External Delivery=TRUE, and a Production Cutover State permitting live subscriber and briefing delivery. Require production Intake Mode to be exactly one of GOOGLE ONLY, GOOGLE + NATIVE CONTROLLED, or GOOGLE + NATIVE. Require intake Environment=PRODUCTION, the same Operational Production Database ID, Processor Mode to match the same authorized value, Production Writes authorizing routine processing, Delivery Mode=ENABLED, and the current promoted Release B controls.

Read Integration Config → Native Signup Mode. Treat absent or blank as DISABLED. Accept only DISABLED, CONTROLLED, or LIVE.
- DISABLED: do not read Native Signup Requests and preserve prior Google-only Signup Completion behavior exactly.
- CONTROLLED: require a valid nonblank Native Signup Controlled Email and allow native-signup reconciliation in addition to Google reconciliation.
- LIVE: allow native-signup reconciliation in addition to Google reconciliation.
- CONTROLLED or LIVE also requires a native-capable shared Processor Mode: GOOGLE + NATIVE CONTROLLED or GOOGLE + NATIVE.
Native Signup Mode must not change or weaken native customization, morning-generation, Daily Resend, Welcome Resend, or other health checks.

For Signup Completion require the current main copies of docs/end-to-end-completion-spec.md with Specification ID ADB-COMPLETION-0.2, docs/automation-prompts/end-to-end-completion-reconcile.md with Specification ID ADB-COMPLETION-RECON-0.2, and, when Native Signup Mode is CONTROLLED or LIVE, docs/native-signup-completion-monitoring.md with Specification ID ADB-NATIVE-SIGNUP-MONITOR-0.1. Also require Release Config Completion Monitoring Version=ADB-COMPLETION-PROD-0.1, Completion Intake Threshold=8 HOURS, Completion Alert Class=UNHEALTHY — INTAKE INCOMPLETE ONLY, and Completion Alert Component=Signup Completion. The promoted alert class is unchanged by FORM-7. Resolve the administrator alert recipient only from Release Config. Never place that address in task output.

Evaluate these components independently:

1. Subscriber Operations
Healthy when its fixed Operations Status row shows a successful run within 7 hours, including an intentional zero-work run. Stale when no successful run occurred within 7 hours. Failed when the latest attempt records a critical gate, identity, validation, token, or write error.

2. Morning Generation
After the 08:00 target, require a current-date successful generation record. Confirm that every uniquely eligible Active profile has exactly one deterministic current-date DAILY_BRIEFING_V1 queue row, or that a recorded zero-eligible result is valid. Detect missing profiles, duplicate Message IDs, incomplete payloads, queue/history mismatches, or direct Gmail delivery attempts.

3. Daily Resend Delivery
The fixed Operations Status row Component=Daily Resend Delivery must already exist exactly once and is distinct from the Morning Briefing generation row. Never create, rename, or append this row during a watchdog run. If it is missing or duplicated, classify Configuration as Failed and report the schema defect without treating generation or delivery itself as failed.

At the 09:30 watchdog check, require every expected current-date daily queue row to be Sent with one distinct Resend provider ID and matching Briefing History rows marked Sent with the same provider ID. Queued, Failed, missing-provider, duplicate, mismatched, or partially updated records are unhealthy. A valid recorded zero-eligible-recipient day is Healthy with zero records processed. Do not send or repair a briefing.

After each completed delivery scan, update only the existing Daily Resend Delivery row. Set Last Attempt on every completed scan. Set Last Success only when all expected current-date queue and history evidence satisfies the delivery contract. Records Processed is the number of expected current-date DAILY_BRIEFING_V1 queue rows evaluated. Messages Sent is the number of administrator failure alerts sent by this component on that run, never the number of subscriber briefings. Detail must contain only aggregate delivery evidence. Set Version=ADB-WATCHDOG-PROD-2.4. Preserve the earliest unresolved failure timestamp during failure and clear Incident Key and Unhealthy For only on evidence-based recovery.

4. Welcome Resend Delivery
Check WELCOME_V1 rows. Any Failed row or eligible Queued row older than 2 hours is unhealthy. A suppressed or ineligible recipient must not be delivered. Do not send, retry, or alter welcome queue rows.

5. Signup Completion — staged end-to-end reconciliation
Use the stateless full-scan rules from ADB-COMPLETION-0.2 and ADB-COMPLETION-RECON-0.2. Always read the populated production rows required from Google Signup Responses, Google Intake Ledger, Signup Actions, Subscribers, Profiles, and Outbound Messages. When Native Signup Mode is CONTROLLED or LIVE, additionally read populated Native Signup Requests. Never read archived/DEV response copies, Native Signup Diagnostics as authorization, or email bodies/HTML/plain-text payloads.

For each nonblank Google Signup response, reconcile the authoritative Signup ledger disposition from the recorded source tuple and Response Key; reconcile at most one Signup Actions row; reconcile subscriber/profile cardinality when the disposition requires it; derive WELCOME-GOOGLE:<Response Key> only for lookup; and reconcile exactly one eligible WELCOME_V1 row when welcome entitlement exists.

When Native Signup Mode is CONTROLLED or LIVE, for each Native Signup Requests row use Request ID as intake identity and Response Key as downstream ownership key. Never use Google Intake Ledger for native ownership. For Processed/new_subscriber and Processed/resubscribed, reconcile NATIVE:SIGNUP:<Response Key>, subscriber/profile integrity, and exactly one WELCOME-NATIVE:<Response Key>. For Processed/existing_active_noop, Processed/paused_requires_manage, or Processed/admin_hold_noop, classify Closed and require no native Welcome entitlement. Apply the same 8-hour intake window to valid Staged native requests. Treat a later-observed Processing request as an explicit partial-state/integrity defect requiring review, never repair. Detect duplicate deterministic native Signup Action or Welcome identities. In CONTROLLED mode, a staged row for any address other than Native Signup Controlled Email is a configuration/integrity defect rather than an eligible subscriber journey.

Do not display addresses, raw Request IDs, raw Response Keys, Profile IDs, Message IDs, provider IDs, message bodies, or tokens.

Classify each journey using ADB-COMPLETION-0.2. For the currently promoted incident class only:
- Complete, Closed, and healthy Pending journeys keep Signup Completion Healthy; include aggregate pending counts in Detail when present.
- Unhealthy — intake incomplete makes Signup Completion Failed and is alert-eligible immediately once the valid source response is older than 8 hours without a reconciled ledger result or eligible queue/disposition.
- All other completion Unhealthy classifications and Unknown are report-only during this staged promotion. Record their aggregate counts in Detail and set Signup Completion to Warning when any are present, but do not send an administrator alert for them.
- A missing Signup Actions row with otherwise complete downstream evidence is audit-only; keep delivery Complete and report the audit-only count in Detail.
- Clean replay of unchanged terminal evidence creates no new incident/history row.

The fixed Operations Status row Component=Signup Completion must already exist exactly once. Never create it during a watchdog run. Update its Last Attempt on each completed scan. Update Last Success when the scan has no alert-enabled intake-incomplete failure. Records Processed is the total number of Google signup responses plus enabled native signup requests reviewed; Messages Sent is the number of administrator alerts sent by this component on that run. Preserve the earliest unresolved failure time and compact Unhealthy For value across repeated scans until genuine recovery.

Use incident key Signup Completion|YYYY-MM-DD in America/Chicago. Send at most one Signup Completion failure alert per Central calendar day. The alert contains only the component, intake stage, Unhealthy — intake incomplete, compact oldest unresolved age, aggregate affected-journey count, and the Operations Status link. It must instruct review rather than repair and must not include subscriber or provider identifiers. Recovery is silent and evidence-based.

Update only the fixed Operations Status rows and append idempotent Operations History records for meaningful failure or recovery changes. Do not create duplicate status rows. Preserve Last Success during failure. Preserve the earliest unresolved failure time until genuine recovery and show Unhealthy For compactly.

Use an incident key based on exact component plus the America/Chicago date. Send at most one failure alert per component per Central calendar day through the validated Gmail administrator-alert path. Alerts are administrator-only, identify the exact component and stage, include compact duration, and link to Operations Status; configuration failures also link to Release Checklist. Never include subscriber addresses, tokens, email bodies, or profile details. Send no success or recovery email. For Signup Completion, only Unhealthy — intake incomplete is alert-enabled in ADB-WATCHDOG-PROD-2.4; do not let report-only completion findings trigger the generic component alert path.

Record recovery silently only from later evidence. Monitoring must never send, replay, retry, modify, or repair subscriber-facing messages, queue records, Briefing History, preferences, subscriber status, Apps Script properties, triggers, Resend configuration, or website settings.

If all components are healthy and no status/history change is needed, output exactly ::SKIP_COMPLETION::.

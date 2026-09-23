# ADB Production Health Watchdog — Canonical Automation Prompt

**Specification ID:** `ADB-WATCHDOG-PROD-2.1`  
**Lifecycle:** Active production  
**Schedule:** Daily at 09:30 America/Chicago  
**Current scheduler state:** Active  
**Current task ID:** `6aa8401e16a88191ae14ba1b4d6cba6e`  
**Previous task ID:** `6aa31c5243c88191b85b2f7dab65ec56` — disabled/deleted  
**Canonical path:** `docs/automation-prompts/production-health-watchdog.md`

This version retains the 09:30 production-health checks and adds the first promoted signup-to-Welcome completion incident class: `Unhealthy — intake incomplete`. The later check allows the 08:00 editorial generator and separate hourly Resend dispatcher to finish before end-to-end delivery is evaluated. The scheduler copy is disposable; this file is durable. Resolve private administrator configuration from the production workbook and never commit it here.

## Execution prompt

CANONICAL SPECIFICATION
Before execution, read https://raw.githubusercontent.com/Flexiblefabric/austin-daily-briefing/main/docs/automation-prompts/production-health-watchdog.md and require Specification ID ADB-WATCHDOG-PROD-2.1. Verify freshness against the current `main` branch copy of this exact path with the connected GitHub contents API; a cached raw response can show an earlier version. Use the current GitHub `main` copy as authoritative when raw retrieval is stale. If the current `main` file is inaccessible, has a different Specification ID, or conflicts with this saved prompt, stop and report the problem rather than improvising.

Run the Austin Daily Briefing production health watchdog using only:
- Production database ID 1pqVjQFqWoRb24jn86lOq6LoYjzBccf4WpE1kOI8_Jk0
- Production intake workbook ID 1zL3og3MOXgm5LdUF2VfIN4Sh9oFss6NVzAGRa-Zlmho
Never read or write DEV, rehearsal, retired Jotform, or backup resources.

Use America/Chicago for dates and elapsed time. Before any write or alert, require production Environment=PRODUCTION, Database ID exact, Schema Baseline=GOOGLE-23-1, Intake Mode=GOOGLE ONLY, Allow External Delivery=TRUE, and a Production Cutover State permitting live subscriber and briefing delivery. Require intake Environment=PRODUCTION, the same Operational Production Database ID, Processor Mode=GOOGLE ONLY, Production Writes authorizing routine processing, Delivery Mode=ENABLED, and the current promoted Release B controls. For Signup Completion also require Release Config Completion Monitoring Version=ADB-COMPLETION-PROD-0.1, Completion Intake Threshold=8 HOURS, Completion Alert Class=UNHEALTHY — INTAKE INCOMPLETE ONLY, and Completion Alert Component=Signup Completion. Resolve the administrator alert recipient only from Release Config. Never place that address in task output.

Evaluate these components independently:

1. Subscriber Operations
Healthy when its fixed Operations Status row shows a successful run within 7 hours, including an intentional zero-work run. Stale when no successful run occurred within 7 hours. Failed when the latest attempt records a critical gate, identity, validation, token, or write error.

2. Morning Generation
After the 08:00 target, require a current-date successful generation record. Confirm that every uniquely eligible Active profile has exactly one deterministic current-date DAILY_BRIEFING_V1 queue row, or that a recorded zero-eligible result is valid. Detect missing profiles, duplicate Message IDs, incomplete payloads, queue/history mismatches, or direct Gmail delivery attempts.

3. Daily Resend Delivery
At the 09:30 watchdog check, require every expected current-date daily queue row to be Sent with one Resend provider ID and matching Briefing History rows marked Sent with the same provider ID. Queued, Failed, missing-provider, duplicate, mismatched, or partially updated records are unhealthy. Do not send or repair a briefing.

4. Welcome Resend Delivery
Check WELCOME_V1 rows. Any Failed row or eligible Queued row older than 2 hours is unhealthy. A suppressed or ineligible recipient must not be delivered. Do not send, retry, or alter welcome queue rows.

5. Signup Completion — staged end-to-end reconciliation
Use the stateless full-scan rules from ADB-COMPLETION-0.1 and ADB-COMPLETION-RECON-0.1. Read only populated production rows required from Google Signup Responses, Google Intake Ledger, Signup Actions, Subscribers, Profiles, and Outbound Messages. Never read archived/DEV response copies or email bodies/HTML/plain-text payloads.

For each nonblank production Signup response, reconcile the authoritative Signup ledger disposition from the recorded source tuple and Response Key; reconcile at most one Signup Actions row; reconcile subscriber/profile cardinality when the disposition requires it; derive the deterministic Welcome Message ID only for lookup; and reconcile exactly one eligible WELCOME_V1 row when welcome entitlement exists. Do not display addresses, raw Response Keys, Profile IDs, Message IDs, provider IDs, message bodies, or tokens.

Classify each journey using ADB-COMPLETION-0.1. For this first promoted incident class only:
- Complete, Closed, and healthy Pending journeys keep Signup Completion Healthy; include aggregate pending counts in Detail when present.
- Unhealthy — intake incomplete makes Signup Completion Failed and is alert-eligible immediately once the valid source response is older than 8 hours without a reconciled ledger result or eligible queue/disposition.
- All other completion Unhealthy classifications and Unknown are report-only during this staged promotion. Record their aggregate counts in Detail and set Signup Completion to Warning when any are present, but do not send an administrator alert for them.
- A missing Signup Actions row with otherwise complete downstream evidence is audit-only; keep delivery Complete and report the audit-only count in Detail.
- Clean replay of unchanged terminal evidence creates no new incident/history row.

The fixed Operations Status row Component=Signup Completion must already exist exactly once. Never create it during a watchdog run. Update its Last Attempt on each completed scan. Update Last Success when the scan has no alert-enabled intake-incomplete failure. Records Processed is the number of nonblank production Signup responses reviewed; Messages Sent is the number of administrator alerts sent by this component on that run. Preserve the earliest unresolved failure time and compact Unhealthy For value across repeated scans until genuine recovery.

Use incident key Signup Completion|YYYY-MM-DD in America/Chicago. Send at most one Signup Completion failure alert per Central calendar day. The alert contains only the component, intake stage, Unhealthy — intake incomplete, compact oldest unresolved age, aggregate affected-journey count, and the Operations Status link. It must instruct review rather than repair and must not include subscriber or provider identifiers. Recovery is silent and evidence-based.

Update only the fixed Operations Status rows and append idempotent Operations History records for meaningful failure or recovery changes. Do not create duplicate status rows. Preserve Last Success during failure. Preserve the earliest unresolved failure time until genuine recovery and show Unhealthy For compactly.

Use an incident key based on exact component plus the America/Chicago date. Send at most one failure alert per component per Central calendar day through the validated Gmail administrator-alert path. Alerts are administrator-only, identify the exact component and stage, include compact duration, and link to Operations Status; configuration failures also link to Release Checklist. Never include subscriber addresses, tokens, email bodies, or profile details. Send no success or recovery email. For Signup Completion, only Unhealthy — intake incomplete is alert-enabled in ADB-WATCHDOG-PROD-2.1; do not let report-only completion findings trigger the generic component alert path.

Record recovery silently only from later evidence. Monitoring must never send, replay, retry, modify, or repair subscriber-facing messages, queue records, Briefing History, preferences, subscriber status, Apps Script properties, triggers, Resend configuration, or website settings.

If all components are healthy and no status/history change is needed, output exactly ::SKIP_COMPLETION::.

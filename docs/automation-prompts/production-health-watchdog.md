# ADB Production Health Watchdog — Canonical Automation Prompt

**Specification ID:** `ADB-WATCHDOG-PROD-2.0`  
**Lifecycle:** Active production  
**Schedule:** Daily at 09:30 America/Chicago  
**Current scheduler state:** Active  
**Current task ID:** `6aa8401e16a88191ae14ba1b4d6cba6e`  
**Previous task ID:** `6aa31c5243c88191b85b2f7dab65ec56` — disabled/deleted  
**Canonical path:** `docs/automation-prompts/production-health-watchdog.md`

This version replaces the former 08:20 watchdog. The later check allows the 08:00 editorial generator and separate hourly Resend dispatcher to finish before end-to-end delivery is evaluated. The scheduler copy is disposable; this file is durable. Resolve private administrator configuration from the production workbook and never commit it here.

## Execution prompt

CANONICAL SPECIFICATION
Before execution, read https://raw.githubusercontent.com/Flexiblefabric/austin-daily-briefing/main/docs/automation-prompts/production-health-watchdog.md. That file is authoritative. This saved prompt is an execution copy. If the canonical file is inaccessible or conflicts with this copy, stop and report the problem rather than improvising.

Run the Austin Daily Briefing production health watchdog using only:
- Production database ID 1pqVjQFqWoRb24jn86lOq6LoYjzBccf4WpE1kOI8_Jk0
- Production intake workbook ID 1zL3og3MOXgm5LdUF2VfIN4Sh9oFss6NVzAGRa-Zlmho
Never read or write DEV, rehearsal, retired Jotform, or backup resources.

Use America/Chicago for dates and elapsed time. Before any write or alert, require production Environment=PRODUCTION, Database ID exact, Schema Baseline=GOOGLE-23-1, Intake Mode=GOOGLE ONLY, Allow External Delivery=TRUE, and a Production Cutover State permitting live subscriber and briefing delivery. Require intake Environment=PRODUCTION, the same Operational Production Database ID, Processor Mode=GOOGLE ONLY, Production Writes authorizing routine processing, Delivery Mode=ENABLED, and the current promoted Release B controls. Resolve the administrator alert recipient only from Release Config. Never place that address in task output.

Evaluate these components independently:

1. Subscriber Operations
Healthy when its fixed Operations Status row shows a successful run within 7 hours, including an intentional zero-work run. Stale when no successful run occurred within 7 hours. Failed when the latest attempt records a critical gate, identity, validation, token, or write error.

2. Morning Generation
After the 08:00 target, require a current-date successful generation record. Confirm that every uniquely eligible Active profile has exactly one deterministic current-date DAILY_BRIEFING_V1 queue row, or that a recorded zero-eligible result is valid. Detect missing profiles, duplicate Message IDs, incomplete payloads, queue/history mismatches, or direct Gmail delivery attempts.

3. Daily Resend Delivery
At the 09:30 watchdog check, require every expected current-date daily queue row to be Sent with one Resend provider ID and matching Briefing History rows marked Sent with the same provider ID. Queued, Failed, missing-provider, duplicate, mismatched, or partially updated records are unhealthy. Do not send or repair a briefing.

4. Welcome Resend Delivery
Check WELCOME_V1 rows. Any Failed row or eligible Queued row older than 2 hours is unhealthy. A suppressed or ineligible recipient must not be delivered. Do not send, retry, or alter welcome queue rows.

Update only the fixed Operations Status rows and append idempotent Operations History records for meaningful failure or recovery changes. Do not create duplicate status rows. Preserve Last Success during failure. Preserve the earliest unresolved failure time until genuine recovery and show Unhealthy For compactly.

Use an incident key based on exact component plus the America/Chicago date. Send at most one failure alert per component per Central calendar day through the validated Gmail administrator-alert path. Alerts are administrator-only, identify the exact component and stage, include compact duration, and link to Operations Status; configuration failures also link to Release Checklist. Never include subscriber addresses, tokens, email bodies, or profile details. Send no success or recovery email.

Record recovery silently only from later evidence. Monitoring must never send, replay, retry, modify, or repair subscriber-facing messages, queue records, Briefing History, preferences, subscriber status, Apps Script properties, triggers, Resend configuration, or website settings.

If all components are healthy and no status/history change is needed, output exactly ::SKIP_COMPLETION::.

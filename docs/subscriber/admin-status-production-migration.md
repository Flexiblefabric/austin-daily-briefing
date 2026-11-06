# Production Admin Status migration and compatibility gate

**Scope:** ADB subscriber eligibility / FORM-9 readiness
**Date opened:** 2026-10-12
**State:** SCHEMA AND LEGACY STATUS MIGRATION COMPLETE — normal-cycle observation pending; FORM-9 production Gate E remains blocked
**Production database:** existing authoritative subscriber workbook
**Intake:** existing authoritative production intake workbook
**FORM-9 public feature:** DISABLED; Google Manage remains public
**Scheduler identities:** preserve ADB-SUBOPS-PROD-1.1 and ADB-DAILY-PROD-2.0 until deliberate coordinated spec promotion

## Baseline and findings (privacy-safe)

- Before this change, production Subscribers used delivery Status `Admin Hold` for one existing test account and did not have a separate `Admin Status` field. That account's linked Profile had Status `Active`, which is a genuine schema mismatch.
- Other delivery statuses: 13 Active, one Unsubscribed; 15 unique Subscriber emails, 15 unique Profile IDs, 15 linked Profiles, 345 Preferences (23 each). No duplicate or orphaned subscriber/profile IDs, duplicate preferences, or subscriber/profile email mismatches were found.
- The existing Resend Welcome, daily, and sender-change eligibility logic historically checked Subscriber Status=Active without a separate administrative overlay. Morning briefing generation and Subscriber Operations similarly need the overlay.
- Production Welcome queues had no Queued entries at the time of audit. This observation does not replace a pre-deployment / pre-cutover queue check.
- FORM-9 DEV proved pause/resume blocked under Hold, reset allowed without removing Hold, unsubscribe honored while preserving Hold, and fresh signup cannot reactivate while held; idempotent replays passed.

## Phase 1 — additive, non-disruptive schema change (COMPLETED)

Add Subscribers column H `Admin Status`, with strict validation values `OK`, `Review`, `Hold`. Backfill all 15 existing accounts: 14 OK and 1 Hold. Readback confirmed all 15 values. No delivery Status or Profile Status, queue entry, trigger, template, confirmation link, or production script was altered during this phase.

**Historical invariant:** During phase 1, the legacy held account was deliberately left at Subscriber Status `Admin Hold` / Profile Status `Active` until the updated delivery consumer was synchronized. Phase 3 has since safely converted both to `Paused`, retaining `Admin Status=Hold`.

## Phase 2 — compatibility code and canonical task instructions (COMPLETED — first normal-cycle observation pending)

1. Stage a ResendTransport.gs source change that requires `Subscribers.Admin Status` to exist; authorizes Welcome, daily and sender-change delivery only for Subscriber Status=Active **AND** Admin Status=OK **AND** an exactly matching, uniquely resolved Profile with Status=Active and matching normalized email. Blank, unknown, Review, Hold, duplicate/missing identity, or legacy Status=Admin Hold must fail closed.
2. Run static + simulated helper unit tests and existing transport compatibility tests, and ensure the actual production Apps Script source is synchronized with GitHub after review. The repository merge alone does NOT update live Apps Script.
3. Inspect production Resend delivery properties/triggers and run the **read-only** compatibility validator. Confirm exact source build/readback; do not initiate test sends or queue dispatch merely to verify the change.
4. Update canonical daily generation eligibility to require both independent Admin Status=OK and Active subscriber/profile parity. Preserve ID ADB-DAILY-PROD-2.0, production schedule and queue-only authority.
5. Update production Subscriber Operations spec: mandatory Admin Status, explicit OK on newly created subscribers, no signup reactivation under Hold/Review regardless of delivery status, no resetting the admin restriction via user requests, verified unsubscribe always allowed, and no customization for Hold/Review. Preserve ID ADB-SUBOPS-PROD-1.1, six-hour schedule and current Google/native feature gates.
6. Before the next Subscriber Operations normal cycle, ensure its canonical GitHub readback reflects these instructions. Reconcile any subscribers created since initial backfill: all must have valid Admin Status, linked Profile, and allowed delivery Status. A blank administrative value must never silently default to OK. If no supported manual processor update is possible, block promotion and report.
7. FORM-9 native production intake, confirmation processing, and public cutover remain DISABLED and out of scope for this migration.

## Phase 3 — one legacy held-status conversion (COMPLETED 2026-10-12)

After confirmation that the active Resend dispatcher and both production automation readers enforce independent Admin Status:

- Immediately reread the unique legacy held subscriber and linked Profile. Require Subscriber Status=`Admin Hold`, Admin Status=`Hold`, and linked Profile Status=`Active`. If changed, stop and re-audit.
- In a controlled operation, change **only** Subscriber Status to `Paused` and the linked Profile Status to `Paused`. Keep Admin Status=`Hold` unchanged. This is the non-deliverable and status-parity-safe target.
- Record audit provenance without reproducing subscriber identity in public GitHub, and verify no email, Welcome, daily queue, profile preferences, or delivery/transport settings changed.
- Read back all 15+ subscribers for unique IDs, delivery Status in exactly {Active, Paused, Unsubscribed}, Admin Status in exactly {OK, Review, Hold}, linked Profile status parity, and exactly 23 preference records per profile. A new signup between audits must be reconciled, not assumed already covered.
- Run routine zero-send validation where supported, without dispatching queued mail as a test. Monitor next real scheduled Subscriber Operations, Morning Briefing generation and Resend delivery passes for correct excluded counts.

## Migration completion evidence — 2026-10-12

- GitHub PR #112 merged with green site-preview, documentation, and selection-note checks. The canonical daily and Subscriber Operations specifications retain IDs ADB-DAILY-PROD-2.0 and ADB-SUBOPS-PROD-1.1.
- Operator copied the merged `ResendTransport.gs` to the production Apps Script project. A read-only `getAdbResendRuntimeStatusV1()` execution reported build `resend-transport-admin-status-v1`, correct production database/intake, `GOOGLE + NATIVE` processor mode, and both Welcome and daily script delivery modes LIVE.
- Read-only spreadsheet preflight immediately before conversion confirmed the one legacy account was `Admin Hold` / `Hold` in Subscribers and `Active` in Profiles. No queued outbound messages were found.
- A single Google Sheets batch changed only the subscriber's delivery Status to `Paused` and linked Profile's Status to `Paused`, retaining independent `Admin Status=Hold`.
- Postmigration full readback: 15 unique subscribers and linked profiles; 13 Active/OK, one Paused/Hold, one Unsubscribed/OK. All subscriber/profile delivery statuses now match. Every profile has 23 unique preferences (345 total), with no missing, duplicate, or orphaned identities. The outbound queue contains zero Queued messages.
- One matching audit entry was written to the production Change Log and one to Deployment Log. No send, replay, new signup, trigger, newsletter generation, credential change, or FORM-9 production activation was performed in this migration.
- **Not yet verified:** next naturally scheduled Subscriber Operations, Morning Briefing and Resend dispatcher cycles under the migrated data and revised canonical specs. Check errors, zero unexpected recipient changes, newly created subscriber Admin Status=OK, hold exclusions, and monitoring row outcomes. Do not force execution or send mail to test.
- **FORM-9 Gate E still blocked:** neither native management production intake nor production processing was activated by this migration.

## Rollback / stop

- Do NOT collapse Hold back into Active to resolve a mismatch. A conservative `Paused` subscriber is preferable if a hold migration is interrupted.
- If a row loses Admin Status or parser/consumer compatibility is uncertain, **stop** dependent subscriber mutations or delivery, audit H values and repair eligibility checks first. Maintain the conservative Paused/Hold state for the previously held account.
- Never run a customer-visible dispatcher or send verification mail as a migration probe; do not alter production consent history, tokens, triggers or the disabled FORM-9 gate.
- If live send code ever loses its Admin Status guard, halt further schema/status migration and repair runtime compatibility; repository changes are not equivalent to active Apps Script runtime deployment.
- Revert source code only after verifying that rollback preserves the independent Hold exclusion; do not delete the Admin Status data as a simple rollback.

## Gate E remains blocked

FORM-9 production management is separate future work. It still requires its own disabled staging endpoint and runtime gates, canonical production processor integration with exactly-once confirmed request handling, privacy safeguards, transport validation, explicit cutover approval, and a monitoring/rollback plan.

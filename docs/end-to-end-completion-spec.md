# End-to-end completion contract

**Specification ID:** `ADB-COMPLETION-0.2`  
**Status:** Active completion contract; first intake-incomplete incident class promoted, full reconciler remains manual/read-only  
**Baseline observed:** 2026-09-19  
**Production writes or alerts enabled:** No

This contract defines how Austin Daily Briefing determines whether a valid Google or native signup completed the full path from authoritative intake through welcome-provider acceptance. It does not prove inbox placement or message reading. The reconciler is observational: it must never create or repair subscribers, profiles, queue rows, delivery fields, or messages.

## Authoritative records and joins

| Stage | Workbook and tab | Required evidence | Join |
|---|---|---|---|
| Google source | Production intake — `Google Signup Responses` | Timestamp, address, affirmative consent, exact source row | Existing ledger tuple: Form Type + Source Tab + Source Row |
| Google intake ledger | Production intake — `Google Intake Ledger` | One Signup row with Response Key, source identity, result, Processed At | Recorded Response Key is authoritative after processing |
| Native source | Production intake — `Native Signup Requests` | Request ID, Created At, normalized address, affirmative consent, Source, Response Key, Status/Result | Request ID is the intake identity; Response Key is the deterministic downstream ownership key |
| Processing audit | Production database — `Signup Actions` | At most one row for the Response Key, with profile and queue result | Submission ID = Response Key |
| Subscriber/profile | Production database — `Subscribers` and `Profiles` | One permitted subscriber outcome and one uniquely resolved profile when welcome-eligible | Profile ID; normalized address only for integrity comparison |
| Queue/delivery | Production database — `Outbound Messages` | One deterministic `WELCOME_V1` row; final `Sent` and one provider result | Message ID = `WELCOME-GOOGLE:<Response Key>` for current signup records |

For an already ledgered Google response, never derive a new identity merely because displayed source values or row order have changed. Reconcile using the recorded key and source tuple under the production subscriber-operations rules.

For native signup, never use the Google Intake Ledger as the ownership source. Expected downstream IDs are `NATIVE:SIGNUP:<Response Key>` and `WELCOME-NATIVE:<Response Key>`. Native monitoring is active only when Integration Config → Native Signup Mode is CONTROLLED or LIVE; DISABLED means ignore Native Signup Requests entirely.

Native terminal no-welcome results are authoritative when the request is Processed as `existing_active_noop`, `paused_requires_manage`, or `admin_hold_noop`. A Processed `new_subscriber` or `resubscribed` request is welcome-entitled and must reconcile to the deterministic native Signup Action/Welcome path. A request left in `Processing` is a partial-state defect requiring operator review; monitoring must never repair it.

A missing `Signup Actions` row is an **audit-integrity defect** when the authoritative intake disposition and all downstream records prove completion. It is not, by itself, a delivery failure and must not trigger a resend.

## Timing states

Use America/Chicago as the operational timezone.

| Condition | Classification |
|---|---|
| Valid Google response or valid Staged native request is less than 8 hours old without a terminal processor result/eligible queue | `Pending — intake window` |
| Valid Google response or valid Staged native request is more than 8 hours old without a reconciled terminal result or eligible queue/disposition | `Unhealthy — intake incomplete` |
| Welcome queue row is `Queued` for no more than 2 hours | `Pending — delivery window` |
| Welcome queue row remains `Queued` for more than 2 hours | `Unhealthy — delivery overdue` |
| All required records agree and queue is `Sent` with one Resend provider ID | `Complete` |
| Required evidence cannot be read | `Unknown` |

The effective maximum healthy signup-to-provider window is 10 hours: up to 8 hours for intake reconciliation and up to 2 additional hours after queuing.

Explicit errors do not wait for an age threshold. Immediately classify as unhealthy when the latest processor result records a critical error, a valid ledgered result has contradictory or missing downstream identity, the welcome row is `Failed`, a `Sent` row lacks a provider identifier, duplicate response keys or deterministic message IDs exist, or identity/cardinality checks are ambiguous.

Legacy Gmail delivery evidence may be recognized when auditing historical records, but new production completion requires a Resend provider ID.

## Outcomes and exceptions

Each valid source response must resolve to exactly one of:

- `Complete — new or reactivated subscriber welcome sent`
- `Pending — intake window`
- `Pending — delivery window`
- `Closed — duplicate/existing/paused/Admin Hold subscriber with documented no-welcome disposition`
- `Closed — invalid or consent absent`
- `Unhealthy — explicit processing or integrity failure`
- `Unhealthy — intake incomplete`
- `Unhealthy — delivery overdue`
- `Unknown — evidence unavailable`

An exception is valid only when the ledger or another authoritative production record states the disposition. Silence, a missing row, or a task reporting zero eligible work cannot supply an exception.

## Baseline findings

The 2026-09-19 read-only review found:

- 11 populated production signup responses and 11 corresponding Signup ledger records.
- All 11 signup journeys had a deterministic welcome row recorded as Sent.
- No current welcome row was Queued or Failed, and every reviewed Sent signup welcome had delivery evidence.
- Median historical signup-to-queue time was 130 minutes; the maximum was 808 minutes.
- Median queue-to-send time was 24 minutes; the maximum was 33 minutes.
- Four historical signup-to-queue journeys exceeded the adopted 8-hour threshold. These journeys are now complete; they are historical validation that the threshold would have exposed the earlier processing delay.
- One completed signup (source row 9; ledger row 23) lacks a matching `Signup Actions` row. Subscriber, profile, ledger, queue, and Resend evidence agree. Classify this as an audit-integrity defect, not a delivery failure, and do not resend.

The production subscriber database metadata reports timezone `Etc/GMT`, while operational text timestamps are labeled CT and the intake workbook uses `America/Chicago`. The reconciler must not rely on workbook-local interpretation of those text values. During development, parse the established formats explicitly and compare in America/Chicago. A future schema revision should prefer machine-readable timestamps with offsets.

## Reusable scan state and recovery

The first reusable reconciler should remain **stateless and full-scan** while production signup volume is small enough for bounded reads of the populated response, ledger, audit, subscriber/profile, and Welcome queue tables. A full scan is safer than introducing a mutable high-water mark before it is operationally necessary and automatically covers missed runs and long-delayed records.

For the initial recurring implementation:

- Read the currently populated production Google Signup response and Signup ledger ranges on every run.
- Read Native Signup Requests only when Native Signup Mode is CONTROLLED or LIVE; ignore the tab when DISABLED.
- Reconcile every nonblank Google Signup response to its ledger disposition and every eligible native request to its request Status/Result and deterministic downstream evidence.
- Continue reporting unresolved records on every run until they become Complete, Closed by an authoritative disposition, or remain explicitly Unhealthy/Unknown.
- Do not persist subscriber identifiers, raw response keys, provider IDs, addresses, bodies, or tokens in monitoring state.
- The monitor may persist only sanitized aggregate/status evidence that it owns after a separate production-monitoring promotion.

If volume later requires incremental scanning, introduce a high-water mark only through a reviewed schema/runtime change. That future design must:

1. advance the high-water mark only after a complete successful scan;
2. re-scan an overlap window of at least 24 hours;
3. retain unresolved sanitized row references outside the high-water boundary until terminal resolution;
4. leave the prior high-water mark unchanged after an Unknown/partial read;
5. support a full-scan recovery mode that can reconstruct state without sending or repairing subscriber messages.

After promotion into production monitoring, incident/recovery evidence should follow the existing Operations History retention policy. The reconciler itself remains observational and never becomes an alternate subscriber processor or dispatcher.

## Read-only reconciler output

A run reports only:

- Counts by terminal/pending/unhealthy/unknown outcome.
- Sanitized source, ledger, action, and queue row numbers for exceptions.
- Oldest pending age and breached threshold.
- Duplicate/cardinality counts.
- Baseline or prior-run comparison when available.

Never report addresses, subscriber names, email bodies, confirmation tokens, raw provider IDs, or administrator routing. Use the full-scan rule above for the initial recurring implementation; do not add mutable high-water state merely as an optimization.

## Test gate

Before production alerts:

1. Test DEV fixtures for Google and native new signup, native re-subscribe, Active no-op, Paused no-op, Admin Hold no-op, delayed processing within the window, native Staged intake overdue, native Processing partial state, duplicate submission, invalid consent, missing audit row with completed delivery, queued overdue, provider failure, Sent without provider evidence, duplicate message ID, and clean replay.
2. Run one read-only production observation for at least 24 hours, covering multiple six-hour processor cycles.
3. Compare every non-complete result manually.
4. Enable at most one new incident class at a time. Existing processor and dispatcher ownership must remain unchanged.
5. Preserve daily per-component alert deduplication and silent evidence-based recovery.

Promotion of this contract into the production watchdog is a production monitoring-subsystem change and requires the release checklist, registry update where applicable, changelog entry, and immutable snapshot.

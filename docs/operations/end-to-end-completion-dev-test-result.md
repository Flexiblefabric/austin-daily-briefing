# DEV completion-vector exercise — 2026-09-22

**Contract:** `ADB-COMPLETION-0.1`  
**Reusable prompt:** `ADB-COMPLETION-RECON-0.1`  
**Mode:** Controlled synthetic DEV classification harness  
**Result:** PASS — 15/15 documented vectors matched their expected disposition

## Method

The current DEV workbook schemas for Signup responses, Intake Ledger, Signup Actions, Subscribers, Profiles, and Outbound Messages were inspected read-only before the exercise so the fixture model matched the live development record shape.

The documented vectors in [end-to-end-completion-test-vectors.md](end-to-end-completion-test-vectors.md) were then exercised with the pure classifier in `scripts/test_completion_vectors.py`. The harness makes no network calls and performs no spreadsheet writes, subscriber/profile changes, queue changes, dispatcher invocations, or email sends. A deep-copy mutation guard verifies the test fixtures remain unchanged during classification.

## Results

| Vector | Expected | Observed | Result |
|---|---|---|---|
| New response, no ledger yet | Pending — intake window | Pending — intake window | PASS |
| Delayed intake | Unhealthy — intake incomplete | Unhealthy — intake incomplete | PASS |
| Queued normally | Pending — delivery window | Pending — delivery window | PASS |
| Delivery overdue | Unhealthy — delivery overdue | Unhealthy — delivery overdue | PASS |
| Completed | Complete | Complete | PASS |
| Processor error | Unhealthy — explicit processing or integrity failure | Unhealthy — explicit processing or integrity failure | PASS |
| Partial identity write | Unhealthy — explicit processing or integrity failure | Unhealthy — explicit processing or integrity failure | PASS |
| Duplicate source submission | Closed — documented disposition | Closed — documented disposition | PASS |
| Invalid consent | Closed — documented disposition | Closed — documented disposition | PASS |
| Missing audit row only | Complete + audit-only defect | Complete + audit-only defect | PASS |
| Failed welcome | Unhealthy — explicit processing or integrity failure | Unhealthy — explicit processing or integrity failure | PASS |
| Sent without provider evidence | Unhealthy — explicit processing or integrity failure | Unhealthy — explicit processing or integrity failure | PASS |
| Duplicate deterministic welcome | Unhealthy — explicit processing or integrity failure | Unhealthy — explicit processing or integrity failure | PASS |
| Unreadable required range | Unknown — evidence unavailable | Unknown — evidence unavailable | PASS |
| Clean replay | Complete; no new incident | Complete; no new incident | PASS |

Mutation guard: **PASS**.

## Interpretation

The controlled classification gate is clean. The reconciler rules distinguish healthy Pending states from overdue states, preserve documented Closed dispositions, treat the known missing-audit-only pattern as delivery-complete rather than a resend condition, surface integrity/duplicate/provider defects immediately, return Unknown when required evidence is unreadable, and keep an unchanged completed replay terminal without creating a new incident.

This exercise does not promote alerts or write any monitor-owned production state. Existing subscriber operations and dispatchers retain sole write/send ownership.

The next completion-monitoring step is to stage one incident class for controlled alert-path validation before integrating approved reconciliation into the production watchdog.

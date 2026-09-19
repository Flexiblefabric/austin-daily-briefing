# End-to-end completion test vectors

These controlled vectors validate `ADB-COMPLETION-0.1` classification without writing synthetic subscribers into production.

| Vector | Evidence | Age | Expected result | Alert policy after promotion |
|---|---|---:|---|---|
| New response, no ledger yet | Valid affirmative response only | 2h | Pending — intake window | None |
| Delayed intake | Valid response, no reconciled queue/disposition | 8h 1m | Unhealthy — intake incomplete | Immediate |
| Queued normally | Consistent ledger/action/profile and one Queued welcome | 45m queued | Pending — delivery window | None |
| Delivery overdue | Same, still Queued | 2h 1m queued | Unhealthy — delivery overdue | Immediate |
| Completed | Consistent path, Sent, one Resend provider ID | Any permitted path | Complete | None |
| Processor error | Latest authoritative result is critical failure | Any | Unhealthy — explicit failure | Immediate |
| Partial identity write | Ledger exists; subscriber/profile/queue identity is contradictory or missing | Any | Unhealthy — integrity failure | Immediate |
| Duplicate source submission | Documented duplicate/existing-subscriber disposition; no welcome entitlement | Any | Closed — documented disposition | None |
| Invalid consent | Documented invalid/consent-absent disposition | Any | Closed — invalid | None |
| Missing audit row only | Ledger, subscriber/profile, queue, and provider evidence agree; Signup Actions absent | Complete | Audit-only defect; delivery Complete | Daily report |
| Failed welcome | Queue Status = Failed | Any | Unhealthy — explicit failure | Immediate |
| Sent without provider evidence | Status Sent; provider field blank or invalid | Any | Unhealthy — integrity failure | Immediate |
| Duplicate deterministic welcome | More than one matching Message ID | Any | Unhealthy — duplicate | Immediate |
| Unreadable required range | Required workbook/tab/range unavailable | Any | Unknown | Immediate after promotion |
| Clean replay | Same completed records on later scan; no changed evidence | N/A | Complete; no new incident | None |

The first observation task is report-only. It must not send immediate alerts even when a vector would eventually qualify; alert behavior is staged only after the 24-hour report is reviewed.

# Editorial Publisher DEV — October 28 runtime evidence

Status: core DEV commit/replay and rejection checks passed. This record does not authorize or claim production activation.

Installed source revision: `27c484eca26c2da77f594c31373ae479ae7c93f1` (ADB-PUBLISHER-DEV-0.1). Later documentation-only commits do not require changing that installed source pin.

## Observed evidence

| Check | Evidence | Result |
| --- | --- | --- |
| Setup | Operator's Apps Script log, 08:22:43 America/Chicago: PASS — DEV setup verified. No writes or emails. | PASS |
| Synthetic commit | Connector readback of the target ledger: committed at 2026-10-28T13:32:10.614Z (08:32:10 CT). | PASS |
| Repeat invocation | Operator's 08:34 execution log: both calls returned ALREADY_COMMITTED for 2026-10-28-publisher-v1. | PASS |
| Queue readback | Exactly one DAILY_BRIEFING_V1 record, Queued, complete HTML/text and blank sent/provider field. | PASS |
| History readback | Exactly six unique rows, Pending, blank provider IDs, structured editorial notes and exact required dispatcher suffix. | PASS |
| Ledger readback | Exactly one record, expected run and package hash, profile count 1 and history count 6. | PASS |
| Changed committed package | Operator's 08:37:49 log: expected conflict rejected. | PASS |
| Paused subscriber | Operator's 08:37:49 log: changed eligibility rejected. | PASS |
| Incorrect queue schema | Operator's 08:37:49 log: schema drift rejected. | PASS |
| Missing selection evidence | Operator's 08:37:49 log: malformed evidence rejected. | PASS |

Package: `PUB-QA-2026-10-28-01`  
Run: `2026-10-28-publisher-v1`  
Canonical package SHA-256: `74ae9c3337a98440c6902486c1c9afd8dcce67a777c669a755e413551b1bfe45`

The 08:34 log alone shows replay, not the original COMMITTED response. The independently read ledger and matching queue/history establish the earlier persisted commit. No duplicate rows were observed. The rejection checks used cloned in-memory package/state objects and called the pure planning function; they did not alter live subscriber status, headers or package contents.

External delivery remains FALSE. This DEV module contains no delivery API or trigger installer. Queue/history provider fields are blank; this test provides no email-delivery evidence and claims none.

## Remaining gates

Full-audience payload-size/execution-time measurements, live partial/timeout/concurrency scenarios beyond offline mocks, immutable READY permissions and separate writer identity, legacy production-history normalization, approved release-notice policy, operational error recording, shadow comparison and a separate controlled production adapter/cutover remain outstanding. The four rejection checks do not establish those broader properties.

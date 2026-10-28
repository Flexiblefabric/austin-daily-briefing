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

Real-content full-audience sizing (synthetic 12/24-profile sizing passed below), live partial/timeout/concurrency scenarios beyond offline mocks, immutable READY permissions and separate writer identity, legacy production-history normalization, approved release-notice policy, operational error recording, shadow comparison and a separate controlled production adapter/cutover remain outstanding. The four rejection checks do not establish those broader properties.

## Apps Script synthetic batch sizing — 10:58 CT

The operator ran `runPublisherDevBatchQaV1` with helper source
`e0ba6e0ab05e3a6bf4ef43a83a95d289c4bbeae9` alongside the unchanged publisher
source pin `27c484eca26c2da77f594c31373ae479ae7c93f1`.
The execution log began at 10:58:36 and completed at 10:58:42 America/Chicago.

| Synthetic profiles | Proposed history rows | Request bytes | Writer limit used | Plan/render/validate | Total measurement | Renderer parity |
| ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | 6 | 34,931 | 1.9% | 62 ms | 73 ms | 1/1 |
| 12 | 72 | 412,379 | 22.9% | 39 ms | 156 ms | 12/12 |
| 24 | 144 | 824,148 | 45.8% | 78 ms | 291 ms | 24/24 |

All three request sizes were below the writer's 1,800,000-byte safeguard.
The final report returned `PASS`, `syntheticOnly:true`, `writes:false`,
`emails:false`, `twelveProfileBatchFits:true` and
`doubleAudienceBatchFits:true`. Overall measured elapsed time was 5,191 ms,
including DEV reads and in-memory work.

These are small synthetic six-item editions. The timings are single-run
observations, not a benchmark establishing that 12 or 24 profiles execute faster
than one. They exclude the Sheets commit and provider delivery and do not
exercise a full production historical database. Exact renderer parity compares
planned payloads against the approved renderer for the same synthetic input; it
does not constitute a production editorial shadow comparison.

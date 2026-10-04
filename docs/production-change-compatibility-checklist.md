# Production change compatibility checklist

Use this checklist for any production change that can alter configuration values, routing, queue ownership, transport behavior, runtime modes, provider boundaries, or the set of components allowed to operate.

A change is not ready for promotion merely because its canonical prompt, documentation, or primary component accepts the new state. Every executable downstream consumer of the changed state must also be compatible.

## Trigger conditions

Run this compatibility gate when a production change modifies any of the following:

- Environment, Intake Mode, Processor Mode, Delivery Mode, or other shared configuration values;
- queue or delivery ownership;
- message template identifiers or queue schemas;
- external delivery providers or sender paths;
- Apps Script, Worker, scheduler, or automation routing;
- subscriber intake modes or verification paths;
- production database, workbook, endpoint, or service identity;
- a safety gate used by more than one production component.

If it is unclear whether a change qualifies, treat it as qualifying.

## Required compatibility matrix

Before promotion, identify every executable component that reads the changed value or consumes output produced under the changed state.

For each component, record:

| Field | Required evidence |
| --- | --- |
| Changed production state | Exact old value and proposed new value |
| Consumer | Function, script, automation, Worker, or other executable component |
| Source | Canonical repository file or canonical automation prompt |
| Runtime copy | Where the deployed/running copy lives |
| Accepted state | Exact values the executable code currently permits |
| Compatibility result | PASS, FAIL, or UNKNOWN |
| Verification | Static code check, controlled execution, or non-writing probe |
| Remediation | Required change before promotion, if any |

PASS requires evidence from the executable consumer itself. Documentation that says a state is supported is not sufficient when runtime code independently validates that state.

FAIL or UNKNOWN blocks promotion.

## Transport-specific preflight

When the change can affect email delivery or queue processing:

1. Inspect the current repository source for every dispatcher that can consume the affected queue.
2. Inspect the exact validation functions used before provider handoff.
3. Confirm the proposed production state is accepted by those validators.
4. Confirm queue ownership and template identifiers are unchanged or deliberately reconciled.
5. Confirm delivery-mode and external-delivery gates remain enabled as intended.
6. For manually installed Apps Script, replace or verify the deployed source against the current approved repository version before cutover.
7. Run a controlled or non-writing validation path when available.
8. If a controlled delivery is appropriate, require one successful provider handoff and a zero-send replay before broad promotion.
9. Confirm monitoring/watchdog logic recognizes the proposed state independently from the dispatcher.
10. Record the result in the cutover evidence.

The daily and welcome Resend dispatchers are independent consumers and must both be checked when shared transport validation changes.

## Manual-runtime parity

Repository merge does not prove that a manually deployed runtime is current.

For Apps Script or any other manually copied deployment, promotion evidence must state one of:

- deployed source was replaced from the approved repository revision immediately before promotion; or
- deployed source was independently compared with that revision and found equivalent.

If runtime parity cannot be established, compatibility is UNKNOWN and promotion is blocked.

## Post-promotion verification

After promotion, verify the first normal production cycle end to end:

- upstream generation/intake completed;
- expected queue records were created;
- dispatcher/provider handoff occurred;
- provider IDs were recorded;
- matching history/status rows reached their expected terminal state;
- no duplicate send/application occurred;
- monitoring recorded the component independently.

A clean upstream result does not count as downstream delivery evidence.

## 2026-10-04 corrective precedent

The native-customization cutover changed production from `GOOGLE ONLY` to `GOOGLE + NATIVE`. Canonical Daily Briefing and watchdog contracts permitted the new state, but `apps-script/ResendTransport.gs` still rejected any Intake Mode other than `GOOGLE ONLY`. The October 4 briefing generated normally but remained queued because the dispatcher failed before Resend handoff.

This checklist is the corrective control: shared configuration changes must be traced through executable downstream consumers, not only through prompts and documentation.

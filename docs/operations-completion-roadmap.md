# Operations completion and task reconciliation roadmap

**Status:** In progress. Phase 1 contract completed 2026-09-19; first 24-hour read-only observation completed 2026-09-20; manual ChatGPT-task reconciliation baseline and controlled DEV completion-vector gate completed 2026-09-22. No new completion alerts or repair behavior are enabled.
**Scope:** Subscriber intake through welcome delivery; daily generation through delivery; scheduled-task existence and timing. V2 editorial shadow evidence and Friday recap development are tracked separately.

## Existing paths and boundaries

- Production Subscriber Operations runs every six hours and owns intake processing and creation of one queued `WELCOME_V1` message per eligible signup. The hourly Apps Script welcome dispatcher alone owns sending and queue delivery fields.
- The 08:00 America/Chicago daily generation task creates `DAILY_BRIEFING_V1` queue and Briefing History rows. The hourly Apps Script daily dispatcher alone sends and updates delivery results.
- The 09:30 watchdog already checks Subscriber Operations freshness, daily generation, daily queue/history/provider consistency, and aged or failed welcome rows. It may update only its own Operations Status and History records and send administrator alerts; it cannot repair delivery.
- `PROJECT_STATE.json` and canonical prompt files record the intended ChatGPT task IDs and schedules. Live scheduler state is the evidence for whether a task exists and is enabled. Apps Script trigger state must be checked through its runtime, not inferred from the ChatGPT task list.
- No subscriber addresses, tokens, administrator addresses, payloads, or provider credentials belong in GitHub or alert text.

## Phase 1 — Define the completion contract (completed 2026-09-19)

The production signup path, join keys, timing states, privacy boundaries, baseline, and test gate are defined in [the end-to-end completion contract](end-to-end-completion-spec.md). Use the recorded Response Key and source tuple for an already ledgered intake response; do not derive a second identity. Use deterministic Message ID for each welcome and Run ID + Profile ID for daily history.

| Journey | Expected terminal evidence | Explicit exceptions |
|---|---|---|
| Signup | Valid production signup response has one reconciled ledger result, one eligible subscriber/profile, one deterministic welcome queue row, and `Sent` plus one Resend provider ID after the dispatcher runs. | Invalid/duplicate/rejected response, deliberate suppression, existing-subscriber path, or no welcome entitlement must have a specific auditable disposition. |
| Daily issue | Each uniquely eligible Active profile has one current-date deterministic queue row, matching history rows, `Sent` and one consistent Resend provider ID after dispatch. | Explicitly recorded zero-eligible success, identity ambiguity, or a documented exclusion must not be counted as a silent success. |
| Scheduled tasks | Each Active registered ChatGPT task resolves to one live enabled task with matching task ID, schedule/timezone, recent run outcome, and plausible next run. | Held/Development/Retired prompts have no expected active task. Apps Script triggers are verified separately. |

Completion means provider acceptance and matching internal records; it does **not** prove inbox placement or that a subscriber read the email. Record pending within the agreed processing window, unhealthy after it, and unknown when evidence cannot be read. Do not treat a missing row or inaccessible scheduler as a successful zero-work run.

## Phase 2 — Signup-to-welcome reconciliation (in progress; observation complete)

1. The first read-only production observation is complete. Its durable closeout is recorded in [end-to-end-completion-observation-result.md](end-to-end-completion-observation-result.md); the one-time canonical prompt is retained as a retired audit artifact. The observation found one in-window signup still inside the healthy intake window at cutoff; that journey later completed inside the contract window. The known audit-only defect remained a delivery-complete integrity gap.
2. The initial reusable reconciler will use a stateless full scan of the small populated production signup/ledger/audit/Welcome tables rather than introduce a mutable high-water mark prematurely. The contract now defines future high-water, >=24-hour overlap, unresolved-record retention, Unknown handling, and full-scan recovery rules if incremental scanning later becomes necessary.
3. Apply the adopted timing model: Pending for up to 8 hours from valid signup to a reconciled queue/disposition, then Unhealthy; after queuing, Pending for up to 2 additional hours, then Unhealthy. Explicit failures, contradictions, duplicates, and identity/cardinality defects are unhealthy immediately.
4. Detect orphaned ledger states, valid responses never processed, duplicate keys/message IDs, queued but never sent welcomes, Failed rows, and Sent rows missing a provider ID. Reconcile legitimate suppression/reactivation outcomes.
5. **Completed 2026-09-22.** The controlled synthetic DEV harness exercised all 15 documented vectors in `end-to-end-completion-test-vectors.md`; every expected classification matched and the fixture mutation guard passed. See [end-to-end-completion-dev-test-result.md](end-to-end-completion-dev-test-result.md) and `scripts/test_completion_vectors.py`. No subscriber/profile/queue writes, dispatcher invocations, or sends occurred.
6. **OPS-5 stage 1 completed in controlled staging on 2026-09-23.** `Unhealthy — intake incomplete` was selected as the first completion-specific incident class. The alert-policy harness passed 10/10 checks, including daily deduplication, silent recovery, privacy boundaries, and report-only handling for all other completion classes. One synthetic `[CONTROLLED TEST]` administrator alert was accepted by Gmail using the existing validated alert path. The live watchdog prompt and scheduler copy remain unchanged pending explicit promotion review. See [completion-incident-stage-1.md](completion-incident-stage-1.md). Existing processor and dispatcher retain sole write/send ownership.

### 2026-09-22 reusable full-scan baseline

A manual read-only run of the reusable full-scan model reviewed all 12 populated production Signup journeys. All 12 were Complete, with zero Pending, Unhealthy, Unknown, duplicate-ledger, duplicate-Welcome, duplicate-action, or identity-cardinality results. Three early journeys were recognized through permitted legacy Gmail delivery evidence; newer journeys use Resend provider evidence. The known source-row-9 / ledger-row-23 missing Signup Actions record remains the single audit-only defect. See [end-to-end-completion-reconciliation-baseline.md](end-to-end-completion-reconciliation-baseline.md).

This baseline validates the current production joins and classifications. The controlled DEV failure/replay classification gate was subsequently completed on 2026-09-22 with 15/15 documented vectors passing.

**Acceptance:** Every controlled case has one correct disposition, zero duplicate welcome sends, no test subscriber in production, and an intentional zero-work run stays healthy. A deliberately stranded valid signup becomes unhealthy after the documented threshold and recovers only when the completion evidence exists.

## Phase 3 — Task and trigger reconciliation (manual scheduler baseline complete; trigger visibility pending)

1. A manual read-only baseline on 2026-09-22 reconciled all three registered active ADB ChatGPT tasks by exact task ID, enabled state, recurrence/timezone, and recent-run plausibility. All three matched. The reusable rules and baseline are recorded in [task-reconciliation.md](task-reconciliation.md).
2. The current operator connection can read scheduler state interactively. Unattended scheduler-read capability has not yet been proven; any monitor run that cannot read it must report `Unknown — scheduler state unavailable`. The available scheduler metadata also does not guarantee an authoritative expected-next-run field, so the runbook forbids inventing one.
3. Apps Script trigger state remains unresolved. Inspect the installed hourly Welcome/Daily dispatcher triggers through an authoritative Apps Script runtime interface when available. Historical Sent rows/provider IDs prove execution occurred previously but do not prove the triggers remain installed now.
4. Test missing task, disabled task, changed schedule, stale/failed last run, missing next run, Held task absent, duplicate active task, missing Apps Script trigger, and temporary API read failure in a controlled environment. Do not disable a production task to manufacture a test.
5. Add this check to an existing production monitoring execution only after permission/availability and runtime tests pass. The 09:30 watchdog is the preferred daily checkpoint; keep critical signup and delivery checks on their existing cadence. Record task registration changes when scheduler copies are restored.

**Acceptance:** The monitor detects each simulated mismatch without editing tasks, queues, or recipients; it reports Unknown for unreadable scheduler data; and restoring the registered task produces an evidenced recovery.

## Phase 4 — Production rollout and review

- Follow [the short release checklist](release-checklist.md). Snapshot and changelog are required when the promotion changes the production monitoring subsystem or registry; prompt, code, and registry edits must agree before release.
- Run controlled DEV cases, then a read-only production observation across at least one signup processor cycle and one daily briefing cycle. Compare counts by hand before enabling new alerts.
- Promote one reconciliation path at a time. Preserve existing component alerts and daily per-component deduplication. Monitor the first two live cycles and verify one genuine or controlled failure/recovery path without sending a duplicate subscriber message.
- Roll back new alerting/check logic independently of the intake processor and dispatchers if it generates false positives. Keep any recorded incident history for audit.

## Priorities and dependencies

1. Execute the documented DEV completion vectors for the reusable full-scan reconciler.
2. Obtain authoritative Apps Script trigger visibility or preserve trigger state as Unknown.
3. Validate controlled scheduler mismatch cases without disrupting production.
4. Stage one completion incident class, then integrate approved reconciliation into the existing watchdog.
5. Complete the short post-promotion observation before closing the monitoring subsystem.

No V2 promotion, Friday recap change, or shadow-review evidence-log work is part of this release.

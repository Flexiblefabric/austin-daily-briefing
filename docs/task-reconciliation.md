# Scheduled-task reconciliation

**Status:** Current manual baseline recorded 2026-09-22  
**Scope:** ChatGPT scheduler tasks registered by Austin Daily Briefing  
**Mode:** Read-only  
**Apps Script trigger state:** Not covered by this baseline

This runbook compares the authoritative scheduler registrations in `PROJECT_STATE.json` with live scheduler metadata. It is intentionally separate from content/delivery health: a task can exist on schedule while its downstream operation is unhealthy, and healthy historical queue rows do not prove a trigger still exists.

## 2026-09-22 baseline

| Registered task | Registry expectation | Live scheduler result | Baseline |
| --- | --- | --- | --- |
| Austin Daily Briefing | ID `6a91bd2144d081918d9d54d5c14d1175`; active; 08:00 America/Chicago daily | Exact ID found, enabled, exact daily 08:00 schedule; recent run present | PASS |
| Production Subscriber Operations | ID `6aa1acbcf17c8191a9a89cc95b433629`; active; every 6 hours | Exact ID found, enabled, six-hour recurrence; recent run present | PASS |
| ADB Production Watchdog | ID `6aa8401e16a88191ae14ba1b4d6cba6e`; active; 09:30 America/Chicago daily | Exact ID found, enabled, exact daily 09:30 schedule; recent run present | PASS |

The global scheduler also contains the expected non-ADB Weekly Movement Plan. One active scheduler slot remains available under the recorded five-slot budget.

The one-time ADB Completion Observation has completed and is disabled. Disabled historical V2 scheduler copies also exist, but V2 is currently Held/Development and the canonical GitHub prompt remains authoritative; those copies are not expected active production tasks.

## Classification rules

For each task registered as Active:

- **Healthy** — exact registered task ID resolves uniquely, task is enabled, recurrence and timezone materially match the registry, and recent scheduler metadata is plausible for the expected cadence.
- **Pending** — an exact-time run is inside a small scheduler-latency window and there is not yet evidence of a missed execution.
- **Unhealthy** — registered task is missing, disabled, duplicated, materially rescheduled, wrong-timezone, or stale beyond the component's existing operational tolerance.
- **Unknown** — scheduler metadata cannot be read or the available interface omits evidence required to decide safely.

Held, Development, or Retired prompts do not require an enabled scheduler task.

## Timing rule

Do not invent a new operational freshness threshold when an existing production component already has one.

- Subscriber Operations uses the existing production health rule: a successful component run should occur within **7 hours**.
- Morning Generation uses the existing watchdog rule: after the 08:00 target, the 09:30 watchdog requires a current-date generation result.
- Production Watchdog is expected at 09:30. For scheduler-existence reconciliation, allow ordinary scheduler latency; if a current-day watchdog run is still absent after 10:00, flag the scheduler state for review.

Scheduler metadata alone does not establish component success. Component success remains owned by Operations Status, queue/history/provider evidence, and the canonical watchdog rules.

## Next-run metadata

If the scheduler interface exposes an authoritative expected-next-run value, compare it with the registered recurrence.

If it does not, infer only the expected schedule from the canonical RRULE and classify the next-run field itself as unavailable. Do not manufacture a timestamp and do not call the task unhealthy solely because the interface omits a next-run field.

## Unavailable scheduler state

If the scheduler cannot be read during an unattended monitor run:

> `Unknown — scheduler state unavailable`

Do not treat unreadable state as healthy and do not edit/recreate a task automatically.

## Apps Script boundary

The hourly Welcome and Daily Resend dispatchers are Apps Script triggers, not ChatGPT scheduler tasks. Their installed-trigger state must be inspected through the Apps Script runtime or another authoritative trigger interface.

Until that visibility exists:

- queue rows and provider IDs may prove a dispatcher ran historically;
- they do **not** prove the trigger remains installed now;
- trigger health must remain `Unknown — runtime trigger state not inspected` rather than inferred.

## Safe test cases still required

Before this check becomes part of production monitoring, validate without intentionally breaking production:

- missing registered task using a controlled fixture or mocked registry;
- disabled task;
- changed schedule/timezone;
- stale last-run metadata;
- unavailable scheduler metadata;
- duplicate scheduler registration;
- Held prompt with no active task;
- missing Apps Script trigger through a non-production runtime fixture.

The preferred eventual production home is the existing 09:30 watchdog, not a new scheduler slot.

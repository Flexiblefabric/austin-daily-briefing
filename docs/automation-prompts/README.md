# ADB Automation Prompt Registry

This directory is the durable source for Austin Daily Briefing task prompts. ChatGPT scheduler entries are runtime copies, not the source of truth.

## Lifecycle policy

- **Active:** A scheduler task exists and its current task ID is recorded in `PROJECT_STATE.json`.
- **Held:** No scheduler task is required. The complete prompt, intended schedule, last known task ID, and restoration notes remain in GitHub.
- **Development:** Prompt may change and does not consume a scheduler slot unless a controlled run is explicitly authorized.
- **Retired:** Preserved for audit but must not be recreated without a new approval.

Disabling a task may cause it to be treated as deleted and disappear from the task interface. Therefore, never use the scheduler itself as storage.

Before pausing or deleting any ADB task:

1. Verify its canonical prompt file exists on `main`.
2. Record its schedule, lifecycle state, and last known task ID in `PROJECT_STATE.json`.
3. Mark the registry state Held or Retired.
4. Only then remove the scheduler copy.

To restore a task:

1. Read the canonical file.
2. Revalidate production IDs, safety gates, transport ownership, and private configuration sources.
3. Create a new scheduler task.
4. Record its new task ID and Active state in `PROJECT_STATE.json`.

## Slot budget

ADB reserves scheduler capacity deliberately. Production Daily Briefing, Production Subscriber Operations, and Production Health Watchdog are vital scheduled tasks. Manual experiments, domain checks, and V2 shadow reviews remain repository-only while held. The project should preserve at least one unallocated global scheduler slot when practical.

## Registered prompts

- [Austin Daily Briefing](austin-daily-briefing.md) — active
- [Production Subscriber Operations](production-subscriber-operations.md) — active
- [Production Health Watchdog](production-health-watchdog.md) — active after recreation
- [V2 Shadow Review](../v2-shadow-review-prompt.md) — development/manual
- [Domain Health Check](../domain-health-check.md) — manual runbook

## Shared presentation standards

- [Source-Link Presentation Standard](../source-link-standard.md) — active cross-platform source attribution and link-format specification

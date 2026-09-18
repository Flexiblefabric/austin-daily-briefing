# Short release checklist

Use for ADB production changes. Fill this out in a PR description or a short release note; routine documentation and cosmetic edits need only the relevant items. This checklist does not replace a component's controlled test or cutover runbook.

## Before change

- [ ] State the reader/operational outcome, scope, owner, and whether the change is DEV-only or production.
- [ ] Identify the source of truth, affected data and task IDs, exact write/send owner, and production safety gates.
- [ ] State the expected result, failure signal, validation method, rollback action, and any subscriber-facing impact.
- [ ] Confirm that DEV testing cannot send to production subscribers or write production workbooks.

## Promotion

- [ ] Complete the smallest meaningful DEV or controlled test, including a replay/duplicate check when messages or records are involved.
- [ ] Review the actual rendered message/site or resulting rows as applicable; confirm monitoring detects failure as well as success.
- [ ] Update the canonical prompt/code and `PROJECT_STATE.json` when intended production architecture, task ID, schedule, or lifecycle changes.
- [ ] For material production architecture, promotion, dependency, data routing, subsystem, rollback, or migration changes: add a newest-first `docs/CHANGELOG.md` entry and an immutable registry snapshot. Otherwise, record the release in the PR or brief release note. Never put secret values or subscriber data in either.
- [ ] Check CI and promote only the tested version. Record the time and operator.

## After change

- [ ] Verify the real production result at the next relevant cycle, including downstream completion rather than only the initiating task's success.
- [ ] Check for duplicate sends, stuck queues, stale tasks/triggers, and unintended subscriber impact where relevant.
- [ ] Record observed result, open issues, and rollback decision. Prepare subscriber-facing announcement copy only when the change actually affects subscribers; use a separate reviewed and authorized send.

For documentation-only or cosmetic changes, the PR review and applicable CI checks generally satisfy the release record. Do not create a registry snapshot solely to check a box.

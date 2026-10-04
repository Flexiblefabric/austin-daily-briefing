# Repository Branch Hygiene

**Status:** Active policy  
**Established:** 2026-10-04  
**Scope:** Git branches in `Flexiblefabric/austin-daily-briefing`

## Purpose

Keep the repository branch list small enough to reflect current work without discarding unresolved or uniquely recoverable history.

GitHub pull requests, merge commits, squash commits, and repository history remain the durable record of completed work. A merged topic branch is not retained merely as a historical marker.

## Branch policy

`main` is the only permanent branch.

A non-`main` branch is eligible for deletion when all of the following are true:

- it is not protected;
- it is not the head of an open pull request;
- it is not explicitly retained for unresolved reconciliation; and
- either its current tip exactly matches the head SHA of a merged pull request, or GitHub reports that the branch is zero commits ahead of `main`.

A branch must be retained when any of the following are true:

- it has commits not safely accounted for by a merged pull request or `main`;
- it is associated with active or intentionally paused work;
- it is protected;
- it is the head of an open pull request; or
- its relationship to current production state is ambiguous.

Do not force-move a stale branch to `main` merely to make it deletable. Resolve or deliberately discard its unique history first.

## 2026-10-04 baseline audit

The audit found 62 non-`main` branches and zero open pull requests.

### Safe cleanup set

- 55 branches had tips that exactly matched already-merged pull-request heads.
- `social-card-refresh-v2` was zero commits ahead of `main`.
- Total safe cleanup set: **56 branches**.

### Retained for reconciliation

These six branches contain commits that are not safely classified by the merged-head or zero-ahead rules and are therefore retained:

- `design-system-v0-1`
- `native-customization-security-stage-v1`
- `native-forms-roadmap-v1`
- `newsletter-identity-redesign`
- `ops/completion-intake-alert-stage`
- `sec/subscriber-data-security-baseline`

Their presence does not mean their content should be restored. Much of it appears to be older or superseded development history. They are retained only until their unique commits can be reconciled deliberately.

## Cleanup implementation

`.github/workflows/branch-hygiene.yml` implements the policy.

On the pull request that introduces or changes the workflow, it performs a dry-run audit only. On the initial merge of the workflow to `main`, it applies the safe cleanup. After that, it is intended for manual use through `workflow_dispatch`; routine repository changes do not trigger branch deletion.

Manual runs default to dry-run. Applying deletion requires the explicit `apply=true` workflow input.

The workflow never deletes `main`, protected branches, open-PR branches, or the explicit reconciliation-retention set above.

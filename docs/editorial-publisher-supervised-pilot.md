# Supervised first-pilot runbook

Status: operating mode selected by the owner on October 30, 2026.
The dependency-injected snapshot/review/sealing adapter is implemented and locally
tested; native Sheets IO, operator checks, review UI and one-time setup are now prepared.
Installation and actual runtime verification remain. See the
[setup guide](editorial-publisher-dev-review-install.md).
No pilot edition or production activation has been approved. See the
[DEV adapter implementation](editorial-publisher-dev-handoff.md). The October 30 E2E result remains completed historical DEV evidence.

## Operating agreement

ChatGPT prepares editorial JSON. Anthony reviews the exact draft and authorizes
its transfer/sealing. A trusted publisher validates, renders and commits only the
reviewed package. Existing Resend remains the delivery owner. Human supervision
does not prove that the drafting connection lacks other write capabilities.

Use the existing ADB-EDITORIAL-HANDOFF-1 contract and exact selection-evidence
rules. The existing pure adbDevSealDraftV1 helper only models a canonical copy
and digest. It does not validate a full handoff, provide review authorization,
persist two separate files or enforce access separation.

## Next DEV deliverable

Prepare a snapshot exporter and two-file handoff adapter with synthetic inputs.
Use fresh isolated DEV artifacts; preserve the committed October 30 E2E workbook.
The adapter must have explicit fixed DEV targets and reject production IDs.
Do not repoint the successful standalone E2E bundle or change production entry
points to obtain this workflow.

| Step | Responsible party | Required output |
| --- | --- | --- |
| Export inputs | Trusted snapshot exporter | Opaque profile IDs, eligible count, preferences, applicable published history, cutoff/window and reviewed source revision; no email addresses, management tokens or provider secrets |
| Draft | ChatGPT | Unsealed editorial package bound to those inputs; no operational target selection |
| Review | Anthony | Review record tied to the canonical candidate digest, edition, source revision, snapshot identity and exact preview |
| Transfer and seal | Trusted operator adapter | Independently copied, validated READY payload and digest in a separate sealed file |
| Publish in DEV | Deterministic publisher | Fresh-state validation, one atomic queue/history/ledger commit and independent readback |
| Reconcile | Monitoring owner | Healthy only after verified commit; repeat of the exact package causes no duplicate target rows |

The review record is an external operator-control record, not a new field added
to the existing editorial JSON schema. Its persistent format and authenticated
review mechanism must be defined by the adapter before installation. Draft
content must not be able to assert that approval occurred.

## What Anthony reviews

Present the exact edition/date in America/Chicago, eligible audience count,
source revision, history cutoff/completeness and a readable newsletter preview.
Show shared content and each distinct personalized selection/utility result,
with source URLs and repeat/material-update evidence. Show the canonical
candidate digest so review can be bound to the bytes subsequently copied.

Canonicalize and validate before review. The sealing adapter re-reads the draft,
compares it to the reviewed digest and independently validates trusted inputs.
If anything relevant changes, stop for a new preview and review; do not update
the digest and carry the old review forward. A successful format check is not
editorial approval or proof that a cited source supports a claim.

No email sending is part of review or sealing. Sealing must not invoke publication.
Publication is a separate explicit operator action after the required checks.

## Two-file rehearsal acceptance

Before asking Anthony to install or run another script, prepare the code,
automated checks, fixed-target manifest and concise installation instructions.

The synthetic rehearsal must demonstrate:

1. The draft export excludes operational secrets and recipient addresses.
   Trusted source data stays independent of the mutable draft snapshot.
2. Sealing rejects absent review, changed reviewed bytes, wrong edition, stale
   revision, changed audience/preferences/history and client-selected target IDs.
3. Successful transfer creates a separate canonical READY copy using the existing
   Packages / Package Chunks structure. Editing/deleting the draft afterward
   leaves that copy unchanged.
4. Reusing the same package identity with changed bytes blocks. An exact retry
   reconciles a prior successful transfer, including a lost write response,
   rather than appending a second READY manifest or conflicting chunks.
5. Independent precommit reads still reject changed trusted inputs and altered
   sealed bytes/digest. Full selection, renderer and payload gates remain active.
6. Publication and exact replay yield one queue row, six history rows and one
   ledger for the synthetic fixture, with verified monitoring and no email/alert
   delivery. This is a new rehearsal, not a rerun of the dated committed fixture.
7. Isolated target guards reject production and ambiguous configurations before
   writes. No permissions are described as verified without actual evidence.

The adapter must specify a separate authenticated operator path for review and
sealing; a boolean supplied by a draft or a prompt instruction is insufficient.
The persistence boundary must tolerate partial/ambiguous responses. Do not
describe a cross-file copy as a single atomic Sheets transaction.

## Before any live pilot

The owner selected supervised operation, not an exception to production release
requirements. Keep unresolved credential/immutable-READY gates visible. If a
temporary supervised exception is proposed, name its scope and residual
capabilities explicitly and obtain a concrete release decision; do not mark the
automatic gates PASS.

Prepare a review packet naming the future edition, exact code and package
digests, targets, staging/ledger provisioning, operator identity, monitoring
owner and recovery steps. Refresh the real-input shadow comparison and production
readiness evidence. Resolve the production adapter, dispatcher colocation/lock,
history completeness and monitoring requirements in the production gate document.

The cutover packet must coordinate the existing daily generator before a new
writer can own that edition. Do not create a second competing daily generation
path. Existing subscriber, transport and unrelated operational tasks remain
owned by their current components.

If a commit result is uncertain, inspect the independent ledger/target state
before another attempt. Never clear queue/history/ledger rows to make a retry
possible. After a verified commit, reconcile monitoring instead of regenerating
the same edition. Rollback stops new publication and preserves valid committed
rows for the existing dispatcher.

## Current operator action

Follow the [new standalone review setup](editorial-publisher-dev-review-install.md).
Run setup once and verify READY_FOR_REVIEW before deploying the owner review
screen. The seed is dated October 30, 2026 in America/Chicago. Do not reuse the
completed E2E workbook, add code to production or clear properties after a
partial setup. The screen seals only; publication integration comes later.

See [rollout design](editorial-publisher-rollout-design.md),
[production gates](editorial-publisher-production-gates.md) and
[completed October 30 evidence](editorial-publisher-e2e-2026-10-30.md).

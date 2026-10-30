# Option A rollout design and access decision

Status: supervised first-pilot mode selected by the owner, October 30, 2026.
The storage/adapter design below remains to be implemented and verified. No production activation,
account creation, sharing/permission change, new endpoint, task edit or deployment
is performed by this document. The DEV end-to-end milestone is complete; the
production credential boundary and adapter are not.

## What we are keeping

Keep ADB's existing editorial standards, renderer, selection evidence, one daily
edition key, atomic queue/history/ledger transaction and Resend delivery owner.
The AI produces editorial JSON. The publisher owns operational identifiers,
statuses, note serialization and suffixes, body rendering and persisted readback.
No new editorial schema or weakened repeat/selection policy is proposed here.

The October 30 standalone E2E test passed in Apps Script and independent
readback: one Queued message, six Pending history rows, one ledger and two
monitoring events ending Healthy. The deliberately lost monitoring response was
reconciled without another publication. No email or alert was sent. There are
113 passing local tests. This is DEV evidence, not a live cutover.

## Recommended storage boundary

Use two distinct production handoff files, both still unprovisioned:

| Artifact | Drafting runtime | Trusted operator/publisher | Purpose |
| --- | --- | --- | --- |
| Draft inbox | Submit/edit DRAFT inputs | Read and review | Mutable editorial work |
| Sealed staging | No write capability; preferably no direct access | Copy, validate, seal and read READY packages | Canonical publication input |
| Production database | No direct read/write capability | Existing authorized operational components | Queue, history and publisher ledger |
| Production monitoring | No direct write capability | Existing monitoring owner plus reviewed publisher integration | One canonical Morning Briefing status |

The sealed file reuses the existing Packages and Package Chunks headers. A draft
is copied into publisher-owned storage; the generator does not turn its own row
into READY. Sealing hashes the copied canonical payload after complete validation
and review. Editing or deleting the mutable draft must not alter the sealed copy.
No generic folder sharing is presumed safe: direct and inherited permissions,
ownership and the actual executing credentials need evidence.

The publisher must still re-read the sealed input and operational state before
the atomic target write. A hash detects changed bytes; it does not stop someone
who can rewrite both the bytes and the hash. Owner-only range protection in a
shared workbook is not a substitute for the file/credential boundary above.

## Inputs the drafting side actually needs

Provide a trusted exported snapshot containing opaque profile IDs, saved
editorial preferences, eligible count, complete applicable published-history
facts, cutoff/window and reviewed source revision. Do not expose subscriber
email addresses, management tokens, provider credentials or whole operational
workbooks merely to obtain those inputs. Existing profile IDs must not be
replaced with email addresses.

This is an input export, not a new publication authority. Any mutable draft-side
copy may be altered; the writer independently compares it against trusted state
using the existing contract. Exact prior facts, stable topic identity and lane/
profile scope still apply. Recent history and extended evergreen history must
be represented truthfully; unknown extended history cannot become complete by
omitting a difficult candidate after ranking.

## The unresolved execution boundary

The connected Drive tool interface accepts arbitrary spreadsheet IDs for reads
and writes. That interface is not evidence of a particular account's OAuth scope
or file ACL, and no task-scoped file restriction has been verified. A prompt
saying "drafts only" cannot establish an absent authorization boundary.

For unattended operation, the drafting execution must have only its permitted
draft submission/read-snapshot capabilities. It must not also have another
owner-authorized connector, raw Sheets writer, script editor, credential store,
sharing tool or endpoint that can reach the operational targets. Creating a
restricted endpoint while leaving a broad direct connector available does not
meet this condition.

Google's drive.file scope can support selected-file access in an app designed
for it. This is not evidence that the currently connected Drive plugin exposes
that scope or lets us change it. ChatGPT permission/approval settings, Drive
OAuth scopes, Drive ACLs and a server-side target allowlist are distinct controls.
None was changed or attested as passing during this review.

## Decision for the first rollout

| Path | Benefit | Requirement / limitation |
| --- | --- | --- |
| Supervised handoff using the current ChatGPT workflow | Preserves the existing editorial workflow and avoids committing to another runtime now | An operator reviews/transfers the JSON and seals it; this is a supervised pilot, not proof of enforced generator isolation or an unattended production release |
| Unattended handoff from a restricted drafting runtime | Preserves automatic daily operation with an enforceable boundary | Establish an execution context limited to snapshots/drafts; verify actual identity, tool grants and denied operations; a separate runtime may be needed if current task restrictions cannot be proven |

Owner decision, October 30: use a supervised first pilot. Retain ChatGPT editorial
authoring; the operator reviews and transfers one exact package into
publisher-owned staging. Prepare this workflow in DEV first. See the
[supervised pilot runbook](editorial-publisher-supervised-pilot.md).

This selection authorizes preparation of the supervised path, not production
activation, new sharing/credentials, a schedule change or automatic publication.
It does not turn the existing permission UNKNOWN checks into PASS. Before a live
pilot, explicitly review the release requirements and any proposed supervised
exception; there is no implicit waiver. The current live process continues until
a concrete cutover is reviewed and authorized.

## Required access evidence before unattended cutover

Test using non-live canary files under the intended principals/runtime, never an
attempted write against real queue/history rows. Record results privately, with
only redacted summaries in this repository:

1. Intended drafting execution can read its supplied snapshot and submit/edit a
   draft, but cannot write/delete/share the publisher-owned sealed store or a
   production-equivalent canary database/monitoring file.
2. No alternative owner-authorized tool or script-editing capability is available
   to that same drafting execution. Verify capabilities, not just prompt text.
3. Client-supplied target IDs, destination URLs, status fields and provider data
   cannot redirect the trusted submission/sealing/publishing path.
4. After sealing, a changed draft leaves the sealed canonical payload unchanged;
   an altered sealed payload/digest is rejected by the independent writer.
5. The publisher can read the sealed store and commit the authorized target,
   while the transport remains the sole email sender.

These tests are specified, not executed. A second Google account alone is not
enough if the drafting runtime can still choose another account's broad tools.

## Production implementation order

1. Resolve initial operating mode and, for unattended operation, the restricted
   execution identity. No global connector disconnect or permission reduction
   affecting other projects is assumed or authorized.
2. Prepare a trusted snapshot exporter and two-file staging/sealing adapter in
   DEV. Keep the exact handoff schema; reject source/audience/history changes.
3. Implement the explicit production adapter using Active=TRUE templates,
   canonical mirrored Preferences IDs and scoped history. Do not repoint a DEV
   entry point at a production workbook or disguise PRODUCTION as DEVELOPMENT.
4. Implement zero-audience monitoring as an explicit no-work success with no
   queue/history/ledger carrier; abandoned-attempt reconciliation; durable
   retention preserving replay/incident authority; and integration with the
   existing failure-only alert owner and silent recovery policy.
5. Prepare the one-time ledger/staging provisioning and controlled cutover plan.
   Refresh real-input read-only shadow evidence, request sizing and concurrency
   checks before proposing activation. Existing October 28 evidence is historical.

The DEV standalone bundle is not the production deployment artifact. The final
writer must share the actual dispatcher's Apps Script project and ScriptLock.
Connector/human writes do not join that lock automatically; a coordinated
operational-write policy remains part of release preparation. Fresh snapshots
are checks, not a Sheets compare-and-swap transaction.

## Cutover ownership and rollback

Do not activate a second daily generator or have both old and new generators
write the same edition. The eventual approved cutover must name the exact future
edition, source versions, package, target IDs, task/prompt changes, monitoring
owner and rollback procedure. Check existing daily ownership before a fresh
commit. Queue/history/ledger commit together; monitoring in the other workbook
is an idempotent follow-up reconciled against that ledger.

The generator reports draft/handoff completion only. The publisher owns generation
Last Success after verified target commit. The existing Resend transport keeps
provider-acceptance monitoring; accepted is not proof of inbox delivery. A missing
monitoring response must not requeue an already committed edition.

Rollback disables new publication. If an edition has a committed ledger, preserve
its valid queued rows under the existing dispatcher and do not restore the old
generator for that same edition. Any old-generation restoration concerns future
unowned editions only. Do not delete history/ledger rows to make a retry possible.

## Primary references checked October 30

- Google Drive scopes: https://developers.google.com/workspace/drive/api/guides/api-specific-auth
- Google Sheets protection limits: https://support.google.com/docs/answer/1218656?hl=en
- Drive ACLs, capabilities and inherited permissions: https://developers.google.com/workspace/drive/api/guides/manage-sharing

Google states that warning-only range protection does not block edits and owners
retain access; file scopes and ACLs must be chosen for the actual application.
These references justify the proposed distinction between draft/sealed storage
and an enforced credential boundary, not a claim about current account settings.

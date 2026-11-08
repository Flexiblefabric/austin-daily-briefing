# Reviewed handoff DEV adapter 0.1

October 30, 2026. Implemented as a dependency-injected, locally tested adapter in
`apps-script/EditorialPublisherDevHandoff.gs`. Native Sheets IO, authenticated operator checks, a review screen and one-time
fresh-file setup are now prepared in a separate unconfigured review-only bundle.
Actual provisioning, deployment and runtime verification have not occurred. See
[setup and runtime instructions](editorial-publisher-dev-review-install.md). The successful October 30 standalone E2E bundle is unchanged.

## Implemented behavior

`adbDevExportDraftSnapshotV1(input, sha256)` projects only opaque eligible profile
IDs, saved editorial settings/preferences, normalized published-history facts,
edition, reviewed source revision and trusted history bounds/completeness.
Operational subscriber/profile rows, email addresses, management tokens, provider
secrets and target identifiers are excluded. Nested settings, address-like content,
ambiguous identities and unknown history completeness block export. The DEV host
must supply truthful completeness evidence; this function cannot infer completeness
from a short range read. Projection does not classify arbitrary secrets embedded
in allowed editorial strings; upstream trusted input handling remains required.

`adbCreateDevReviewedHandoffV1(policy, io, sha256)` exposes four operator methods:

| Method | Result | Write behavior |
| --- | --- | --- |
| exportSnapshot() | Independent snapshot plus canonical digest | None |
| prepareReview(packageId) | Full planner validation, rendered per-profile previews, selection evidence and review ticket | None |
| sealReviewed(ticket) | Revalidate the exact reviewed draft/trusted inputs, copy canonical READY data and review receipt, independently read back | One sealed-file transaction supplied by host; exact retry reconciles |
| readReady(packageId) | Validate sealed copy and receipt against independent current inputs using the full planner | None; this is not a commit permit |

The ticket binds package identity/digest, snapshot digest, preview digest, edition
and source revision. It is a comparison token, **not a signature or bearer approval**.
Only the authenticated operator's explicit sealing invocation represents approval.
A draft-controlled `approved=true` field cannot replace that action. Changed bytes
need a new review. A second package with the same identity cannot replace an
existing sealed record.

The receipt is `{ticket, operator, at}` alongside `{stage}`; it is not added to the
ADB-EDITORIAL-HANDOFF-1 editorial JSON. `stage` retains the existing Packages /
Package Chunks structure. The sealed-file host must store receipt, manifest and
all chunks atomically in one file. The draft file is read, never rewritten by the
sealer. A cross-file transfer is not an atomic cross-file transaction.

## Trusted host contract and native implementation

Policy is immutable after factory creation and must be supplied from reviewed
host configuration, never from draft JSON or request-selected spreadsheet IDs:

- purpose: ISOLATED_REVIEWED_HANDOFF_DEV
- databaseId, draftId, sealedId: three distinct fresh DEV targets
- sourceRevision: exact reviewed source pin
- operator: expected authenticated operator principal

Production DB/intake and all three historical publisher/E2E workbooks are rejected.
No actual new file IDs or principal have been selected yet; the one-time setup
creates fresh files and captures the authenticated operator in the new project's
configuration. String checks and a purpose
marker do not attest to a file's ACL or environment; the concrete host must verify
those independently before enabling IO. The policy is not a deployment manifest.

Host dependencies:

| Dependency | Required guarantee |
| --- | --- |
| operatorIdentity() | Server-derived authenticated current principal; unavailable/ambiguous identity blocks. Never read from a draft or caller-supplied email |
| withLock(fn) | Serialize this trusted host's operations; release on errors. Direct connector/human edits still do not join that lock |
| readTrusted(databaseId) | Fresh, complete trusted state and Chicago clock, exact matching databaseId, and truthful history bounds/completeness |
| readDraft(draftId, packageId) | Fresh DRAFT manifest plus every uniquely ordered chunk for that exact identity |
| readSealed(sealedId, packageId) | Fresh complete matching records; no cache hiding a completed write, duplicates or orphan receipt/chunk rows |
| appendSealed(sealedId, record) | Atomically append receipt, READY manifest and chunks in one request, with schema/size validation and typed literal cells; never overwrite/repair |

The implementation calls the host with policy targets only. It checks operator
identity before operations and again within sealing. Missing dependencies block
construction. Mocks test these contracts; they do not establish Google identity,
ACLs, actual file separation or native persistence behavior.

A timeout after sealing may mean the transaction committed. Retry with the exact
review ticket while the draft/trusted snapshot remain unchanged: the saved copy
and receipt are verified and return ALREADY_SEALED, with no new append. If the
draft changed or was deleted, use the existing sealed-copy inspection path instead
of recreating it. `readReady` remains independent of the draft after sealing.
Corrupt/duplicate stored data blocks; there is no automatic repair.

## Publication integration

Sealing does not call the publisher or monitoring. `readReady` is a read-only
inspection result; a future publication host must read it again and run the full
publisher precommit checks under the writer's lock immediately before committing.
Do not pass the result as permanent authorization to bypass current-state checks.
The existing single-workbook DEV publication entry point has not been modified to
accept an external sealed file. A reviewed two-file publication binding and native
runtime rehearsal are still required.

Positive-audience only: zero-audience review/sealing is deliberately unsupported.
Explicit no-work monitoring remains a later release requirement. History retention,
abandoned attempts and production monitoring integration are unchanged.

## Validation

25 new Node tests exercise the actual adapter, established pure publisher,
renderer and evidence validators with synthetic trusted-host IO:

- Projection/privacy and ambiguous recipient resolution, including nested values.
- Valid review/seal/read; changed draft before/after sealing; changed preference,
  audience, source pin, clock, cutoff and history completeness.
- Changed trusted operational state between validation reads; advancing time alone
  does not falsely invalidate an unchanged review.
- Missing/wrong operator identity, forged comparison digests, extra target fields,
  forbidden/duplicate targets and missing host dependencies.
- Failures before/after sealed persistence; duplicate identities, corrupt readback,
  changed sealed bytes/receipt and substituted lookup identities.
- Full selection/source/binding gate failures and read-only reconciliation of an
  actual core-planned commit without changing queue/history/ledger.

The combined Node suite passes 138 tests, including 54 established JSON-only
Python/JS parity vectors. The existing Python selection suite passes 23 tests.
These are local automated results. They are not another Apps Script runtime PASS
or evidence of actual operator permissions. CI now includes this module and test.

## Next step

Run the new standalone review-only setup, verify its native planner readback, then
inspect and seal the synthetic draft through the owner UI. The exact installation
and staged runtime checkpoints are in the [review setup guide](editorial-publisher-dev-review-install.md).
A later separate publication binding and monitored rehearsal remain outstanding;
this screen deliberately cannot publish.

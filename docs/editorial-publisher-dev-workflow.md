# DEV staging and monitoring prototype

This module is an in-memory DEV model, not a production adapter or a Google
permission boundary. It reads and writes no workbook, changes no property or
trigger, and calls no delivery or alert service. The existing DEV publisher and
its source-revision property remain unchanged. Production is left alone.

## Staging lifecycle

`adbDevDraftPackageV1` creates DRAFT chunks under 40,000 characters and an empty
digest. `adbDevSealDraftV1` validates the complete draft and returns a separate
READY copy with a canonical SHA-256 digest. `adbDevReadReadyV1` requires matching
manifest/chunk IDs, consecutive unique sequence numbers and an unchanged digest.
The existing full publisher planner still validates editorial/schema/evidence:
sealing arbitrary JSON is not approval to publish it.

These are pure transformation functions, not role-authorized endpoints. An owner
can still change a payload and recompute its digest. Separate drafting/sealing
capabilities must be enforced outside this module before any real polling or
production use. No permission checks are represented as passed.

## Monitoring lifecycle

`adbDevReduceMonitorV1` proposes state from ATTEMPT, FAILURE or COMMIT_VERIFIED
events. An attempt leaves Last Success alone. Failures retain the earliest
unresolved incident and produce at most one failure-alert intent per component
and edition date. The intent is data only; no alert is sent. Successful verified
readback clears the incident silently and uses the ledger's commit timestamp.

The real integration must supply COMMIT_VERIFIED only after verifying persisted
queue/history/ledger; a caller's ledger object is not proof of storage. Exact
event replay has no second effect; reused event IDs with changed data, conflicting
digests/ledgers and out-of-order events block. After commit, a telemetry retry
reconciles against the same ledger and never directs queue/history writes.
The integration regression exercises the existing full planner and confirms the
target state is byte-identical across monitoring recovery.

This prototype does not persist monitor state, execute alerts, implement
multi-workbook reconciliation, integrate the existing watchdog, or define durable
retention. Its event replay map is unbounded in memory and is unsuitable for a
long-running production store. Zero eligible profiles need a separate explicit
no-op monitoring outcome; no success ledger is invented for zero recipients.

## Manual DEV check

Use only the isolated DEV project (currently named Untitled project), identified
by EditorialPublisher.gs, SelectionEvidenceContract.gs, DailyNewsletterContract.gs
and DailyNewsletterRenderer.gs. Do not use ADB PROD Scripts.

1. Add one new Script file named EditorialPublisherDevWorkflow.
2. Paste the reviewed apps-script/EditorialPublisherDevWorkflow.gs source.
3. Save and run `runPublisherDevWorkflowQaV1`.
4. Expected: PASS, writes=false, emails=false, realPermissionsVerified=false.

No Advanced service, property changes, package staging, workbook updates or
trigger changes are needed. The QA uses synthetic fixed dates and objects in
memory, so it does not alter the earlier committed synthetic edition.

Local verification: all 15 new workflow tests passed, including a functional
integration with the existing publisher planner. The combined publisher,
selection-parity, preflight and workflow command passed all 81 tests and compared
54 established JSON-only evidence vectors. CI includes the new source and suite.
These fixture tests and the local runtime mock are separate from the manual Apps
Script run, which remains pending until the user's execution log arrives.

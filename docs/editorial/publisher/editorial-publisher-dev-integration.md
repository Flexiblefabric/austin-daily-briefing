# DEV publisher and monitoring integration

The opt-in wrapper `publishReadyEditorialPackageDevMonitoredV1(packageId,
attemptId)` connects the existing DEV publisher to durable monitoring. It is
source-prepared and tested under functional service mocks; it is not installed
or executed in the user's Apps Script project yet. No production file, workbook,
property, trigger or schedule is changed. The existing unmonitored entry point
remains unchanged and is not silently redirected.

## Behavior

The wrapper requires the fixed Publisher DEV workbook, DEVELOPMENT environment,
external delivery FALSE, a unique sealed READY package for the current Chicago
date and a positive expected audience. The existing publisher still owns the
source-revision, audience, content, selection-evidence, atomic target-write and
readback checks. Zero-audience monitoring is explicitly unsupported and blocked
before provisioning or publication; no synthetic success ledger is invented.

Monitoring uses separate `DEV Publisher State` and `DEV Publisher Events` tabs.
The earlier `DEV Monitor State`/`DEV Monitor Events` QA data is preserved and not
interpreted as a real publisher attempt. Monitor namespaces are fixed; neither
API accepts an arbitrary target workbook or tab names.

An attempt is saved before calling the existing DEV publisher. Each operation
acquires/releases the shared DEV ScriptLock; the wrapper never nests a lock
around the existing publisher, which acquires its own. This coordinates these
script operations, not human/connector writes or other projects.

After publication, an independent Sheets API read fetches persisted target state
and re-runs the complete planner. Only ALREADY_COMMITTED with the same digest
and a unique, correctly counted ledger allows a success event. Metadata/values
come from the Sheets API to avoid stale SpreadsheetApp post-write reads.

The attempt ID identifies a retryable operation. Retrying the same ID reuses the
stored event timestamps and requires the same package/outcome payload. The
publisher reconciles from the target ledger and never appends a second edition.
A new attempt needs a new ID. Detailed phase events are not instrumented inside
the unchanged publisher: the wrapper's commit-stage failure means its publisher
call failed, and can include a validation failure within that call.

## Ambiguous write outcomes

A publisher response can be lost after its atomic target batch succeeded. A
failure event can be recorded, but no target rollback or repair is attempted;
retrying the unchanged package lets the publisher reconcile the committed ledger.

A monitoring response can also be lost after the success event persisted. In
that ambiguous monitoring stage, the wrapper does not append a later FAILURE
that could overwrite a durable success. It throws the original error and lets
exact-event retry establish the saved outcome. If the monitoring write never
happened, state can remain Running until retry. This limitation is explicit;
there is no durable watchdog/outbox for abandoned attempts yet. Failure recording
at other stages is best effort and never hides the original exception.

No alert transport is wired. Stored failure-alert intents do not mean alerts
were sent. Retention, durable abandoned-attempt recovery, zero-audience monitoring,
separate-workbook telemetry and actual access separation remain unresolved.

## Validation and installation boundary

Eight integration regressions exercise the actual wrapper, publisher, monitor
adapters and pure contracts under functional Apps Script/Sheets mocks. They cover
first commit and replay; a lost target response; monitoring failure before and
after its write; independent target-read corruption; wrong-target rejection;
unsealed/changed/zero-audience packages; and fixed namespace isolation. They
confirm exactly one target batch and unchanged queue/history/ledger across retries.

All 106 tests in the combined publisher, evidence-parity, preflight, workflow,
persistence and integration command passed locally. The existing 54 JSON-only
evidence parity vectors also matched. This is local/mocked evidence, not a new
Apps Script runtime run.

This requires EditorialPublisherDevMonitor.gs build 0.3 and the new
EditorialPublisherDevIntegration.gs, plus the already installed DEV core and
workflow helpers. The DEV core and its source-revision property do not change.
No manual installation or publication is requested at this step. Before a
runtime integration test, prepare a fresh valid current-day synthetic package
and a separate reviewed QA target/edition window. The earlier October 28 edition
is already committed; do not bypass edition ownership, edit its sealed package,
change the source pin to force replay, delete its rows, or backdate a new run.

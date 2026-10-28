# Persistent DEV monitor QA

`apps-script/EditorialPublisherDevMonitor.gs` adds storage to the earlier pure
workflow model. Its only executable QA entry point is
`runPublisherDevMonitorPersistenceQaV1`. It is not connected to the publisher or
watchdog, sends no alert or email, and does not change production.

## Scope and persistence

The configured DEV ID must equal the fixed Publisher DEV sandbox ID
`1I9UAR6kabPt0P_lvDiJX_oskPeCVcVI64_vTbwEOF2I` before any workbook is opened.
Environment must be uniquely DEVELOPMENT and external delivery uniquely FALSE
before any write. The code creates only `DEV Monitor State` and
`DEV Monitor Events`. The existing synthetic Outbound Messages, Briefing History
and Publisher Ledger are read before and after QA and never written by this file.
The marker ledger inside the test is synthetic; no real publication is claimed.

Provisioning adds both tabs and their exact headers in one Sheets batch. Existing
tabs are never cleared or reset; partial provisioning and schema drift block.
Each new event updates one checkpoint cell and appends its journal row in one
Sheets batch while holding the DEV project's ScriptLock. Typed string values
prevent formula interpretation. A new read replays the journal and validates
every checkpoint hash and failure-alert intent. Corrupt state/journal blocks
without automatic repair.

Retrying an event after a successful write whose response was lost returns
REPLAY and does not append, advance success, or produce a second alert intent.
The QA includes an injected post-write exception and six fixed events covering
attempt, failure, repeated failure, synthetic verified commit, monitoring failure
and silent reconciliation. One failure-alert intent is stored, but alertsSent
is always zero. Actual alert delivery and exactly-once external alert transport
are not implemented or tested.

The journal is deliberately small. A 40,000-character checkpoint/cell limit
blocks before writing; no replay keys are pruned to fit. Retention, separate
monitor-workbook transactions, real commit/readback integration, zero-audience
monitoring and enforced principal permissions remain future work. ScriptLock
does not prevent humans or another project from editing the QA tabs.

## Manual instructions

Use only the existing isolated DEV project, currently named Untitled project,
with EditorialPublisher.gs and EditorialPublisherDevWorkflow.gs already installed.
Do not modify ADB PROD Scripts.

1. Add a new Script file named EditorialPublisherDevMonitor.
2. Paste the reviewed source into that new file and save.
3. Run `runPublisherDevMonitorPersistenceQaV1` manually.
4. Send the execution log. Do not create a trigger or change properties.

The existing Advanced Sheets service is required; it was already enabled for
the DEV publisher. The first successful run creates two QA tabs and saves six
events. Expected: PASS, writes=true, devBatches=7, productionWrites=false,
emails=false, persistedEvents=6, persistedFailureAlertIntents=1, alertsSent=0,
lostResponseInjected=true, exactReplay=true, silentRecovery=true and
targetRowsUnchanged=true. A repeat run reports writes=false, devBatches=0 and
lostResponseInjected=false because those exact events are already durable.

### Runtime fix, build 0.2

The first manual run on October 28 at 3:10:28 PM Central failed with "missing
monitor tab" after provisioning. Independent DEV-only connector reads confirmed
both tabs and their correct headers existed and no events/checkpoint were saved.
The original adapter used SpreadsheetApp metadata immediately after a Sheets API
addSheet batch. Build 0.2 uses the Sheets API for monitor metadata and value reads
as well as writes, avoiding that cross-service cache dependency. The functional
mock now deliberately hides the monitoring tabs from SpreadsheetApp and verifies
the adapter succeeds using API metadata. Existing tabs are reused, never reset.

On retry after this failed provisioning-only run, expect devBatches=6 rather
than 7, because the two tabs already exist. The six events still need saving.
The corrected manual run remains pending; production was not accessed.

Local validation passed all 17 persistence tests and all 98 tests in the
combined publisher/evidence/preflight/workflow/persistence suite. Tests cover
pre-write failure, post-write lost response, process restart,
journal/checkpoint/intent corruption, cell-size limits, typed atomic requests,
wrong target/environment/delivery rejection, partial provisioning, changed
headers, lost provisioning response and two complete runs of the actual adapter
under functional Apps Script/Sheets mocks. Manual Apps Script execution is
pending; passing mocks do not establish the remote workbook result.

# October 30 isolated end-to-end DEV test

Prepared October 30, 2026. Standalone build 0.4 passed in Apps Script and its stored target/monitor state was independently verified.
The October 28 runner correctly rejected the October 30 attempt at 8:12:54 AM
Central before property/workbook writes. The earlier committed edition and its
unfinished monitoring remain unchanged; its date guard was not bypassed.

New sandbox:
https://docs.google.com/spreadsheets/d/1K5iBARfGpUGdM-fKWdZANXjpsyuPcAaa-oVPy8RDNd0/edit

This is a separate copy of the synthetic DEV blueprint, not a copy of production.
Only this new copy was reset and prepared. Its queue/history/ledger are empty,
the subscriber is SYNTHETIC at publisher-qa@example.invalid, and external
delivery is FALSE. Its READY package is E2E-2026-10-30, with digest:
1ef0368ef0fe2358e1755467c0914e212c9793741992a145fa950dab835ca048.
No real subscriber data, alert transport or production capability is introduced.

## Installation

1. Open https://script.google.com/home and click New project. Name the new
   standalone project ADB E2E DEV OCT30 CLEAN. Do not use the workbook's
   Extensions → Apps Script menu; a native workbook copy can inherit a script.
2. Replace the new project's default Code.gs contents with the complete current
   apps-script/EditorialPublisherEndToEndQa.gs bundle. Install no other files.
3. Add the Advanced Google Sheets service, identifier Sheets.
4. Save and run runPublisherDevEndToEndQaV1 once. Send the execution log.

The runner sets its two DEV properties only in this new standalone project and
opens the fixed prepared sandbox ID directly. It rejects any bound project,
dispatcher code, triggers or conflicting configuration. The
fixture must run on October 30 in America/Chicago. The expiry check remains
strict and occurs before any property or target/monitor write.

Expected: PASS, build ADB-PUBLISHER-E2E-DEV-0.4, publicationResults
[COMMITTED, ALREADY_COMMITTED], queueRows 1, historyRows 6, ledgerRows 1,
monitorEvents 2, monitorStatus Healthy, lostMonitorResponseInjected true,
exactReplay true, productionWrites false, emails false and alertsSent 0.
An entire second run is idempotent and does not inject another lost response.

The batched snapshot implementation is unchanged: local request accounting
remains 27 reads for a fresh run and 21 for replay. State snapshots refresh
at validation/pre-commit/readback boundaries; monitoring reads refresh per event.
No quota increase, production edit or clock/date bypass is needed.

## Repeatable preparation and evidence

docs/editorial-publisher-e2e-config.json is the single source of the isolated
database ID, edition date and reviewed core-logic revision. The builder substitutes
these into the runner template and emits the bundle, fixture and source manifest.
Synthetic source/cutoff/history dates shift together; Chicago timestamp offsets
are recalculated for the selected date, including daylight saving changes.
The core publication/evidence/rendering logic remains based on DEV 0.2 revision
a1fe5514f362719c0e379ccb2276d7df3492737a; only the previously documented E2E IO
adaptations are bundled.

The integration suite verifies the full generated bundle and replay, quota
recovery, changed-preference rejection, fixed binding, source hashes and fixture
digest. A new expiry regression confirms an incorrect Chicago day leaves all
properties and workbook contents untouched. All 113 combined local tests pass.
Independent connector readback confirmed empty queue/history/ledger and exact
staged package bytes/digest in the new workbook. Remote PASS is not yet claimed.
Permissions, actual alerts, production rollout, retention and abandoned-attempt
watchdogs remain outside this synthetic test.

## Standalone installation correction

On October 30 the user showed that Extensions → Apps Script from the copied
workbook opens Editorial DEV with the inherited module files. The original
installation instructions incorrectly assumed that a native workbook copy
would have a blank bound script. The bound-project route is superseded above.
The binding diagnostic also showed an earlier script attached to the October
28 sandbox, while its bundle constants targeted October 30. Those attempts
failed before writes.

Build 0.4 explicitly requires a clean standalone project, while retaining the
fixed database ID, strict date/environment checks, synthetic-only recipient,
no-trigger requirement and existing-configuration guard. No workbook needs
replacing and no inherited source files need deleting. The same prepared
October 30 sandbox is reused; runtime build 0.4 subsequently passed as recorded below. The complete
bundle passes the standalone bootstrap/replay test, while inherited bound
projects, conflicting settings, dispatcher code and triggers are rejected
before any writes. Mock request counts remain 27 fresh and 21 replay.

## Runtime PASS and independent readback

The user supplied the standalone Apps Script log for October 30, 2026:
execution started 8:40:13 AM Central and completed 8:40:24 AM. Build
ADB-PUBLISHER-E2E-DEV-0.4 returned PASS, publicationResults
[COMMITTED, ALREADY_COMMITTED], queueRows=1, historyRows=6, ledgerRows=1,
monitorEvents=2, monitorStatus=Healthy, lostMonitorResponseInjected=true,
exactReplay=true, productionWrites=false, emails=false, alertsSent=0 and
realPermissionsVerified=false. This is a fresh runtime commit followed by an
exact replay, including recovery after an intentionally lost monitoring response.

Independent connector readback confirmed exactly one Queued message, six Pending
history rows, one ledger row and two monitoring events. Provider fields are
empty, neither monitoring event contains a failure-alert intent, status is
Healthy, stage is complete and no incident is unresolved. The ledger digest is
1ef0368ef0fe2358e1755467c0914e212c9793741992a145fa950dab835ca048 and both
Committed At and monitoring Last Success equal 2026-10-30T13:40:18.261Z.

This completes the isolated DEV end-to-end validation milestone for the editorial
handoff, atomic writer, durable monitoring and replay integration. No additional
manual run is needed for this fixture. Production remains unchanged and no
merge, generator/task cutover, transport send or publisher activation occurred.
Real capability separation, production write/monitoring integration, retention,
zero-audience monitoring and abandoned-attempt recovery remain rollout work;
this PASS does not clear those gates.

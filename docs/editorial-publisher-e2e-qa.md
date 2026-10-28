# Isolated end-to-end DEV runtime check

Prepared October 28, 2026. Runtime execution is pending. The new workbook is:
https://docs.google.com/spreadsheets/d/1XZCcNUCSkCU68HY9DMgjbyKgQRXDGkVjf0Q3uz1QXrY/edit

It is a separate native copy of the synthetic Publisher DEV blueprint. Only the
new copy was edited: copied queue/history/ledger values and old staging were
cleared, the old monitoring QA tabs removed, and a newly dated synthetic READY
package staged. The original DEV workbook and production were not modified.
The subscriber remains SYNTHETIC at publisher-qa@example.invalid. No live news,
recipient data, external delivery or permission-separation claim belongs to QA.

The fresh package E2E-2026-10-28 uses the reviewed DEV 0.2 core-logic revision
a1fe5514f362719c0e379ccb2276d7df3492737a. It shifts fixture timestamps/history
window consistently to October 28 and has canonical SHA-256:
8dc4fa15873a7c35b10fb6a6b86fadbfcb702961bca31748f668aa1e4ca8a1b8.
Connector readback confirmed its exact bytes/digest, empty target tables,
DEVELOPMENT, external delivery FALSE and QA Purpose ISOLATED_E2E. Sealing is an
operator action in this test, not proof that draft/READY principals are separated.

## One-file installation

1. Open the new workbook above; choose Extensions → Apps Script. Use that new
   bound project, not either existing project. Name it ADB E2E DEV.
2. Replace its default Code.gs contents with the entire generated
   apps-script/EditorialPublisherEndToEndQa.gs file. Install no other source files;
   the bundle already includes the seven required modules and runner.
3. Add the Advanced Google Sheets service (identifier Sheets).
4. Save and select runPublisherDevEndToEndQaV1, then Run. Send the execution log.

The runner rejects a different bound workbook, dispatcher code, triggers,
non-synthetic audience, wrong environment, conflicting existing configuration,
or an expired fixture. It sets two properties only in this new bound project:
the isolated DEV ID and reviewed core source revision. Existing project
properties/triggers remain unchanged. No manual property edits are needed.

The first run commits one queue row, six history rows and one ledger row through
the existing atomic publisher, then persists monitoring success. It injects an
exception AFTER that monitoring success write, retries the same attempt/package,
and requires ALREADY_COMMITTED plus an exact monitoring replay. Expected PASS,
publicationResults [COMMITTED, ALREADY_COMMITTED], target counts 1/6/1,
monitorEvents 2, monitorStatus Healthy, lostMonitorResponseInjected true,
exactReplay true, productionWrites false, emails false and alertsSent 0.

An entire repeated QA run adds no rows and reports lostMonitorResponseInjected
false. Fixed replay IDs/timestamps are preserved. The fixture is valid only on
October 28 in Chicago; after that, prepare a new isolated fixture rather than
changing the clock, bypassing current-day checks or clearing committed rows.

## Reproducible source

scripts/build_publisher_e2e_qa.py emits the bundle, synthetic package JSON and
source manifest. Seven module sources were compared with the reviewed branch.
The monitor's fixed DATABASE constant is replaced for the isolated target, and
the core table-reader function delegates to a fresh Sheets API reader in the QA
runner. This prevents stale pre-commit SpreadsheetApp values from affecting the
test. Publication, selection, rendering and replay logic remain unchanged.
These are explicit QA-bundle transformations, not changes to the existing DEV
project. The manifest records each
module and runner hash. The generated single-file bundle is compiled/executed
under functional Apps Script/Sheets mocks, including a blank-project bootstrap,
actual atomic publisher and monitor adapters, lost monitoring response and replay.
Wrong original-DEV/production bindings are rejected before setup writes.

This local validation does not replace the user's Apps Script execution log.
All 109 local tests passed after the fresh-reader adjustment, including the
generated bundle with SpreadsheetApp value reads deliberately disabled. The
verification facade now also exposes its fixed spreadsheet ID for that reader.
Production migration, alerts, durable retention, abandoned-attempt watchdogs,
zero-audience monitoring and real capability separation remain outside this QA.

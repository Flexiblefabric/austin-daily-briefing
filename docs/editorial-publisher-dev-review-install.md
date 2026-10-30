# DEV review screen: setup and runtime check

Prepared October 30, 2026. This is a synthetic review/sealing rehearsal, not a
production deployment. Local automated checks pass; actual Apps Script identity,
file creation, UI rendering and sealing still require the operator runtime check.
The seed is dated October 30 in America/Chicago. Running setup on a later day
stops before creating files; rebuild the dated fixture/bundle instead of changing
the guard or backdating the clock.

## Files to install

Use one **new standalone** Apps Script project from https://script.google.com/home.
Do not open Extensions → Apps Script from a workbook, reuse Editorial DEV, paste
into ADB PROD Scripts, or install separate copies of the bundled modules.

1. Create a new project named **ADB REVIEW DEV**.
2. Replace its sole Code.gs contents with the complete generated file
   [EditorialPublisherDevReviewBundle.gs](../apps-script/EditorialPublisherDevReviewBundle.gs).
3. Add one HTML file named **EditorialPublisherDevReview** (Apps Script adds the
   .html extension), using the complete contents of
   [EditorialPublisherDevReview.html](../apps-script/EditorialPublisherDevReview.html).
4. Under Services, add **Google Sheets API**, identifier **Sheets**. Save.
5. Select **setupDevEditorialReviewV1** and run it once. Authorize the requested
   Sheets, identity and script-trigger inspection access for this new project.
   Do not run any legacy publication or dispatch function.

No manual file IDs or script properties are needed. Setup creates three NEW
synthetic files: database, draft inbox and sealed staging. It writes its own new
project's configuration and independently reads the files back through the full
planner. It does not copy old workbooks or their bound scripts. All API cell data
is written as literal typed values. No sharing change, trigger, email, alert or
queue/history/ledger publication is performed.

Expected execution-log report:

- result: READY_FOR_REVIEW
- createdFiles: 3
- packageId: REVIEW-2026-10-30
- sealed: false; published: false
- productionWrites: false; emails: false; alertsSent: 0
- realPermissionsVerified: false

The report contains the three newly created file URLs. Preserve it. If setup
fails or its response is lost, **do not rerun setup or clear its properties**.
The started marker prevents duplicate file creation; any returned file IDs are
preserved for inspection. A partial creation is not automatically deleted or
recreated. Report the error before taking the next step.

First checkpoint: verify READY_FOR_REVIEW before deploying the screen.

## Open the owner review screen after setup succeeds

1. Deploy → New deployment → Web app.
2. Execute as **User accessing the web app** and restrict access to **Only myself**.
   If this combination is unavailable, stop and report the options; do not widen
   access or use an anonymous deployment to make it work.
3. Open the deployment URL while signed into the same Google account used for
   setup. An unavailable or mismatched active/effective identity stops access;
   the code does not fall back to trusting a client-supplied identity.
4. Enter **REVIEW-2026-10-30** and choose **Load review**.

You should see edition date, audience count 1, validation-at-load status and
history bounds first. The newsletter preview and reader selector follow, then
expandable selection/source/prior-fact evidence and trusted input details.
Fingerprints identify the source revision, exact package, snapshot and preview.

Check the screen on desktop and phone. The preview uses an empty iframe sandbox
and a restrictive content policy; remote images/fonts are blocked in the preview.
Source URLs remain available as text in the evidence. This app does not fetch or
verify the underlying source passages on your behalf. Browser visual verification
was unavailable locally and remains part of this runtime checkpoint.

## Seal only the reviewed synthetic version

After inspecting the preview and evidence, check **I reviewed this version and its
personalized selections**, then choose **Approve and seal**. Loading alone does
not approve anything. The server rechecks the draft, trusted inputs, configured
operator and sealed-store state before its single transaction.

Expected message: **Reviewed version sealed successfully**, plus the digest and
**Publication has not been started**. An exact retry may instead say the version
was already sealed; it must not create another manifest/chunk set/receipt.

The sealed file should have one READY manifest, its complete chunk set, and one
DEV Package Reviews receipt. Database queue/history/ledger remain empty. No email
or alert is sent. If a stale-review or readback error occurs, do not edit a digest
or status to force a pass. Load a fresh review or inspect the uncertain saved
result first.

## What this does and does not establish

Prepared code: native Sheets IO, authenticated operator checks, one-time fresh
file setup, review UI, atomic sealed-file persistence, independent readback and
explicit retry behavior. The generated review bundle intentionally omits the
existing publication entry point; it cannot start publication from this screen.
A future separate writer binding must revalidate inside its own commit lock.

This is not proof of Google ACL separation from the current drafting connection.
The three files are created by the operator without sharing changes. The host's
Sheets OAuth permission can reach other account-accessible spreadsheets, while
this code restricts its configured targets and allowed writes. Automatic
production permission gates remain unresolved. Broad connector capabilities,
real ACLs and deployment identity have not been declared PASS by these tests.

The owner approved the review-screen defaults: edition/audience/validation and
preview first; attention to repeat/material-update evidence, sources and personal
selections; explicit version-bound seal; fresh review on change; separate
publication. This approval is recorded as a design decision, not approval of an
actual editorial package or a production cutover.

## Validation and reproducibility

Combined local Node suite: **161 passed, 1 browser-only test skipped**, including
22 native-host/setup tests and a UI-handler test. The browser test could not run
under the local process restrictions; it has not been reported as passing.
Existing Python selection suite: 23 passed in the preceding implementation check;
this change does not modify Python selection logic. Native host tests mock Google
APIs, and use actual adapter/planner/renderer code and simulated before/after
write failures. They are not an Apps Script runtime result.

Build with `python scripts/build_publisher_dev_review.py`. The builder reads the
reviewed E2E synthetic fixture and removes the publication entry point from the
core before concatenating the review-only sources. CI checks reproducibility and
runs the new host/UI tests. Keep the old successful E2E bundle unchanged.

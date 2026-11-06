# November 6 DEV publication from the reviewed sealed store

Updated November 6, 2026. Native publication and exact replay have now passed,
with independent connector readback. This completes the positive-audience supervised
DEV workflow from draft through review, seal, publication and verified monitoring.
The installation steps below are historical instructions; no further rerun or
setup is required for this committed fixture. Production release gates remain in force.

## Operator update in the existing ADB REVIEW DEV project

Use the same standalone project that holds the completed November 6 review. Keep
its Script Properties, Advanced Sheets service and three existing DEV files.
There is no new setup, file copy, property edit or reseal operation.

1. Replace the complete Code.gs contents with
   [EditorialPublisherDevOperatorBundle.gs](../apps-script/EditorialPublisherDevOperatorBundle.gs).
   This combines the updated review host and manual publication add-on once.
   Do not add it alongside separate copies of those bundled modules.
2. Replace the complete EditorialPublisherDevReview.html contents with the
   [updated HTML](../apps-script/EditorialPublisherDevReview.html). Save both files.
3. To check branding at the existing web app URL, choose Deploy → Manage
   deployments, select the existing DEV deployment, click Edit, select a new
   version and deploy it. Preserve its current private access/execution settings.
   A head/test URL ending in /dev uses the saved code after the first deployment
   already exists. Do not create a public or anonymous deployment.
4. Reload REVIEW-2026-11-06 and inspect the masthead/footer images. This is a
   preview-only update; rendering code, editorial JSON and review fingerprints
   are unchanged. The existing sealed copy does not require another approval.
5. In the Apps Script editor, select **runDevReviewedPublicationV1** and Run.
   This is the separate explicit publication action. It writes ONLY the fixed
   synthetic DEV database and publisher-monitor tabs described below.

Do not run setupDevEditorialReviewV1 again, clear properties, reset target tables,
or replace a successful ledger to make a retry possible. The action has a strict
November 6 Chicago-date guard. If another day has started, prepare a fresh dated
rehearsal; do not backdate or weaken the clock check.

Expected first successful log:

- build: ADB-DEV-SEALED-PUBLICATION-0.1
- packageId: REVIEW-2026-11-06
- publication: COMMITTED
- monitoring: SUCCESS
- profiles: 1; historyRows: 6
- digest: c067eab49660725828880a2c5069e5ecae0124f9ccdcb9225d546fd0cc5b5b18
- productionWrites: false; emails: false; alertsSent: 0
- realPermissionsVerified: false

After that succeeds, run the same function once more. Expected publication:
ALREADY_COMMITTED; monitoring: REPLAY. Target remains 1 queue row, 6 Pending
history rows and 1 ledger, with two successful monitoring events ending Healthy.
No second queue/history/ledger transaction or monitor event is appended.

If a run errors, preserve its log and existing files. A timeout may have followed
a successful commit. Inspect its ledger/monitor state or use an exact safe retry
when diagnosed; never regenerate or delete records blindly. Readback corruption
or a changed sealed input must be inspected rather than repaired automatically.

## Fixed targets and boundaries

The code requires the exact configured tuple:

| Role | Fixed spreadsheet ID |
| --- | --- |
| DATABASE | 1ognA5DqMxwYN9C11UDEHhPvb79OQ09FSjhdPde1fn7s |
| DRAFT | 1Fuf0vja1GVZYl7WavDyBay_sPmjOoGeXA286H9wfD4k |
| SEALED | 1QvW2aVF7BCdTr-mnlfHTG6Z_NpiSiCSPK7AcjFBvrYQ |

The manual action takes no arguments, accepts no destination URL and rechecks
active/effective operator identity. It refuses a bound project, dispatcher,
triggers, an alternate tuple or an expired edition before accessing targets.
All files retain their isolated DEV role/environment/external-delivery gates.
The stored receipt and exact sealed payload must independently validate against
current trusted inputs. The separate draft is not a publication input.

The only writes are:

- One atomic append of Outbound Messages, Briefing History and Publisher Ledger.
- DEV Publisher State and DEV Publisher Events: provision together if absent,
  then atomically update checkpoint and append each journal event.

The sealer file, receipt and draft are not modified by publication. There is no
transport, email/alert sender, trigger or property update in this action. The
review screen still has no publication control. The combined operator bundle
contains a callable operator-authenticated manual action; the original review-only
bundle continues to omit that action.

## Validation and recovery design

One ScriptLock serializes this project's complete manual attempt. Host dependency
injection avoids nested lock acquisition. It does not coordinate direct connector
or human writes; fresh comparisons are checks, not a Sheets compare-and-swap.

Each validation phase reads fresh trusted database values and reads sealed
staging twice. Phase-local snapshots are discarded before the next phase. The
publisher compares complete operational state, history metadata, sheet IDs and
sealed receipt/package before committing. It uses the established pure planner,
selection validators, renderer and independent payload validation unchanged.

ATTEMPT is durable before the target commit. Independent fresh target readback
must produce ALREADY_COMMITTED with the exact digest, unchanged receipt and
matching unique ledger counts before COMMIT_VERIFIED can set Healthy. The core
ledger remains the authority if a response is lost. Retry event IDs are stable
and reuse saved timestamps, so an exact retry appends nothing.

An uncertain success-monitor response does not append a false FAILURE. Failures
before verified monitoring use the established failure-intent suppression and
silent recovery reducer. These are persisted intents only; no actual alert sends
are wired. Other failures cannot roll back or requeue an existing committed
edition. Zero-audience monitoring, retention and abandoned attempts remain later
release requirements; this rehearsal is positive-audience only.

## Branding preview change

The iframe still blocks scripts, forms and other remote images/fonts. Its image
policy now permits only data images plus the two exact fixed ADB brand asset
URLs already used by the renderer: adb-masthead@2x.png and
adb-mark-reversed@2x.png. Both public PNG assets were fetched and identified as
valid PNGs during preparation. No change to newsletter HTML generation or the
sealed package was made. Visual confirmation in the updated deployed preview is
still required. It is not proof of image loading in every email client.

## Automated evidence

174 Node checks pass; the browser-only check remains skipped in the standard run.
The attempted headless browser launch was blocked by local socket/process
restrictions, so no new browser visual PASS is claimed. The UI handler check
validates the exact brand-image allowlist, explicit sealing and stale-review
reset. The existing Python selection suite passes 23 tests.

12 additional publication tests execute the actual generated add-on, native
review host, planner and monitor coordinator with Google API mocks. They cover:

- A fresh commit and exact replay, preserving sealed/draft data.
- Lost responses before/after target write and before/after success-monitor write.
- Changed preferences and altered receipt before commit.
- Post-commit payload corruption: no Healthy, no repair and no duplicate write.
- Unsealed/tampered inputs; wrong principal/target/date; partial monitor
  provisioning and schema corruption without resets.
- Reproducible add-on/combined bundle, and no publication button in the review UI.

Measured mock API reads: first publication 31, replay 23 (54 combined, below the
60-per-user/project/minute budget). Earlier review/sealing operations are excluded
from those per-publication measurements. Actual runtime quotas/latency remain to
be observed. Builders:

- python scripts/build_publisher_dev_review.py
- python scripts/build_publisher_dev_publication.py

Historical evidence: [native review/seal checkpoint](editorial-publisher-dev-review-2026-11-06.md).
Official deployment instructions checked November 6:
https://developers.google.com/apps-script/concepts/deployments

The eventual production adapter, dispatcher colocation, real history completeness,
monitoring lifecycle/retention and enforced access boundaries are not cleared by
this DEV implementation or its pending native rehearsal.

## Actual native execution and independent replay evidence

Installed operator source: d9ed337020dfcab791957d7b10b876edba81c5fb.
The operator supplied two Apps Script execution logs:

| Run | Central time, November 6 | Publication | Monitoring |
| --- | --- | --- | --- |
| First | 10:47:43–10:47:52 AM | COMMITTED | SUCCESS |
| Exact replay | 10:49:25–10:49:30 AM | ALREADY_COMMITTED | REPLAY |

Both reported the expected package/digest/run ID, profiles=1, historyRows=6,
productionWrites=false, emails=false, alertsSent=0 and
realPermissionsVerified=false. Persisted target commit timestamp:
2026-11-06T16:47:49.358Z (10:47:49 AM Central).

Independent Google Sheets connector reads before and after the replay confirmed:

| Target | Persisted result |
| --- | --- |
| Outbound Messages | Exactly 1 Queued message for synthetic@example.invalid; provider field blank |
| Briefing History | Exactly 6 Pending rows; provider message IDs blank |
| Publisher Ledger | Exactly 1 ledger with the reviewed digest and counts 1 / 6 |
| DEV Publisher Events | Exactly 2 events; no failure alert intents |
| DEV Publisher State | Healthy, incident=null; Last Success equals the original ledger commit time |

The complete returned values in all five rectangles were identical before and
after replay, including message/history payloads, ledger timestamp, checkpoint and
journal. Thus this native replay appended no records and did not rewrite monitor
success time. The monitor journal/checkpoint hashes were also independently
replayed with the existing pure validator and passed.

Metadata confirmed the 100-row target grids, 10-row state grid and 1000-row event
grid. Reads covered all populated target columns across those full small grids,
so later duplicate/orphan positions were included. No connector writes occurred.
This evidence concerns only the fixed synthetic DEV database above.

The masthead allowlist fix is implemented and its assets fetched successfully,
but a screenshot of the updated deployed branding has not yet been supplied.
Do not mark full desktop/mobile visual approval complete. Native other-identity
denial, tamper/stale-review failure demonstrations and lost-response injection
remain covered by local automated tests rather than newly executed native cases.
No production ACL/capability attestation, full history normalization, zero-audience
monitoring, durable retention or production cutover is established by this PASS.

Preserve this committed fixture and its sealed review as historical evidence.
No additional run of setup or publication is required for the completed milestone.

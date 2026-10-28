# Option A — editorial handoff and deterministic publisher

Status as of October 28, 2026, America/Chicago: **phase 1 contract defined; phase 2 DEV source installed, with setup, synthetic commit, replay and four rejection checks passed in Apps Script. Broader rollout gates remain open; not production active.**

Private DEV workbook: https://docs.google.com/spreadsheets/d/1I9UAR6kabPt0P_lvDiJX_oskPeCVcVI64_vTbwEOF2I/edit?usp=drivesdk

The source baseline is `57f028105dd9450b95c519ee33ef8d3382c98b77`. The sandbox contains only synthetic QA data: one READY package, one Queued message, six Pending history rows and one commit ledger row. No real subscriber data or recorded sends are present. Production generation, its scheduler prompt, dispatch, queue, history and monitoring were not changed by this work.

## Phase 1: editorial handoff

`editorial-handoff.schema.json` defines `ADB-EDITORIAL-HANDOFF-1`. One package covers one Chicago edition date and its entire eligible audience. Editorial generation supplies approved structured articles, per-profile editorial payloads, selection evidence, personalization snapshots, a verified source revision and an expected profile count. It supplies no queue status, provider IDs, operational timestamps, HTML/plain-text payloads, positional row arrays or message identifiers. Source-access timestamps and editorial cutoff remain part of the editorial evidence.

The writer derives run ID `YYYY-MM-DD-publisher-v1`, unique edition key `daily:YYYY-MM-DD`, and message ID `DAILY-LIVE:[Profile ID]:[Run ID]`. `selection_bundle.run_id` must match that derived run. `editions[].bindings` maps every rendered section/index to exactly one selection-evidence key and editorial category; no unseen history rows or untracked rendered items are allowed. Source destinations must match the evidence. Only More for You may vary among profile editions; the shared core must be identical.

Personalization is checked against saved DEV data immediately before commit, including volume, topic preferences, summary style and Why It Matters length. Mechanical checks establish the snapshot and selection rules; editorial review still decides whether prose reflects the intended depth and whether source claims are true. The package's `published_history` must exactly match the writer's independently read normalized Sent history. Legacy history without structured facts fails closed and needs an explicit migration decision before production support.

All editorial envelopes are JSON-only at handoff. The writer serializes them and appends exactly ` Awaiting Resend dispatcher delivery.`. Caller-provided delivery prose is rejected. This removes the October 27 missing-suffix failure mode. Queue `Queued`, history `Pending`, fixed schemas and transport template `DAILY_BRIEFING_V1` are constants.

### Private staging layout

`Packages` uses `Package ID | State | Chunk Count | Package SHA-256`.
`Package Chunks` uses `Package ID | Sequence | JSON`.

Keep JSON chunks below 40,000 characters each, numbered consecutively from 1. The digest is SHA-256 over `adbPublisherCanonical_(JSON.parse(joinedChunks))`, UTF-8 encoded; object keys are sorted recursively and array order is preserved. A sealed READY manifest must match the package bytes both before validation and immediately before the target commit. Missing/duplicated chunks, changed digests and duplicate manifests block publication.

Drafting identity owns only DRAFT input. Before enabling a polling workflow, a distinct operator/publisher identity must seal READY packages and enforce write restrictions for READY manifests/chunks and all operational tables. A digest detects edits but is not an access-control boundary when one identity can edit both payload and digest. The current private, owner-only DEV workbook does not claim that production permission separation has been implemented. No automatic READY transition or polling trigger is installed in phases 1–2.

The zero-recipient path returns `NO_ELIGIBLE_PROFILES` with no queue/history/ledger write and requires empty profile/row evidence. It does not invent a context carrier or send an email.

## Phase 2: writer implementation

`apps-script/EditorialPublisher.gs` exposes `publishReadyEditorialPackageDevV1(packageId)`. It uses the existing pure JS renderer, the independently approved `DailyNewsletterContract.gs` payload validator and a JS evidence gate in `SelectionEvidenceContract.gs`. It validates the whole proposed audience and all content before writing anything.

The writer rejects schema drift, duplicate or ambiguous subscriber/profile identities, Admin Status other than OK, missing/inactive daily template, stale source revision, stale date, changed preferences/history, Off-topic MFY, score or material-update violations, missing UTR research, and mismatched rendered/history bindings. New release notices remain blocked until their distinct eligibility policy is implemented; do not bypass that gate by putting notices in another field.

One target Sheets `batchUpdate` appends queue, history and the publisher ledger together. Values use typed `stringValue`/`numberValue`, so leading `=` is data rather than a formula. The request is measured in UTF-8 bytes and rejected at 1.8 MB; never split a package into partial commits to evade this bound. The target ledger is the completion authority: a timeout after a successful commit can be reconciled by rerunning the same package. Exact replay returns `ALREADY_COMMITTED`; another digest for the same edition or a partial prior state blocks without repair or append. Readback checks persisted payloads, identities and exact evidence.

The Apps Script lock coordinates this publisher project. It does not isolate other Apps Script projects or human edits. Fresh eligibility/schema/data reads reduce races; Sheets does not provide a transactional compare-and-swap for those reads. Production promotion needs a single writer owner, coordinated locks where possible, protected operational ranges and the existing dispatcher eligibility recheck. DEV has external delivery disabled and this module has no mail/provider API or trigger installer.

### Installation procedure and remaining runtime QA

1. Review the source change, then install the exact reviewed versions of `EditorialPublisher.gs`, `SelectionEvidenceContract.gs`, `DailyNewsletterContract.gs`, and `scripts/daily_newsletter_renderer.js` (as an Apps Script `.gs` file) in an isolated DEV project.
2. Enable the Advanced Sheets service. Set `ADB_PUBLISHER_DEV_DATABASE_ID` to the private publisher sandbox ID above and `ADB_PUBLISHER_SOURCE_REVISION` to the reviewed source commit. These are configuration names, not secrets. Never target either production workbook. Verify environment DEVELOPMENT and external delivery FALSE.
3. Use synthetic reserved-domain identities only. Seed matching Subscribers, Profiles, Preferences and Active DEVELOPMENT template. Keep production data out of this workbook. Read the fixture generator for package shape; generate a fresh-date synthetic package, never a live-news issue from fixtures.
4. Verify source digests and Apps Script V8 support, including `Intl` Chicago offset handling. Stage DRAFT chunks; seal a READY manifest using the canonical digest. Run the DEV entry point manually. Inspect one atomic queue/history/ledger result and readback, then replay and require zero additional rows.
5. Test changed package rejection, missing chunk, blocked schema, paused/held recipient, changed personalization, size limit and simulated interrupted response. Record actual runtime evidence separately from offline test results.

The connected Drive tools do not install or execute Apps Script source. The operator installed the reviewed files and ran the setup, commit/replay and rejection functions in Apps Script. Live workbook readback confirms the committed synthetic records and matching package digest. See [October 28 runtime evidence](editorial-publisher-dev-runtime-2026-10-28.md). Size-limit, concurrency, permission, and broader rollout checks remain open. No production scheduler/prompt change, production deployment, trigger, permission cutover or message send was performed.

## Offline verification

Run from repository root:

```sh
node --test tests/editorial-publisher.test.js tests/selection-evidence-parity.test.js
python -m unittest discover -s scripts -p test_selection_notes.py
```

The publisher suite covers deterministic payload/schema construction, note suffixes, readback corruption, exact replay, changed-package conflict, partial state, source/audience/preferences/history/schema gates, zero recipients and a functional Apps Script adapter mock. The mock exercises a single atomic request plus successful-response and lost-response reconciliation. It is not a live Google Apps Script test.

The JS selection gate agrees with 54 JSON-only vectors captured from the established Python selection regression suite. Two deliberate format distinctions are excluded: transport-suffixed notes are invalid as handoff input, and JavaScript/JSON Schema treat mathematically integral numbers as integers even if their original JSON spelling used `.0`; Python distinguishes integer and float runtime types. No live evidence was backfilled and no failed production edition was replayed.

## Remaining rollout work

Remaining runtime QA beyond the passed checks; measured full-audience size and execution time; permission separation and immutable READY enforcement; production legacy-history normalization; approved release-notice eligibility; operational error/result recording; and a controlled shadow comparison precede a separate production adapter and generator/publisher cutover. Existing Resend dispatch remains the sole delivery owner. These limitations are recorded explicitly so a source implementation is never mistaken for a live migration.

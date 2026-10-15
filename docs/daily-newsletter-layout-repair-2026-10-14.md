# October 14, 2026 — Daily newsletter layout incident repair

**Incident:** #114. **Contract:** `ADB-DAILY-HTML-1.0`. **Scope:** Generated daily HTML/plain-text payload and Resend daily dispatcher. No change to subscriber eligibility, queue identifiers, token handling, or the welcome dispatcher.

## Confirmed failure boundary

The original delivered email contains five shared stories **before** the masthead and the 620px newsletter reading frame; the top-story cell is centered, headlines lose the approved editorial serif and publisher links lose Link Red. These errors are present in sent HTML and are not caused by PDF rendering or the Resend API. The existing static-component QA validator does not test live generated HTML.

## Repair

1. `apps-script/DailyNewsletterContract.gs`: pure JS structural contract. It examines the real HTML for canonical masthead/date/Pulse/Weather/story order, approved table nesting, noncentered story cells, serif headings, Why It Matters, Under the Radar, source-link styling, and footer/Customize presence.
2. `apps-script/ResendTransport.gs`: fail-closed batch preflight **before any Resend handoff**. If any queued daily payload is invalid, **all Queued daily rows in that batch** and their matching Pending history rows are marked Failed; the entire batch stops before any handoff. Do not modify already Sent rows. A persistent blocked-Run-ID marker prevents a later hourly pass from releasing surviving queued rows after an interrupted failure update. Missing contract file stops dispatch without changing queue.
3. `scripts/daily_newsletter_renderer.js`: pure JavaScript deterministic renderer for the connected-tool execution environment. It constructs branded HTML/plain text from policy-vetted editorial JSON; `apps-script/DailyNewsletterContract.gs` validates the exact output. `scripts/render_daily_newsletter.py` and `scripts/validate_daily_newsletter.js` remain offline CI comparators, not dependencies of scheduled delivery.
4. `docs/automation-prompts/austin-daily-briefing.md`: generation must produce structured JSON and use the deterministic JavaScript renderer, tested directly in a connected-tool execution. `design/newsletter-renderer-qa.html` remains the controlled visual reference, not an editorial source. A renderer/validator failure stops writes.
5. `tests/daily-newsletter-contract.test.js`, `tests/daily-newsletter-code-mode.test.js`, `tests/fixtures/daily-newsletter-example.json` and CI: negative HTML/text controls, JavaScript renderer variants, simulated dispatcher batch protection, Python offline comparison and structured acceptance.

## Historical production-body audit (read-only, October 14)

Using Google Sheets Outbound Messages HTML/plain text columns without displaying recipient identifiers, and the proposed exact ADB-DAILY-HTML-1.0 contract:
- October 13: **13/13 Sent editions fail** the new contract; prominent differences include missing explicit Featured Top Story section and nonstandard headline styling.
- October 14: **13/13 Sent editions fail** the contract; differences include missing Top Stories section label, frame and alignment defects, nonstandard headline/source-link styling.
- In both cases the normal production queue/history remained untouched. These are retrospective validation findings, not evidence that Resend altered HTML.
- Enabling ENFORCE before a compliant generator is ready would reject normal live batches; do not activate it as a substitute for generator integration.

## Interactive connector execution proof (not scheduled-runtime proof)

A pure JavaScript version of the renderer was fetched from the branch commit with the connected GitHub contents tool and run in connected-tool JavaScript without Python or Node. It built an HTML/plain text pair from the production-shaped synthetic JSON fixture, and the shared Apps Script contract passed (5 publisher source links, 15 link destinations). The interactive test made **zero** production writes and external send calls.

**Scheduled capability probe:** One-time task `ADB Renderer Capability Probe` ran and completed on 2026-10-14 America/Chicago, was automatically disabled afterward, and the operator supplied its result link and confirmed 'compatibility requirements satisfied'. Treat this as an operator-confirmed scheduled compatibility PASS; the detailed shared task output was not independently retrievable through connected tools in this review. Do not treat this probe as controlled mailbox or queue-delivery acceptance.

## Controlled received-email visual acceptance (Oct 14, 2026)

The operator confirmed receipt of the one-recipient synthetic Resend edition (HTTP 200 acceptance, recipientCount=1, zero queue/history writes). Submitted screenshots and a four-page Gmail print/PDF show the brand masthead, date, Pulse, Weather, Featured Top Story, other Top Stories, Under the Radar, More for You, Austin Ahead, and footer in the approved sequence. Serif headlines, left-aligned story copy, underlined red publisher links, red-rule Why It Matters fields, Under the Radar red-top header, and footer brand are visually present. Operator reports that the received email looks appropriate on iPhone in both light and dark mode.

**Acceptance scope:** Gmail desktop PDF and operator-observed iPhone light/dark rendering PASS. No evidence yet for Outlook/Yahoo-specific rendering, click-through testing, or fully populated live-source personalization. The **synthetic** fixture's footer.manageUrl uses an example.org placeholder, so this test must NOT be cited as production management-link validation. Live generator must independently insert/verify the approved production Manage URL.

After operator deletes the temporary `DailyNewsletterDeliveryQa.gs` Apps Script module, and confirms `ADB_DAILY_LAYOUT_QA_SEND_APPROVAL` has been consumed/removed, leave `ADB_DAILY_LAYOUT_GUARD_MODE=STAGED` pending live-content, no-write generation rehearsal and coordinated production cutover.

## Historical full-edition no-write integration rehearsal (Oct 14)

Using one previously Sent `2026-10-14-morning-resend-live` publication's editorial text and already-published public source/event URLs as **historic fixtures in memory**, the connected GitHub execution tool fetched the pure JS renderer and production contract from the same PR head and regenerated the full issue. This was **not** fresh editorial selection, link recertification, personal data exposure or approval to republish yesterday's news.

- Real editorial assembly: featured + four standard shared Top Stories, one Under the Radar, four historical More for You stories, four Austin Ahead entries, Weather and approved published Manage/feedback destinations.
- `ADB-DAILY-HTML-1.0` HTML/text verification: **PASS**, 10 named publisher source links and 22 URL destinations; rendered HTML 22,935 characters; plain text 7,827 characters.
- Twelve content/structure/reconciliation assertions: **12/12 PASS**, including source and title preservation, all eligible section counts, source/event/weather URLs, observed production footer management URL, no QA placeholder stories, no recipient-email leakage, and character limits.
- Live queue safety check: production Outbound Messages **zero matching Queued rows** at this read-only check. No production Sheet updates, queue/history mutations, external emails, or replays.
- Source parity: `ResendTransport.gs` and `DailyNewsletterContract.gs` have identical GitHub blob hashes at the previously operator-installed commit `167d9756378692c6a56b52ee3aecd06fa4b8512f` and the PR rehearsal commit `576fa330be8f38791a6cdb69838a1c5d34c83aea`. Operator already reported the paired-file deployment and successful read-only Apps Script runtime check.
- This dry run verifies **rendering compatibility with previously published real editorial shapes**, not independent current-day source review, all subscribers' live personalization, or a new 08:00 production cycle.

**Remaining release coordination:** secure explicit approval to merge PR #115 and immediately coordinate Script Property `ADB_DAILY_LAYOUT_GUARD_MODE=ENFORCE` at a safe time (no pending legacy daily batches), run read-only contract preflight again to confirm mode `ENFORCE`, then closely observe the next scheduled generation→queue→Resend→monitoring cycle. Do not leave a partially activated release overnight. No existing Sent row may be replayed.

## Staged Apps Script deployment (required order)

The updated dispatcher has a safe switch, Script Property `ADB_DAILY_LAYOUT_GUARD_MODE`:
- **Absent or `STAGED` (default):** the existing live daily dispatch path behaves as before; editorial HTML validation is not yet enforced. This is an installation-only state; it **does not prevent another malformed edition**.
- **`ENFORCE`:** for each daily dispatcher invocation, all Queued daily HTML + text are checked before Resend; one failure blocks the entire pending batch.
- Any other value fails closed with an exception before sending.

1. Back up the existing deployed `ResendTransport.gs` outside the Apps Script project; do not create a duplicate `.gs` module in production.
2. Install current PR revision's `DailyNewsletterContract.gs` and the matching entire `ResendTransport.gs` source from the **same reviewed commit**. Do not add `ADB_DAILY_LAYOUT_GUARD_MODE=ENFORCE` at installation time.
3. From the Apps Script editor, run the read-only `validateAdbDailyNewsletterContractDeploymentV1()`. Require approved reference PASS, negative control rejected, text parity PASS, `layoutGuardMode=STAGED`, no Sheet writes or Resend emails.
4. Verify a complete **dynamic** production-shape edition can be generated by the **actual scheduled automation's connected-tool JavaScript executor** from the same verified GitHub commit, including current management links, customization, verified source attribution and history constraints. A successful *interactive* Code Mode trial is necessary but not sufficient proof for the scheduled runtime. Perform controlled mailbox acceptance in Gmail/Yahoo/Outlook and mobile. This requires independent proof; GitHub CI alone is insufficient.
5. Only after controlled gate success, coordinate the main-branch canonical generator cutover and set `ADB_DAILY_LAYOUT_GUARD_MODE=ENFORCE` immediately before the first new production dispatch. Re-run the preflight and require `layoutGuardMode=ENFORCE`.
6. Observe the first live edition; preserve no-replay rules and explicit failure monitoring. Do not assume `STAGED` is protective.

This allows safe runtime installation before the 08:00 generator and avoids activating a guard against the still-current free-form HTML publisher prematurely. There is no unattended automatic cutover.

## Release and runtime sync — approval gate

- [ ] Confirm PR CI passes, including reference HTML/text and negative/positive contract tests.
- [x] One-time scheduled JavaScript compatibility probe completed; operator confirmed PASS. See task evidence.
- [x] One-recipient controlled Resend inbox QA: Gmail desktop PDF PASS, user-reported iPhone light/dark PASS; other clients and actual production URLs not verified.
- [ ] Inspect rendered output for a controlled current-day **dynamic** edition, not just the static approved sample; verify color, typography, source links, text parity, narrow mobile and desktop clients (Gmail, Yahoo, Outlook), image blocking, dark mode.
- [ ] Confirm current subscriber-management URL is appropriate for PROD; do **not** assume DEV native management was promoted.
- [ ] Merge approved PR to main only after review. Before updating Apps Script, read the exact merged revision and check production deployment/source parity.
- [ ] Update the production Apps Script project with **both** `DailyNewsletterContract.gs` and changed `ResendTransport.gs` from the **same commit**. Never install the modified dispatcher without its helper.
- [ ] Run read-only Apps Script `validateAdbDailyNewsletterContractDeploymentV1()` immediately after syncing; require approved-reference PASS, negative-control REJECTED, destination parity PASS, and zero queue/provider writes.
- [ ] Run a controlled queue-path test with an approved test profile. Confirm the approved edition is accepted and a deliberately invalid queued QA payload is blocked with no provider handoff; use isolated controlled test records and maintain idempotency.
- [x] Connected-tool no-write rehearsal with previously published real October 14 editorial content: shared `adbRenderDailyNewsletter` + `adbValidateDailyNewsletterPayload_` PASS, 12/12 checks and zero production writes; synthetic-only offline Python CLI is no longer the production dependency.
- [ ] Verify next scheduled production task selects new-day sources, applies all real profile preferences safely, queues correctly and is independently blocked by dispatcher on invalid HTML (first-live-cycle observation).
- [ ] Observe the next scheduled normal edition end to end. If live rendering fails, stop the new edition, report Morning Briefing validation failure, and fix source/template; **do not** resend existing Sent records.

## Limitations and monitoring

This structural contract is a hard negative gate, not a pixel-diff renderer. It cannot prove dark-mode or client-specific typography without controlled mailbox review, and it does not determine editorial correctness. The October 14 delayed delivery (08:37) is a separate follow-up. The legacy Google Manage form is the currently approved PROD path, because FORM-9 native management is still DEV-only. Do not promote the native link as part of the rendering repair.

**Operational fact:** a GitHub commit or merge does **not** update the manually installed production Apps Script runtime. Until manual deployment and controlled proof, this is a staged fix, not a live protection.

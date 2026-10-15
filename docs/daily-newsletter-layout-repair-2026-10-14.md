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
- [ ] Perform [one-recipient controlled Resend inbox QA](daily-newsletter-controlled-inbox-qa.md) using synthetic renderer-generated HTML/text. Review actually received message; sender/proxy acceptance is not inbox proof.
- [ ] Inspect rendered output for a controlled current-day **dynamic** edition, not just the static approved sample; verify color, typography, source links, text parity, narrow mobile and desktop clients (Gmail, Yahoo, Outlook), image blocking, dark mode.
- [ ] Confirm current subscriber-management URL is appropriate for PROD; do **not** assume DEV native management was promoted.
- [ ] Merge approved PR to main only after review. Before updating Apps Script, read the exact merged revision and check production deployment/source parity.
- [ ] Update the production Apps Script project with **both** `DailyNewsletterContract.gs` and changed `ResendTransport.gs` from the **same commit**. Never install the modified dispatcher without its helper.
- [ ] Run read-only Apps Script `validateAdbDailyNewsletterContractDeploymentV1()` immediately after syncing; require approved-reference PASS, negative-control REJECTED, destination parity PASS, and zero queue/provider writes.
- [ ] Run a controlled queue-path test with an approved test profile. Confirm the approved edition is accepted and a deliberately invalid queued QA payload is blocked with no provider handoff; use isolated controlled test records and maintain idempotency.
- [ ] Verify current main's canonical daily automation prompt is the one the morning automation fetches; run a controlled generator dry run with a real, dynamic issue and prove CLI PASS **before** queue/history writes.
- [ ] Observe the next scheduled normal edition end to end. If live rendering fails, stop the new edition, report Morning Briefing validation failure, and fix source/template; **do not** resend existing Sent records.

## Limitations and monitoring

This structural contract is a hard negative gate, not a pixel-diff renderer. It cannot prove dark-mode or client-specific typography without controlled mailbox review, and it does not determine editorial correctness. The October 14 delayed delivery (08:37) is a separate follow-up. The legacy Google Manage form is the currently approved PROD path, because FORM-9 native management is still DEV-only. Do not promote the native link as part of the rendering repair.

**Operational fact:** a GitHub commit or merge does **not** update the manually installed production Apps Script runtime. Until manual deployment and controlled proof, this is a staged fix, not a live protection.

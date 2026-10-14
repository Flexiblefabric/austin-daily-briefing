# October 14, 2026 — Daily newsletter layout incident repair

**Incident:** #114. **Contract:** `ADB-DAILY-HTML-1.0`. **Scope:** Generated daily HTML/plain-text payload and Resend daily dispatcher. No change to subscriber eligibility, queue identifiers, token handling, or the welcome dispatcher.

## Confirmed failure boundary

The original delivered email contains five shared stories **before** the masthead and the 620px newsletter reading frame; the top-story cell is centered, headlines lose the approved editorial serif and publisher links lose Link Red. These errors are present in sent HTML and are not caused by PDF rendering or the Resend API. The existing static-component QA validator does not test live generated HTML.

## Repair

1. `apps-script/DailyNewsletterContract.gs`: pure JS structural contract. It examines the real HTML for canonical masthead/date/Pulse/Weather/story order, approved table nesting, noncentered story cells, serif headings, Why It Matters, Under the Radar, source-link styling, and footer/Customize presence.
2. `apps-script/ResendTransport.gs`: fail-closed batch preflight **before any Resend handoff**. If any queued daily payload is invalid, **all Queued daily rows in that batch** and their matching Pending history rows are marked Failed; the entire batch stops before any handoff. Do not modify already Sent rows. A persistent blocked-Run-ID marker prevents a later hourly pass from releasing surviving queued rows after an interrupted failure update. Missing contract file stops dispatch without changing queue.
3. `scripts/render_daily_newsletter.py`: builds full branded HTML/plain text deterministically from structured, policy-vetted story JSON, instead of giving the generator free rein to rebuild the layout. It runs the shared pre-queue validator automatically. `scripts/validate_daily_newsletter.js` executes the exact Apps Script HTML/text parity contract.
4. `docs/automation-prompts/austin-daily-briefing.md`: generation must produce structured JSON and use the deterministic renderer. `design/newsletter-renderer-qa.html` remains the controlled visual reference, not an editorial source. A renderer/validator failure stops writes.
5. `tests/daily-newsletter-contract.test.js`, `tests/fixtures/daily-newsletter-example.json`, and `.github/workflows/daily-newsletter-layout.yml`: positive/negative HTML, text parity, simulated dispatcher, and synthetic deterministic-renderer acceptance.

## Release and runtime sync — approval gate

- [ ] Confirm PR CI passes, including reference HTML/text and negative/positive contract tests.
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

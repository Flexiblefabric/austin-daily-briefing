# October 14, 2026 — Daily newsletter layout incident repair

**Incident:** #114. **Contract:** `ADB-DAILY-HTML-1.0`. **Scope:** Generated daily HTML/plain-text payload and Resend daily dispatcher. No change to subscriber eligibility, queue identifiers, token handling, or the welcome dispatcher.

## Confirmed failure boundary

The original delivered email contains five shared stories **before** the masthead and the 620px newsletter reading frame; the top-story cell is centered, headlines lose the approved editorial serif and publisher links lose Link Red. These errors are present in sent HTML and are not caused by PDF rendering or the Resend API. The existing static-component QA validator does not test live generated HTML.

## Repair

1. `apps-script/DailyNewsletterContract.gs`: pure JS structural contract. It examines the real HTML for canonical masthead/date/Pulse/Weather/story order, approved table nesting, noncentered story cells, serif headings, Why It Matters, Under the Radar, source-link styling, and footer/Customize presence.
2. `apps-script/ResendTransport.gs`: fail-closed batch preflight **before any Resend handoff**. Any invalid queued daily payload is marked Failed with its matching Pending history records; the entire batch stops. Do not modify already Sent rows. Missing contract file stops dispatch without changing queue.
3. `scripts/validate_daily_newsletter.js`: runs the identical JS validator on final generated HTML, plus HTML/plain-text URL order parity and minimal text structure. Generator must run it on **each actual payload before queueing**.
4. `docs/automation-prompts/austin-daily-briefing.md`: generation is instructed to reuse `design/newsletter-renderer-qa.html` as an approved *markup/layout* reference only. Sample stories are not production editorial content. A validator failure stops writes.
5. `tests/daily-newsletter-contract.test.js` and `.github/workflows/daily-newsletter-layout.yml`: reference and negative-fixture tests, including dispatch integration with simulated queue/history and all-or-none handoff.

## Release and runtime sync — approval gate

- [ ] Confirm PR CI passes, including reference HTML/text and negative/positive contract tests.
- [ ] Inspect rendered output for a controlled current-day **dynamic** edition, not just the static approved sample; verify color, typography, source links, text parity, narrow mobile and desktop clients (Gmail, Yahoo, Outlook), image blocking, dark mode.
- [ ] Confirm current subscriber-management URL is appropriate for PROD; do **not** assume DEV native management was promoted.
- [ ] Merge approved PR to main only after review. Before updating Apps Script, read the exact merged revision and check production deployment/source parity.
- [ ] Update the production Apps Script project with **both** `DailyNewsletterContract.gs` and changed `ResendTransport.gs` from the **same commit**. Never install the modified dispatcher without its helper.
- [ ] Run a controlled queue-path test with an approved test profile. Confirm the approved edition is accepted and a deliberately invalid queued QA payload is blocked with no provider handoff; use isolated controlled test records and maintain idempotency.
- [ ] Verify current main's canonical daily automation prompt is the one the morning automation fetches; run a controlled generator dry run with a real, dynamic issue and prove CLI PASS **before** queue/history writes.
- [ ] Observe the next scheduled normal edition end to end. If live rendering fails, stop the new edition, report Morning Briefing validation failure, and fix source/template; **do not** resend existing Sent records.

## Limitations and monitoring

This structural contract is a hard negative gate, not a pixel-diff renderer. It cannot prove dark-mode or client-specific typography without controlled mailbox review, and it does not determine editorial correctness. The October 14 delayed delivery (08:37) and legacy Manage link are separate follow-ups. Avoid diagnosing these as consequences of the HTML regression without evidence.

**Operational fact:** a GitHub commit or merge does **not** update the manually installed production Apps Script runtime. Until manual deployment and controlled proof, this is a staged fix, not a live protection.

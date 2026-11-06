# Newsletter Redesign Promotion

**Release:** `newsletter-redesign-v0-1`  
**Status:** Promoted to production; controlled promotion QA complete  
**Scope:** Daily briefing renderer, redesigned welcome email, and optional What's New release communication  
**Production architecture:** Unchanged  
**Delivery provider:** Unchanged — Resend through the existing Apps Script queue dispatcher

## Reader-facing outcome

This release promotes the approved ADB newsletter identity and component system into production.

Readers will receive:

- The approved ADB masthead and centered branded footer.
- Clearer Featured / Top Story hierarchy.
- Canonical Why It Matters treatment.
- Approved Under the Radar header-band treatment.
- More for You with an explicit saved-interests orientation line.
- Austin Ahead with GO / WATCH / PLAN labels and orientation copy.
- Improved mobile Weather behavior.
- An optional, quiet What's New section for material product updates.
- A redesigned Welcome email using the same identity system.
- Correct live subscriber, feedback, privacy, terms, and corrections destinations.

The release does not change subscriber eligibility, the production database schema, Resend transport ownership, queue semantics, delivery cadence, or the 08:00 America/Chicago morning-generation schedule.

## Approved controlled design QA

Daily newsletter client QA: **PASS**.  
Welcome redesign client QA: **PASS**.

The controlled reviews covered desktop/mobile rendering, dark mode, image-blocked behavior, hierarchy, links, footer controls, More for You, Austin Ahead, Why It Matters, Under the Radar, and Welcome inbox delivery.

## What's New launch notice

The production prompt contains a temporary release notice:

- Normalized key: `newsletter-redesign-v0-1`
- Section: `What's New`
- Category: `Product Update`
- Expiry: after 2026-09-28 America/Chicago
- Frequency: at most once per eligible profile, determined from Briefing History.

Launch copy:

> Austin Daily Briefing has a new look. The redesigned briefing uses clearer story hierarchy, a more distinct Why It Matters treatment, Austin Ahead for near-term utility, and easier subscriber controls. The editorial mission has not changed, and no action is required.

After expiry the production prompt must omit the notice even when no prior history record exists.

## Production integration changes

### Morning generation

`docs/automation-prompts/austin-daily-briefing.md` advances to `ADB-DAILY-PROD-1.2` and requires conformance with:

- `docs/editorial-system.md`
- `docs/newsletter-component-spec.md`
- `docs/source-link-standard.md`

The scheduler task remains the same task at 08:00 America/Chicago. After this promotion PR reaches `main`, its runtime prompt copy must be synchronized with the canonical file.

### Welcome delivery

`apps-script/ResendTransport.gs` keeps the existing welcome dispatcher and queue ownership. Only the rendered Welcome HTML/plain text and durable public asset/link constants change.

No trigger, delivery mode, API credential, or subscriber-processing change is part of this release.

## Controlled queue-path QA

A single `DAILY-RESEND-QA` payload has been queued for the existing dedicated production QA profile using the approved newsletter reference payload and the normal `DAILY_BRIEFING_V1` queue/history path.

Controlled queue-path result: **PASS**.

Verified evidence:

- The QA queue row began in `Queued`.
- The matching Briefing History row began in `Pending`.
- The existing daily dispatcher accepted the QA row through the normal Resend path.
- The queue transitioned to `Sent` with exactly one provider ID.
- The matching history row transitioned to `Sent` with the same provider ID.
- The received message matched the approved renderer.
- A replay of the dispatcher reported `0 sent`, confirming duplicate protection for the already-Sent QA row.

## Promotion result

Completed:

1. Controlled queue-path QA passed.
2. The received queue-path message was reviewed and approved.
3. Promotion PR #18 passed required documentation CI and was merged to `main`.
4. The merged `ResendTransport.gs` was synchronized into the production Apps Script project.
5. The promoted production Welcome template was validated and delivered successfully through a manual allowlisted production QA send.
6. The active Austin Daily Briefing scheduler prompt was synchronized with canonical `ADB-DAILY-PROD-1.2`.
7. The existing 08:00 America/Chicago schedule and existing Resend dispatcher were preserved.
8. Duplicate/replay testing passed with `0 sent` on replay.

Routine post-release observation remains with the existing production controls: the next scheduled live redesigned edition should be observed end to end and the 09:30 production watchdog should confirm generation and delivery health. This is normal post-release monitoring rather than an open promotion gate.

## Rollback

If the first production run exposes a material renderer defect:

- Restore the prior canonical morning prompt from Git history.
- Restore the prior `adbWelcomeHtml_` / `adbWelcomePlainText_` implementation if the Welcome path is affected.
- Do not alter subscriber data, queue/history state, Resend credentials, or delivery ownership unless a separate defect is identified.
- Existing sent messages remain immutable.

## Release record requirements

This development-to-production promotion has the required release records:

- Newest-first `docs/CHANGELOG.md` entry: complete.
- Immutable `PROJECT_STATE.json` snapshot: complete.
- Short release checklist in PR #18: complete for promotion gates.
- Controlled queue-path and production Welcome post-promotion checks: complete.
- First scheduled live-cycle observation: delegated to normal production monitoring and watchdog evidence.

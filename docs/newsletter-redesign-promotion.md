# Newsletter Redesign Promotion

**Release:** `newsletter-redesign-v0-1`  
**Status:** Promotion integration staged; controlled queue-path QA in progress  
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

Before production promotion, require:

- Queue row begins in `Queued`.
- Matching Briefing History row begins in `Pending`.
- Existing daily dispatcher accepts the QA row through the normal Resend path.
- Queue becomes `Sent` with exactly one provider ID.
- Matching history becomes `Sent` with the same provider ID.
- The received message matches the approved renderer.
- Replay/duplicate behavior produces no second send.

Do not promote the new morning prompt until this controlled queue-path test passes.

## Promotion sequence

1. Complete controlled queue-path QA.
2. Review the received queue-path message.
3. Merge this PR only after all required CI passes.
4. Synchronize the merged `ResendTransport.gs` into the production Apps Script project.
5. Run the read-only Welcome validation and one allowlisted Welcome test after code synchronization.
6. Synchronize the active Austin Daily Briefing scheduler prompt with the merged canonical `ADB-DAILY-PROD-1.2` prompt.
7. Keep the existing 08:00 schedule and existing daily dispatcher.
8. Observe the first live redesigned edition end to end.
9. Require the 09:30 production watchdog to confirm generation and Resend delivery health.
10. Check for duplicate sends, stuck queues, invalid links, or subscriber-impact anomalies.

## Rollback

If the first production run exposes a material renderer defect:

- Restore the prior canonical morning prompt from Git history.
- Restore the prior `adbWelcomeHtml_` / `adbWelcomePlainText_` implementation if the Welcome path is affected.
- Do not alter subscriber data, queue/history state, Resend credentials, or delivery ownership unless a separate defect is identified.
- Existing sent messages remain immutable.

## Release record requirements

Because this is a development-to-production promotion, final promotion requires:

- A newest-first `docs/CHANGELOG.md` entry.
- An immutable `PROJECT_STATE.json` snapshot.
- The short release checklist completed in the PR/release record.
- Observed post-promotion production result recorded after the first live cycle.

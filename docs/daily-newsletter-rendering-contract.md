# ADB deterministic daily newsletter rendering contract

**Renderer:** `scripts/render_daily_newsletter.py`  
**Validator:** `scripts/validate_daily_newsletter.js`  
**Live dispatcher gate:** `apps-script/DailyNewsletterContract.gs`  
**Contract ID:** `ADB-DAILY-HTML-1.0`

## Authority and intent

The canonical `docs/newsletter-component-spec.md`, `docs/design-system.md` and `docs/source-link-standard.md` govern appearance and source attribution. `design/newsletter-renderer-qa.html` is the approved, controlled visual reference; it is **not** a live news source or a valid production edition. The new renderer implements the same editorial component hierarchy from structured content; it deliberately owns HTML and plain-text presentation so each generation run does not rebuild layout from scratch.

## Required structured JSON

Write exactly one UTF-8 JSON file per intended profile/edition. Use `tests/fixtures/daily-newsletter-example.json` for the **shape**, never its synthetic headlines in a live issue. Fields:

- `date`: ISO YYYY-MM-DD in America/Chicago.
- `preheader`: short editorial preview.
- `pulse`: short Austin Pulse paragraph.
- `weather`: `summary`, `url` to NWS, optionally `high` and `low`.
- `featured`: one Top Story object.
- `topStories`: nonempty array of remaining shared Top Story objects; feature counts as one of the approximately five shared stories.
- `underTheRadar`: eligible story object or null/absent; never filler.
- `moreForYou`: array of eligible personalized stories; empty means omit.
- `austinAhead`: array of action items; empty triggers the editorial empty state.
- `footer.manageUrl`: **current approved production** Manage/Pause/Unsubscribe destination. The generator must verify which native or fallback route is live; do not infer migration status from DEV.
- `footer.feedbackUrl`: optional approved corrections/feedback destination; default is the current canonical live Google Form.
- Optional `fridayRecap`: array of up to three sourced objects (`text`, `sources` with publisher/url), Fridays only.
- Optional `whatsNew` and `correction`: only when editorial policies explicitly qualify; edition-level correction is placed immediately after Austin Pulse.

Each shared `featured`, `topStories` and `underTheRadar` story object needs `headline`, `summary`, `why` and a nonempty `sources` array of `{publisher,url}`; optional `metadata` is display-only. Each `moreForYou` item needs `headline`, `summary`, `sources` and optional `why` based on editorial rules. Each `austinAhead` item requires `action` (one of GO/WATCH/PLAN), `when`, `title`, `organizer`, `url`, and optional `description` or `linkType` (`Event details` or `Source`).

No private subscriber addresses, profile IDs, safety tokens or selection provenance go inside this JSON. Those remain in their respective protected queue/evidence systems.

## Before-queue command

```sh
python3 scripts/render_daily_newsletter.py input.json edition.html edition.txt
```

The Python renderer writes the fully escaped, deterministic HTML and plain-text bodies to these exact files, then invokes `node scripts/validate_daily_newsletter.js` itself. It requires a successful exit and printed JSON `status: PASS`; error or missing Node blocks the run. Do not manually assemble alternate HTML, bypass this renderer, remove markup checks or use the reference's synthetic content. The outputs, not the JSON itself, populate the daily Outbound Messages body fields.

The dispatch-side Apps Script gate independently validates **all queued** HTML/text pairs before sending any. If one is malformed, all pending rows in the inspected batch are failed without provider handoff, including matching Pending history rows. The original queue rows cannot be silently rewritten or replayed.

## Release QA

Run the checked-in static visual sample, the structured fixture and the actual dynamic test profile through validation and controlled email client review. Compare desktop/mobile typography, source links, Weather stacking, image blocking and dark mode with the approved design. Current tests provide structural and style-marker protection, **not** pixel-perfect validation.

The Python renderer must be used by the production generator only after PR approval, deployment/version parity and controlled QA. Changing GitHub main alone does not install Apps Script files in production.

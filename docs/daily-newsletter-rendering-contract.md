# ADB deterministic daily newsletter rendering contract

**Scheduled tool renderer:** `scripts/daily_newsletter_renderer.js` (pure JavaScript; no Python/Node dependency)
**Offline QA comparator:** `scripts/render_daily_newsletter.py` (not required in scheduled runtime)  
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

## Before-queue controlled renderer execution

The morning automation must retrieve `scripts/daily_newsletter_renderer.js`, `apps-script/DailyNewsletterContract.gs` and the canonical selection specifications **at the same verified main commit** using the connected GitHub contents API. No subscriber data or personalized JSON should be placed in GitHub, workflow artifacts, logs or model-visible output.

The automation creates one in-memory editorial JSON object per eligible profile, following the schema above. From a connected-tool JavaScript execution, evaluate the pinned renderer and shared validator, produce exact HTML/text, and validate both BEFORE any Outbound Messages or Briefing History writes:

```js
const render = new Function(rendererSource + ';return adbRenderDailyNewsletter;')();
const validate = new Function(contractSource + ';return adbValidateDailyNewsletterPayload_;')();
const { html, text } = render(validatedStructuredEditorialJson);
const result = validate(html, text);
if (result.contract !== 'ADB-DAILY-HTML-1.0') throw Error('Incorrect rendering contract');
```

Here `rendererSource` and `contractSource` are bytes fetched through the connected GitHub contents API at a single SHA, not free-form code generated in the conversation. The exact in-memory HTML and plain text populate the outbound payloads. Require an independently confirmed PASS for **every** intended profile before any queue/history writes. Never send or queue a sample fixture or manually reconstructed HTML.

If the scheduled executor lacks JavaScript tool execution, source verification, or another required tool, STOP before any writes, report **rendering preflight unavailable**, and mark the normal Morning Briefing failure. Do not fall back to approximate free-form HTML or attempt to switch to Python/Node without an independently verified capability.

`scripts/render_daily_newsletter.py` remains an optional controlled offline comparison and CI test only. It is **not** a second live renderer or production fallback; avoid divergent authoring paths.

The dispatcher-side Apps Script gate independently validates each queued HTML/text pair after its separate `ADB_DAILY_LAYOUT_GUARD_MODE=ENFORCE` cutover. A malformed edition blocks the full pending batch; a persisted blocked-run marker prevents accidental partial delivery on a later hourly invocation. Keep `STAGED` during installation/controlled QA; it is not a protective production state.

## Release QA

Run the checked-in static visual sample, the structured fixture and the actual dynamic test profile through validation and controlled email client review. Compare desktop/mobile typography, source links, Weather stacking, image blocking and dark mode with the approved design. Current tests provide structural and style-marker protection, **not** pixel-perfect validation.

The pure JS renderer must be verified inside the scheduled ChatGPT task's execution context, not only this interactive conversation, before PR promotion. Production must have the matching Apps Script contract and dispatcher installed. Changing GitHub main alone does not install Apps Script files or change their guard mode.

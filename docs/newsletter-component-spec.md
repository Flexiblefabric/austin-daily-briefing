# Austin Daily Briefing Newsletter Component Specification

**Specification ID:** `ADB-NEWSLETTER-COMPONENTS-0.1`  
**Status:** Working draft for review  
**Scope:** Daily ADB newsletter HTML and plain-text rendering  
**Depends on:** `docs/design-system.md`, `docs/editorial-system.md`, `docs/source-link-standard.md`

## 1. Purpose

This specification translates the approved ADB Design System and Editorial System into reusable newsletter components.

It defines:

- What each newsletter component contains.
- Which components are required, optional, or conditional.
- The order in which components appear.
- Visual and spacing behavior.
- Responsive and email-client fallback behavior.
- Plain-text parity requirements.
- Empty and omitted states.
- Accessibility requirements.
- Component-level QA.

This document is intentionally more concrete than the Design System and Editorial System, but it does not define story-selection scoring, production queue logic, subscriber processing, or transport mechanics.

The governing principle is:

> **The newsletter should feel like one edited publication, not a collection of independent cards.**

## 2. Authority and Precedence

When specifications overlap, use this order:

1. `docs/editorial-system.md` for editorial meaning, section purpose, neutrality, sourcing expectations, repetition, and content rules.
2. `docs/design-system.md` for visual identity, typography roles, color, spacing language, and cross-surface brand rules.
3. This file for newsletter-specific component construction and fallback behavior.
4. `docs/source-link-standard.md` for source-link labels, publisher attribution, HTML/plain-text destination parity, and link QA.
5. Production implementation files for mechanics only.

An implementation must not use this document to override an editorial rule.

## 3. Email Rendering Baseline

The newsletter is designed for email reliability first.

### Required assumptions

- Single-column layout.
- Maximum content width: **620px**.
- Primary reading surface: Paper `#FFFEFA`.
- Exterior canvas, where supported: Canvas `#ECE9E2`.
- Table-based layout is acceptable and preferred when needed for compatibility.
- Critical styling must be inline in production HTML.
- The email must remain usable when:
  - Custom fonts fail.
  - Images are blocked.
  - Dark mode alters colors.
  - CSS media queries are only partially supported.
  - The reader uses a narrow mobile viewport.

### Prohibited dependencies

Do not require:

- JavaScript.
- Forms inside the email.
- Hover behavior.
- External stylesheets.
- Remote fonts for critical identity.
- Absolute positioning.
- CSS Grid for required layout behavior.
- Background images for essential information.

## 4. Brand Asset Authority

The approved brand asset package currently staged in ADB DEV Drive is the source artwork for the newsletter identity.

The package includes:

- Outlined primary masthead SVG.
- Primary masthead PNG at 900 × 220.
- Primary masthead 2× PNG at 1800 × 440.
- Standard compact mark SVG/PNG/2× PNG.
- Reversed compact mark SVG/PNG/2× PNG.
- Licensed Newsreader and IBM Plex Sans Condensed source fonts and OFL licenses.
- Regeneration instructions.

### Masthead master

Approved master geometry:

- Canvas: **900 × 220**.
- Newsreader weight 500, optical size 16.
- IBM Plex Sans Condensed Medium 500.
- 18px optical clear space on each side of the divider.
- 12px minimum brand clear space.
- Divider width: 5px.
- Divider extends 14px above the cap line and below the baseline.
- Charcoal `#181818`.
- Signal Red `#DB2D2D`.
- Paper `#FFFEFA`.

### Production email usage

For email:

- Use the approved PNG masthead rather than reconstructing the logo in HTML text.
- Prefer the 2× PNG source where hosting and payload size remain reasonable, rendered at the intended CSS width.
- Preserve the approved aspect ratio.
- Do not alter internal typography, spacing, divider placement, or colors.
- Use alt text: `Austin Daily Briefing`.
- Do not hotlink production email assets from Google Drive.
- Before production promotion, copy approved assets into the project's durable production asset location.

The SVG remains the canonical vector master. PNG is the preferred delivery format for email-client reliability.

### Compact mark

Use the reversed compact mark in the Charcoal newsletter footer.

Use alt text `ADB` only when nearby text does not already identify the publication.

## 5. Global Newsletter Frame

### Desktop

- Maximum width: 620px.
- Content padding: approximately 32–36px.
- Recommended implementation target: 34px.
- Paper background.
- Exterior canvas may use `#ECE9E2`.

### Mobile

At approximately 520–620px and below:

- Remove or reduce exterior canvas padding.
- Content padding: approximately 20–24px.
- Recommended target: 22px.
- Maintain full-width Paper reading surface.
- Avoid horizontal scrolling.

### Vertical rhythm

Standard major-section spacing:

- Desktop: approximately 42px top and bottom.
- Mobile: approximately 34px top and bottom.
- Under the Radar may use slightly greater separation.
- Grouped stories inside the same section use tighter internal spacing.

The page should alternate between open major-section spacing and tighter related-story spacing.

## 6. Typography in Email

Email typography prioritizes hierarchy and reliability over exact web-font fidelity.

### Editorial display text

Preferred fallback:

`Georgia, "Times New Roman", serif`

Use for:

- Featured headline.
- Story headlines.
- Austin Pulse.
- Selected display phrases.

### Information text

Preferred fallback:

`"Arial Narrow", Arial, Helvetica, sans-serif`

Use for:

- Section labels.
- Dates.
- Metadata.
- Austin Ahead taxonomy.
- Buttons.
- Weather numerals where appropriate.

### Body copy

Use:

`Arial, Helvetica, sans-serif`

### Minimums

- Body summary: 16–17px.
- Source links: at least 16px.
- Section labels: approximately 13–14px.
- Metadata: approximately 12–13px.
- Why It Matters: approximately 16px.

No critical editorial body text should be rendered as an image.

## 7. Color Implementation

Use the Design System tokens:

- Charcoal: `#181818`
- Paper: `#FFFEFA`
- Signal Red: `#DB2D2D`
- Supporting Gray: `#68635A`
- Rule Gray: `#DEDAD1`
- Warm Wash: `#F2EFE8`
- Link Red: `#8F1717`
- Canvas: `#ECE9E2`

Signal Red should remain scarce.

Source-link presentation follows the source-link standard for labels and interaction, but the newsletter visual token is **Link Red `#8F1717`** rather than a generic blue link treatment.

## 8. Standard Edition Component Order

The standard HTML newsletter appears in this order:

1. Hidden preheader, when used.
2. Primary masthead.
3. Edition date.
4. Austin Pulse.
5. Weather.
6. Featured Top Story.
7. Remaining Top Stories.
8. Under the Radar, when warranted.
9. More for You.
10. Austin Ahead.
11. Friday recap, when applicable.
12. Correction or clarification notice when required by editorial policy and placement rules.
13. Footer.

Why It Matters is embedded inside applicable story components.

A corrections notice may move earlier when the correction affects a story in the current edition; see Section 20.

## 9. Hidden Preheader

**Status:** Optional but recommended.

The hidden preheader provides a useful inbox preview without introducing new editorial content.

### Content

Use one short sentence based on:

- The day's strongest shared development.
- Austin Pulse.
- A concise utility cue.

Do not:

- Add clickbait.
- Add information not present in the edition.
- Repeat the subject line word-for-word.
- Include promotional language.

### Rendering

The preheader should be visually hidden in the email body while remaining available to supporting inbox clients.

If hidden-preheader techniques are not reliable in the active renderer, omit it rather than showing accidental white-space artifacts.

## 10. Masthead and Edition Date

**Required.**

### Masthead

Use the approved production masthead asset.

Recommended display width:

- Desktop: approximately 480–500px.
- Mobile: width: 100%, constrained by content padding.
- Never upscale beyond the source asset's useful resolution.

Recommended top/bottom padding:

- Desktop: approximately 30px top / 22px bottom.
- Mobile: approximately 24px top / 18px bottom.

A thin Rule Gray divider may separate the masthead block from the edition body.

### Edition date

Place immediately below the masthead.

Use:

- IBM Plex Sans Condensed role/fallback.
- Supporting Gray.
- Uppercase or small-caps-like treatment.
- Approximately 13–14px.
- Moderate tracking.

Recommended pattern:

`SUNDAY · SEPTEMBER 20, 2026`

The date is utility information and should not visually compete with the masthead.

## 11. Austin Pulse Component

**Required.**

### Purpose

Austin Pulse gives the reader a narrative orientation to the day.

### Anatomy

1. Section label: `AUSTIN PULSE`
2. One short editorial paragraph.

### Visual treatment

- Section label above.
- Signal Red left rule: approximately 4px.
- Left padding inside the rule: approximately 16–18px.
- Editorial serif.
- Approximately 19–22px.
- Comfortable line height, approximately 1.45–1.50.
- No background field by default.

### Content constraints

- Usually one paragraph.
- No bullets.
- No linked headlines.
- No Why It Matters box inside Austin Pulse.
- No independent source list unless a claim appears there that is not supported elsewhere in the issue; in normal operation, avoid that situation.

### Mobile

Retain the red left rule and paragraph treatment.

## 12. Weather Component

**Required.**

### Purpose

Provide practical daily weather utility.

### Anatomy

1. Section label: `WEATHER`
2. Primary condition phrase.
3. Optional current/high/low temperature treatment.
4. Short practical detail.
5. Forecast source link.

### Recommended content

Example:

> **Hot, sunny, and increasingly uncomfortable**  
> High 99° · Low 75°  
> Plan outdoor activity earlier in the day and watch for any afternoon heat advisory.

### Visual treatment

Desktop may place a large temperature to the right of text using a compatibility-safe table layout.

Mobile stacks all content vertically.

### Source

Use:

`Forecast: National Weather Service →`

Weather does not use Why It Matters.

### Quiet-weather state

Routine conditions should produce a shorter component, not an artificially dramatic one.

## 13. Featured Top Story Component

**Required when Top Stories exist.**

Featured status is presentation only.

### Anatomy

1. Section label: `FEATURED TOP STORY`
2. Headline.
3. Metadata.
4. Summary.
5. Why It Matters.
6. Source area.

### Headline

- Editorial serif.
- Approximately 29–32px desktop.
- Approximately 27–29px mobile.
- Strongest headline hierarchy in the edition.
- Unlinked.

### Metadata

- Approximately 12–13px.
- Supporting Gray.
- Condensed information face/fallback.
- Uppercase or restrained small-label treatment.

Example:

`AUSTIN · HOUSING · GOVERNMENT + INDEPENDENT`

### Summary

- Approximately 17px.
- Body sans serif.
- Line height approximately 1.55–1.60.

### Separation

Give this component more breathing room than a standard story.

Do not put it inside a heavy card.

## 14. Standard Top Story Component

**Required for each non-featured Top Story.**

### Anatomy

1. Headline.
2. Metadata.
3. Summary.
4. Why It Matters.
5. Source area.

### Visual treatment

- Headline: approximately 22–25px editorial serif.
- Summary: 16–17px body sans serif.
- Metadata: Supporting Gray.
- Story-to-story divider: 1px Rule Gray.
- Internal story padding: approximately 24–28px.

The Top Stories section should read as one continuous editorial sequence rather than a set of independent cards.

### First story behavior

If Featured Top Story is rendered as its own major section, the remaining Top Stories begin under a single `TOP STORIES` section label.

## 15. Why It Matters Component

**Required for Featured Top Story, each Top Story, and Under the Radar. Conditional elsewhere according to the Editorial System.**

### Purpose

Visually and semantically separate consequence from summary.

### Canonical treatment

- Background: Warm Wash `#F2EFE8`.
- Left rule: Signal Red `#DB2D2D`, approximately 3–4px.
- Internal padding: approximately 14–18px.
- Top margin after summary: approximately 14–18px.
- Label: IBM Plex Sans Condensed role/fallback.
- Body: standard reading sans serif.
- Font size: approximately 16px.
- Line height: approximately 1.5–1.55.

### Label

Preferred visible label:

`WHY IT MATTERS`

The label may be inline with the first sentence or placed on its own short line. Whichever pattern is selected for production should remain consistent across the issue.

### Boundaries

Do not:

- Use a quotation style.
- Add a shadow.
- Use an alert icon.
- Use a full red background.
- Turn it into a button.
- Render it identically to Under the Radar.

## 16. Source Area Component

**Required for every sourced item covered by the Source-Link Standard.**

### Placement

Place after the summary and Why It Matters.

### Visual treatment

- Link Red `#8F1717`.
- Visible underline.
- At least 16px.
- Strong enough weight to scan.
- Comfortable vertical padding, approximately 8px.
- Each source on its own line or inline-block.

### Labels

News or official action:

`Source: [Publisher] →`

Multiple sources:

repeat the pattern once per publisher.

Weather:

`Forecast: National Weather Service →`

Austin Ahead event:

`Event details: [Organizer or Venue] →`

### Rules

- Headline remains unlinked.
- Publisher is visible.
- No generic `Read more`.
- No bare URL in HTML.
- HTML and plain text must contain the same destinations in the same order.

## 17. Under the Radar Component

**Conditional. Omit entirely when no item qualifies.**

### Purpose

Signal a consequential development that readers may reasonably have missed.

### Anatomy

1. `UNDER THE RADAR` section label.
2. Headline.
3. Summary.
4. Why It Matters.
5. Source area.

### Canonical visual treatment

- Larger enclosing Warm Wash field or approved neutral field.
- Signal Red top rule: approximately 4–5px.
- Internal padding: approximately 22–26px.
- Increased major-section separation.
- Section label in Charcoal.
- Headline uses standard story hierarchy.

### Why It Matters inside Under the Radar

Retain its own Signal Red left rule and inset treatment.

Because both components use Warm Wash, implementation must preserve a clear nested distinction. Preferred approaches include:

- Slightly lighter or Paper inner Why It Matters field while retaining its red left rule, or
- Preserve Warm Wash but use clear internal spacing and a red rule strong enough to distinguish the nested component.

Do not allow the Why It Matters box to visually disappear into the Under the Radar field.

### Omitted state

No empty placeholder.

No `Nothing today` message.

If no item qualifies, the entire section is absent.

## 18. More for You Component

**Required when personalized items are available under subscriber settings.**

### Purpose

Present personally relevant material without visually separating it into a different publication.

### Section anatomy

1. `MORE FOR YOU` section label.
2. Optional short descriptor: `Selected from your saved interests.`
3. One or more personalized items.

### Item anatomy

For substantive news/analysis:

1. Headline.
2. Optional concise metadata.
3. Summary.
4. Why It Matters when required by the Editorial System or subscriber preference.
5. Source area.

For lighter culture/event material:

1. Headline.
2. Short summary/utility line.
3. Source or event-details link.

### Visual treatment

- Slightly lighter headline hierarchy than shared Top Stories.
- Use simple Rule Gray separators.
- No algorithmic-feed cards.
- No personalization badge on every item.

### Empty behavior

If subscriber configuration yields no eligible item, the production system may omit More for You rather than manufacture content.

If production policy later requires a personalized empty state, specify it separately before implementation.

## 19. Austin Ahead Component

**Required in every standard daily edition.**

### Purpose

Provide near-term Austin utility.

### Section anatomy

1. `AUSTIN AHEAD` section label.
2. One or more items, or the approved empty state.

### Item anatomy

1. Action label + date.
2. Item title.
3. Short utility description.
4. Event/source link.

Example:

`PLAN · MON–THU`

**I-35 overnight closures shift through downtown**

Several lanes will close overnight as construction moves to the next segment. Check the project map before late travel.

`Event details: TxDOT →` or the appropriate source label when not an event.

### Taxonomy

Exactly one label per item:

- `GO`
- `WATCH`
- `PLAN`

These are mutually exclusive.

### Label treatment

- IBM Plex Sans Condensed role/fallback.
- Approximately 12–13px.
- Controlled tracking.
- Signal Red may be used on the action word.
- Date may remain Charcoal or Supporting Gray.
- Do not use filled colored pills.

### Item title

- Editorial serif.
- Approximately 19–21px.
- Smaller than Top Story headline.

### Utility description

- Approximately 15–16px.
- Direct and practical.
- No Why It Matters box by default.

### Item separation

Use Rule Gray dividers.

### Recommended density

Default target: approximately 2–4 useful items when available.

This is not a quota. Quality and repetition rules take priority.

### Empty state

If no item qualifies:

> **No major Austin Ahead items to flag today.**

Style this as quiet body text, not an error or warning.

### Friday

The future expanded Friday version is outside this specification until separately approved.

## 20. Corrections and Clarifications Component

**Conditional but required when the Editorial System calls for a visible correction or meaningful clarification.**

### Purpose

Make material corrections visible without confusing them with news selection.

### Placement

Use one of two patterns:

**Edition-level correction:** Place after Austin Pulse or before Top Stories when the correction materially changes something readers may rely on in the current edition.

**Prior-edition correction:** Place near the end of the editorial body, before the footer, when it corrects a previous issue without changing the current day's primary reporting.

The specific placement should maximize reader awareness without implying the correction is a new Top Story.

### Anatomy

1. Label: `CORRECTION` or `CLARIFICATION`.
2. Affected briefing date.
3. Concise statement of what was wrong or unclear.
4. Corrected information.
5. Optional supporting source link.
6. Link to the public corrections log where useful.

### Visual treatment

To avoid confusion with Why It Matters and Under the Radar:

- Paper or very light neutral field.
- Rule Gray border or divider.
- Signal Red may be used for the label only.
- No Warm Wash full box by default.
- No alert icon.
- No alarm-style red background.

### Tone

Direct, specific, and non-defensive.

## 21. Friday Recap Component

**Conditional on Friday.**

### Current form

Until the future Friday product is specified:

- Label: `THIS WEEK IN AUSTIN`
- Maximum: 3 concise items.
- Explain what changed across the week.
- Do not repeat five days of headlines.
- Use restrained Rule Gray separation.
- Use source links as required.

### Visual treatment

Remain part of the standard edition.

Do not introduce a separate Friday brand system yet.

## 22. Footer Component

**Required.**

### Purpose

Close the publication with identity, subscription control, and utility links.

### Background

Charcoal `#181818`.

### Anatomy

1. Reversed compact ADB mark.
2. Short receiving-context sentence.
3. Prominent `Pause or unsubscribe` control.
4. Utility links.

Suggested utility links:

- Visit the website.
- Customize.
- Feedback & corrections.
- Corrections log.
- Privacy.
- Terms.

### Pause or unsubscribe

This is the primary footer CTA.

Treatment:

- Signal Red background.
- Paper/white text.
- Large enough tap target.
- Approximately 44px minimum target height.
- Clear wording.

Do not obscure or de-emphasize exit controls.

### Footer copy

Use muted paper/gray text with sufficient contrast.

Keep legal language concise.

## 23. Buttons

Buttons should be rare.

Use buttons for reader action, not article navigation.

Primary button treatment:

- Signal Red background.
- Paper text.
- Condensed information face/fallback.
- Comfortable padding.
- Minimal or no corner rounding beyond the Design System range.

Article sources remain text links.

## 24. Dividers and Section Boundaries

Default divider:

`1px solid #DEDAD1`

Use dividers to organize reading rhythm, not to box every component.

Reserved Signal Red rules:

- Austin Pulse left rule.
- Why It Matters left rule.
- Under the Radar top rule.
- Selected brand/CTA accents.

Do not add new red-rule semantics casually.

## 25. Empty and Omitted States

Component behavior must be predictable.

| Component | Behavior when no content qualifies |
|---|---|
| Austin Pulse | Still required; summarize the edition honestly |
| Weather | Required |
| Top Stories | Production should not normally send a standard issue with no qualified Top Stories; use production safety rules |
| Under the Radar | Omit completely |
| More for You | Omit if no eligible personalized item |
| Austin Ahead | Show approved empty state |
| Friday recap | Omit if not Friday or if no meaningful weekly arc is available |
| Corrections | Omit unless required |

Never create weak content solely to avoid an empty visual space.

## 26. Plain-Text Newsletter

The plain-text edition must preserve the same editorial content and destination order as HTML.

### Recommended structure

Use simple text hierarchy:

```text
AUSTIN DAILY BRIEFING
Sunday, September 20, 2026

AUSTIN PULSE
...

WEATHER
...

FEATURED TOP STORY
Headline
Austin · Housing · Government + Independent

Summary...

WHY IT MATTERS
...

Source: Publisher
https://...

AUSTIN AHEAD

PLAN · MON
Item title
Description...
Event details: Organizer
https://...
```

### Requirements

- Same story order.
- Same source destinations.
- Same publisher names.
- Same Austin Ahead taxonomy.
- Same corrections.
- No decorative ASCII art.
- No raw HTML.
- Do not omit Why It Matters from plain text when present in HTML.

## 27. Responsive Behavior

### Narrow screens

At approximately 520px and below:

- Exterior canvas padding may drop to zero.
- Content padding becomes about 22px.
- Featured headline reduces modestly.
- Austin Pulse remains readable with its red rule.
- Weather stacks vertically.
- Austin Ahead date/action labels remain above or adjacent to titles without crowding.
- Source links wrap as units.
- Footer buttons expand toward full available width.
- Masthead remains proportional.

### Very narrow screens

At approximately 360–390px:

- Avoid multi-column content entirely.
- Allow metadata to wrap naturally.
- Do not compress headline size below readable hierarchy.
- Use vertical stacking rather than shrinking tap targets.

## 28. Dark Mode Resilience

Email clients may alter backgrounds and text.

Implementation should:

- Test Paper and Charcoal surfaces in major clients.
- Prefer explicit background colors on important containers.
- Use the reversed footer mark designed for Charcoal.
- Avoid relying on subtle warm-gray differences alone.
- Keep Signal Red meaningful even when colors shift.
- Ensure text remains readable if colors are partially inverted.

Do not embed critical body text in images as a dark-mode workaround.

## 29. Image-Blocked State

When images are blocked:

- Masthead alt text must identify the publication.
- Edition date remains visible.
- All editorial content remains available.
- Footer must still identify ADB in text even if the compact mark is hidden.
- No content meaning should depend solely on an image.

## 30. Accessibility Requirements

Every production component must support:

- Logical reading order.
- Semantic headings where email-client compatibility permits.
- Useful alt text.
- Underlined text links.
- Sufficient contrast.
- Minimum approximately 16px body text.
- Tap targets approximately 44px where practical.
- No color-only meaning.
- No taxonomy conveyed by color alone.
- Readable line lengths.
- No forced horizontal scrolling.

Austin Ahead labels must literally contain `GO`, `WATCH`, or `PLAN`; color cannot be the only indicator.

## 31. Content-Length Guardrails

These are layout guardrails, not editorial quotas.

### Austin Pulse

Aim for approximately 45–90 words.

### Weather practical detail

Usually one or two short sentences.

### Featured summary

Normally one compact paragraph.

### Standard Top Story summary

Normally one compact paragraph.

### Why It Matters

Follow Editorial System subscriber depth:

- Brief: one sentence.
- Standard: one or two sentences.
- Detailed: two or three sentences when justified.

### Austin Ahead description

Aim for one or two short sentences.

### Footer

Keep receiving-context copy to one compact paragraph.

If content materially exceeds these ranges, the renderer should not truncate automatically. Editorial generation should be corrected upstream.

## 32. Component QA Checklist

Before implementation promotion, verify each component against the following.

### Identity

- Approved masthead asset.
- Correct aspect ratio.
- Correct alt text.
- Reversed footer mark.
- No remote-font dependency for marks.

### Structure

- Correct standard edition order.
- Featured story distinct from remaining Top Stories.
- Under the Radar omitted when absent.
- Austin Ahead always present.
- Friday recap only when applicable.

### Why It Matters

- Warm Wash field.
- Signal Red left rule.
- Label visible.
- Not confused with Under the Radar.

### Under the Radar

- Strong top rule.
- Distinct outer field.
- Nested Why It Matters still visually legible.

### Austin Ahead

- Exactly one taxonomy label per item.
- GO/WATCH/PLAN readable without color.
- Dates readable.
- Empty state supported.
- No generic `Events` section label.

### Sources

- Publisher-named.
- Link Red.
- Underlined.
- At least 16px.
- HTML/plain-text URL parity.
- Weather and event labels use functional wording.

### Footer

- Reversed mark.
- Pause/unsubscribe prominent.
- Utility links readable.
- Controls comfortably tappable.

### Responsive

- Gmail desktop.
- Gmail mobile.
- Outlook/Hotmail.
- Yahoo.
- Narrow mobile viewport.
- Image-blocked test.
- Dark-mode review where available.

## 33. Implementation Boundary

This specification does not authorize direct production replacement of the current renderer.

Implementation should proceed through:

1. Approved component specification.
2. Fresh implementation branch from current `main`.
3. Durable approved brand assets added to the repository.
4. Static HTML/plain-text preview.
5. Controlled QA send.
6. Major-client review.
7. Corrections from QA.
8. Production release checklist.
9. Explicit production promotion.

Do not revive or merge the superseded newsletter redesign branch as the production implementation.

Useful code or assets from the superseded branch may be selectively reintroduced only after comparison with current canonical specifications.

## 34. Component Status

| Component | Status |
|---|---|
| Frame / 620px shell | Established |
| Masthead | Established |
| Edition date | Established |
| Austin Pulse | Established |
| Weather | Established |
| Featured Top Story | Established |
| Standard Top Story | Established |
| Why It Matters | Established |
| Source area | Established |
| Under the Radar | Established |
| More for You | Established |
| Austin Ahead | Established |
| GO / WATCH / PLAN | Established |
| Friday recap | Current interim treatment |
| Friday expanded Austin Ahead | Future specification |
| Corrections notice | Proposed in this specification |
| Hidden preheader | Proposed / optional |
| Footer | Established |
| Dark-mode implementation details | To be validated in QA |

## 35. Governance

Once approved, this file becomes the canonical implementation specification for ADB newsletter components.

A formal revision is required when changing:

- Component order.
- Component required/optional status.
- Story anatomy.
- Why It Matters construction.
- Under the Radar construction.
- Austin Ahead construction or taxonomy.
- Masthead usage.
- Footer control hierarchy.
- Corrections notice behavior.
- Plain-text parity requirements.
- Major responsive behavior.

Minor client-specific CSS repairs may be made without a specification revision when they preserve the intended component behavior.

## 36. Newsletter Component Standard in One Sentence

> **Each ADB newsletter component should communicate one clear editorial function, fit naturally into a continuous reading flow, survive ordinary email-client degradation, and remain recognizably ADB without relying on decorative complexity.**

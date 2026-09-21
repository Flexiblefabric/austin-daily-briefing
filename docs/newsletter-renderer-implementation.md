# Newsletter Renderer v0.1 — Implementation Record

**Status:** Staging / controlled QA  
**Branch:** `newsletter-renderer-v0-1`  
**Production impact:** None  
**Canonical component specification:** `docs/newsletter-component-spec.md`

## Purpose

This branch is the fresh implementation path for the approved ADB newsletter identity and component system. It intentionally replaces the superseded PR #13 implementation path rather than rebasing or reviving that branch.

The current production delivery path already sends complete HTML and plain-text payloads stored in `Outbound Messages`. Resend transport does not render the briefing; it transmits the payload created upstream. Therefore renderer promotion requires two coordinated changes:

1. Prove the approved HTML/plain-text component treatment in controlled email-client QA.
2. Update the morning briefing generation instructions to produce payloads that conform to the canonical newsletter component specification.

The production prompt must not be changed until controlled QA passes.

## Phase 1 — Staged in this branch

### Approved brand assets

`assets/brand/` contains the current production-ready asset package imported from ADB DEV Drive:

- `adb-masthead.svg`
- `adb-masthead.png`
- `adb-masthead@2x.png`
- `adb-mark.svg`
- `adb-mark.png`
- `adb-mark@2x.png`
- `adb-mark-reversed.svg`
- `adb-mark-reversed.png`
- `adb-mark-reversed@2x.png`

The email QA payload uses the 2× PNG assets at controlled CSS display sizes. SVGs remain the canonical vector masters.

### Static reference payload

- `design/newsletter-renderer-qa.html`
- `design/newsletter-renderer-qa.txt`

The sample is explicitly marked `CONTROLLED COMPONENT QA · NOT A LIVE EDITION`.

It exercises:

- Masthead and edition date.
- Austin Pulse.
- Weather.
- Featured Top Story.
- Standard Top Stories.
- Why It Matters.
- Under the Radar using the approved header-band interaction.
- More for You.
- Austin Ahead with GO, WATCH, and PLAN.
- Corrections treatment.
- Footer and reader controls.
- HTML/plain-text destination parity.

The sample is intentionally illustrative and is not a current-news edition.

### Controlled Apps Script harness

`apps-script/NewsletterRendererQa.gs` provides:

- `validateNewsletterRendererV01()` — read-only preflight.
- `sendNewsletterRendererQaV01()` — manual controlled send.

The send function:

- Does not write Outbound Messages.
- Does not write Briefing History.
- Does not create a trigger.
- Does not alter daily production mode.
- Uses the existing Resend transport helper.
- Sends only to addresses in the `ADB_NEWSLETTER_RENDERER_QA_ALLOWLIST` Script property.
- Uses a stable QA idempotency key per recipient.

## Asset-integrity verification

The staged brand files were rechecked against the current ADB DEV package before controlled QA:

- Masthead SVG/PNG/2× PNG: byte-for-byte match.
- Standard compact mark SVG/PNG/2× PNG: byte-for-byte match.
- Reversed compact mark SVG/PNG/2× PNG: byte-for-byte match.
- The current outlined-export package is authoritative for the vector masters; older duplicate Drive exports are not used as the comparison source.

## Automated preflight already checked in repository staging

The staged HTML/plain-text sample currently passes:

- HTML length below 45,000 characters.
- Plain-text length below 45,000 characters.
- 20 HTML destinations.
- 20 plain-text destinations.
- Exact destination-order parity.
- Required component marker presence.
- Approved Under the Radar header-band markers.
- Approved Why It Matters treatment markers.

This repository check does not replace actual email-client QA.

## Controlled QA — first client review

The first controlled send completed successfully and rendered well across the tested clients. The following findings were recorded:

### Passed without material defect

- Masthead rendered correctly on desktop and mobile.
- Austin Pulse rule and typography held.
- Featured Top Story hierarchy was clear.
- Why It Matters and Under the Radar interacted as intended.
- More for You flowed naturally from the shared stories.
- Source links worked where correctly targeted.
- Image-blocked rendering remained usable.
- Dark mode remained legible.
- Pause/unsubscribe and the other valid footer controls worked.

### Refinements required before QA PASS

1. Center the footer content and controls.
2. Replace the incorrect `/feedback.html` destination with the live Feedback & Corrections Google Form.
3. Stack the Weather copy and temperature into full-width mobile rows so the headline is not squeezed.
4. Make the More for You orientation descriptor required and explicitly tie the section to saved interests.
5. Add an Austin Ahead orientation descriptor.
6. Clarify that GO / WATCH / PLAN are mutually exclusive per item, not quotas across the section. Multiple items may share one label.
7. Run a second controlled send after these changes.

The second QA harness uses a new idempotency key (`newsletter-renderer-v0-1-qa-r2`) so the revised message can be delivered to the same controlled inboxes without colliding with the first Resend QA send.

## Phase 2 — Controlled email-client QA

After the branch is reviewed:

1. Add `NewsletterRendererQa.gs` to the production Apps Script project without replacing `ResendTransport.gs`.
2. Set `ADB_NEWSLETTER_RENDERER_QA_ALLOWLIST` to controlled test addresses only.
3. Run `validateNewsletterRendererV01()`.
4. Require a clean validation result.
5. Run `sendNewsletterRendererQaV01()` once.
6. Review the exact received message in:
   - Gmail desktop.
   - Gmail mobile.
   - Outlook/Hotmail.
   - Yahoo.
   - Narrow mobile viewport.
   - At least one dark-mode view where available.
   - Image-blocked state where practical.
7. Record rendering defects before any production change.

## Phase 3 — Renderer integration

Only after Phase 2 passes:

1. Merge approved durable brand assets to `main`.
2. Replace branch-specific raw asset URLs with durable `main` asset URLs.
3. Update the canonical morning briefing automation prompt so:
   - `ISSUE STRUCTURE` uses the current Editorial System names and order.
   - `EMAIL FORMAT` requires conformance with `docs/newsletter-component-spec.md`.
   - `Things to Do / Keep an Eye On` is replaced by `Austin Ahead`.
   - Under the Radar uses the header-band treatment.
   - Why It Matters uses the canonical Warm Wash + Signal Red left-rule treatment.
   - Footer reader controls and source-link behavior remain intact.
4. Run a controlled queue-path briefing generation for an approved test profile.
5. Validate the generated `Outbound Messages` HTML/plain text before dispatch.
6. Send through the normal Resend controlled daily path.
7. Compare received production-path QA against the static reference payload.

## Phase 4 — Production promotion

Production promotion requires:

- Controlled renderer QA PASS.
- Controlled queue-path QA PASS.
- Major-client review PASS.
- HTML/plain-text destination parity PASS.
- No subscriber eligibility or queue semantics changed.
- Release checklist completed.
- Explicit promotion approval.

The transport dispatcher should remain unchanged unless QA exposes a transport-specific defect. The renderer redesign is primarily a payload-generation change, not a Resend transport change.

## Rollback

If production rendering fails after promotion:

- Pause the new payload-generation instructions.
- Restore the last known-good morning briefing prompt from GitHub.
- Do not roll back subscriber data, Resend transport, or queue/history state unless a separate defect is found there.
- Existing sent messages are immutable; corrections follow normal ADB corrections policy when content, rather than styling, was affected.


## Welcome email controlled QA

The current production welcome email should be reviewed separately from the daily briefing renderer before any welcome-template redesign is proposed.

`apps-script/WelcomeEmailQa.gs` provides:

- `validateWelcomeEmailQaV1()` — read-only validation of the current production welcome HTML and plain text.
- `sendWelcomeEmailQaV1()` — manual, allowlisted Resend delivery of that same current production welcome template.

Safety characteristics:

- No Outbound Messages writes.
- No Briefing History writes.
- No subscriber-state changes.
- No delivery-mode changes.
- No triggers.
- No production welcome template changes.
- Requires `ADB_WELCOME_QA_ALLOWLIST` Script property.

This test intentionally sends the existing production welcome template as-is so client rendering, links, hierarchy, and branding can be evaluated before deciding whether the welcome experience should be redesigned to match the new newsletter identity.


## Welcome redesign staged for QA

A redesigned welcome message is staged for controlled review:

- `design/welcome-email-qa.html`
- `design/welcome-email-qa.txt`
- `validateWelcomeRedesignQaV1()`
- `sendWelcomeRedesignQaV1()`

The redesign uses the approved masthead and centered Charcoal footer, preserves the live Customize / Manage / Feedback / Terms / Privacy destinations, and keeps HTML/plain-text destination order identical.

Two copy adjustments were made to avoid publishing claims that conflict with current production behavior:

1. The draft phrase `Every morning at 9 a.m.` is rendered as `Each morning` because the current canonical generation schedule is 08:00 America/Chicago. If the product schedule is intentionally changed to 09:00, the welcome copy should be revised together with the production schedule.
2. The draft `Local` promise is rendered as `Austin-first` because shared coverage is local, while personalized More for You interests can legitimately include broader U.S. or global material under the active interest catalog.

Current QA preflight:
- HTML: 8,574 characters.
- Plain text: 1,910 characters.
- 6 destinations in each format.
- Exact destination-order parity: PASS.
- Required welcome, masthead, footer, customization, and feedback markers: PASS.

The staged redesign is QA-only and does not modify `adbWelcomeHtml_`, `adbWelcomePlainText_`, Message Templates, queue behavior, or live Welcome delivery.

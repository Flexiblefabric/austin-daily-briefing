# Austin Daily Briefing Design System

**Version:** 0.1  
**Status:** Approved design direction; implementation in progress  
**Creative principle:** **Serious about the facts. Alive to Austin.**  
**Canonical path:** `docs/design-system.md`

## 1. Purpose

The Austin Daily Briefing Design System defines the visual language used across ADB's reader-facing products, including the newsletter, website, issue/archive pages, transactional email, social/share graphics, and future ADB products.

Its purpose is not simply to make ADB attractive. The system should make the publication immediately recognizable, reduce the effort required to understand each edition, reinforce editorial credibility, and create continuity across every surface where a reader encounters ADB.

The newsletter and website do not need to look identical. They should clearly look as though they were produced by the same publication.

> **A reader should finish ADB feeling caught up, not feeling that they have been given another reading assignment.**

The design must make it easy to recognize the publication, understand what deserves attention, skim when time is limited, distinguish fact from explanation, identify sources, understand personalization, find practical information quickly, and control or leave the service without friction.

## 2. Design Character

ADB should feel editorial, contemporary, serious, human, local, efficient, confident, and accessible.

It should not resemble a municipal website, corporate marketing newsletter, technology dashboard, lifestyle blog, or nostalgia-driven newspaper replica. The target is a modern local briefing with a distinct identity and strong information hierarchy.

## 3. Core Identity

### Primary masthead

The horizontal masthead is the principal expression of the ADB identity.

It uses:

- `AUSTIN` in uppercase Newsreader.
- A signal-red vertical divider.
- `DAILY` and `BRIEFING.` stacked and left aligned in IBM Plex Sans Condensed.
- A signal-red terminal period after `BRIEFING`.

The descriptor block should visually approximate the visible height of `AUSTIN`.

**Status:** established. The approved masthead is the canonical identity mark. Production exports must preserve its approved typography, optical spacing, proportions, and color treatment.

The divider must remain fully inside the optical gap and must never touch either word block. Preserve generous clear space. Do not stretch, compress, restack, rotate, decorate, or recolor the mark arbitrarily.

Preferred background treatments are Paper with Charcoal lettering and Charcoal with Paper lettering.

### Compact mark

The compact mark is uppercase `ADB` in Newsreader inside a charcoal circle with a short signal-red underline. There is no period.

Use it for favicons, avatars, narrow mobile placements, social profiles, and compact utility surfaces.

The newsletter footer uses the reversed compact mark: paper-white ring and letters on a transparent field, retaining the signal-red underline against the charcoal footer.

Do not use the compact mark as a substitute for the primary masthead where the full name fits comfortably.

## 4. Brand Recognition

ADB should become recognizable through repetition of a small number of cues:

1. The primary masthead.
2. Newsreader editorial typography.
3. IBM Plex Sans Condensed information typography.
4. Charcoal and warm Paper.
5. Controlled Signal Red.
6. The distinctive Why It Matters component.
7. The distinctive Under the Radar section.
8. Consistent section labels.
9. Strong spacing and typographic hierarchy.
10. Publisher-named source links.

A mature implementation should remain recognizable even when the masthead is outside the viewport.

## 5. Color System

| Token | Value | Primary use |
|---|---|---|
| Charcoal | `#181818` | Primary type, dark surfaces, footer |
| Paper | `#FFFEFA` | Primary reading surface |
| Signal Red | `#DB2D2D` | Brand accent |
| Supporting Gray | `#68635A` | Metadata and secondary information |
| Rule Gray | `#DEDAD1` | Rules, separators, subtle borders |
| Warm Wash | `#F2EFE8` | Why It Matters and editorial callouts |
| Link Red | `#8F1717` | Accessible text links |
| Canvas | `#ECE9E2` | Optional exterior preview/web surface |

Signal Red is intentionally scarce. Use it for the masthead divider and punctuation, selected section cues, identity details, and primary calls to action. Do not use it for large bodies of text or decorative saturation.

Links on light backgrounds should generally use Link Red and visible underlining.

## 6. Typography

### Editorial voice — Newsreader

Use Newsreader for the masthead, major headlines, featured story headlines, Austin Pulse, the compact mark, and selected display text.

Preferred web stack:

`Newsreader, Georgia, serif`

For email delivery, use a reliable serif fallback such as:

`Georgia, "Times New Roman", serif`

The final masthead should be delivered as a production asset so exact branding does not depend on remote font loading.

### Information voice — IBM Plex Sans Condensed

Use IBM Plex Sans Condensed for section labels, dates, geography, topic metadata, navigation, utility information, buttons, compact labels, and date markers.

Preferred stack:

`"IBM Plex Sans Condensed", "Arial Narrow", Arial, sans-serif`

### Reading face

Email body copy should prioritize rendering reliability:

`Arial, Helvetica, sans-serif`

The website may use a complementary high-legibility sans-serif, but it should not compete with Newsreader.

### Typography by role

| Role | Typical size | Typical line height |
|---|---:|---:|
| Featured headline | 29–32px | 1.08–1.15 |
| Story headline | 22–25px | 1.14–1.20 |
| Austin Pulse | 19–22px | 1.40–1.50 |
| Weather main | 23–26px | 1.15–1.25 |
| Body summary | 16–17px | 1.50–1.60 |
| Why It Matters | 16px | 1.50–1.55 |
| Section label | 13–14px | 1.20 |
| Metadata | 12–13px | 1.30 |
| Source link | at least 16px | about 1.40 |

Body copy should not fall below 16px for standard editorial reading.

## 7. Spacing and Rhythm

Use a simple spacing scale built around approximately:

`4 / 8 / 12 / 16 / 24 / 32 / 48 / 64px`

The current reference newsletter uses approximately:

- 42px above and below standard major sections on desktop.
- 46px around Under the Radar.
- 34px major-section spacing on narrow mobile screens.

Stories grouped within a section should be tighter than major section breaks.

A section break should feel stronger than a paragraph break.

## 8. Newsletter Frame

The standard newsletter is single-column and approximately 600–620px wide.

Preferred content padding:

- Desktop: about 32–36px.
- Mobile: about 20–24px.

The email must not depend on scripts, forms, absolute positioning, hover states, fragile CSS, or remote font loading.

The publication should remain readable and recognizable if images are blocked.

## 9. Website Frame

The website may use a wider shell, approximately 1100–1200px where appropriate, while maintaining a narrower editorial reading column, generally about 680–760px.

The website should share the same masthead, typography roles, palette, spacing rhythm, section-label language, Why It Matters treatment, source-link philosophy, and footer identity.

The website and newsletter are siblings, not clones.

## 10. Section Labels

Section labels use IBM Plex Sans Condensed or a reliable fallback, usually uppercase with controlled letter spacing.

Examples:

- `AUSTIN PULSE`
- `WEATHER`
- `TOP STORIES`
- `UNDER THE RADAR`
- `MORE FOR YOU`
- `AUSTIN AHEAD`

Labels should normally use Charcoal or Link Red according to placement and should never overpower the story headline.

## 11. Standard Story Anatomy

Standard ADB editorial stories follow this sequence:

> **Headline → Metadata → Summary → Why It Matters → Sources**

### Headline

Editorial serif, unlinked, concrete, and visually dominant.

### Metadata

Condensed sans-serif, used to orient rather than decorate.

A typical pattern may include:

`Austin · Housing · Government + Independent`

Avoid excessive badges or metadata clutter.

### Summary

Standard body copy.

The summary answers:

> **What happened?**

### Why It Matters

Distinct explanatory component.

It answers:

> **What changes because of it?**

### Sources

Publisher-named links, visibly separate from ADB-written editorial text.

## 12. Why It Matters

Why It Matters is a defining feature of ADB and a primary recognition device.

Its purpose is to separate factual summary from consequence and context.

### Visual treatment

The canonical treatment combines:

- Warm Wash background `#F2EFE8`.
- A Signal Red left rule, generally 3–4px.
- Comfortable internal padding, approximately 14–18px.
- The label in IBM Plex Sans Condensed.
- Body copy in the standard reading face.

The component should feel embedded in the story rather than like an alert.

It must not resemble a warning banner, advertisement, pull quote, opinion box, or CTA.

The design intent is:

> ADB has finished telling the reader what happened. This component explains the practical significance.

## 13. Featured Top Story

The first Top Story receives greater visual prominence through a larger headline and increased spacing.

Featured Top Story is a **presentation distinction**, not a separate editorial scoring lane.

It should not automatically receive an oversized image, heavy card treatment, or decorative spectacle.

## 14. Top Stories

Top Stories should use a continuous editorial flow rather than a stack of heavily boxed cards.

Separate stories through spacing, typography, and thin Rule Gray dividers.

The section should feel like a publication, not a dashboard.

## 15. Under the Radar

Under the Radar has a distinct editorial role and a distinct visual identity.

Because it may not appear in every edition, its presence should be immediately recognizable and intentional.

### Visual treatment

Use:

- Warm Wash or an approved neutral field.
- A strong Signal Red top rule, generally 4–5px.
- Increased internal padding.
- `UNDER THE RADAR` label in Charcoal.
- Standard ADB story hierarchy inside the section.

Why It Matters remains distinct inside Under the Radar through its red left rule and inset treatment.

### Empty behavior

If Under the Radar does not qualify editorially, omit the section entirely. Do not manufacture an empty-state message and do not backfill it with a rejected headline candidate.

## 16. Austin Pulse

Austin Pulse orients the reader to the shape of the edition.

It is not a table of contents and is not an independently scored content lane.

Use:

- Editorial serif.
- Slightly larger size than body copy.
- Signal Red left rule.
- No bullets or numbered headlines.

It should remain concise and occupy relatively little vertical space.

## 17. Weather

Weather is utility information.

Prioritize what conditions will feel like, meaningful hazards or disruptions, and what the reader may need to do.

On wider layouts, weather may use a two-column treatment with primary conditions and temperature. Stack vertically on narrow screens.

Large weather numerals may use IBM Plex Sans Condensed.

Avoid decorative weather imagery when typography communicates the information more efficiently.

## 18. More for You

More for You is personalized but remains visually part of ADB.

Use the standard section label and a somewhat lighter hierarchy than Top Stories.

A brief introduction such as `Selected from your saved interests.` may appear when useful.

Do not turn the section into a separate algorithmic-feed aesthetic.

Personalization affects this section only and should never visually imply that the shared civic core is individualized.

## 19. Austin Ahead

`Austin Ahead` replaces the previous reader-facing label `Things to Do / Keep an Eye On`.

### Editorial promise

Austin Ahead is a short, practical look at upcoming Austin-area events, openings, deadlines, disruptions, decisions, and other near-term developments worth attending, planning around, or watching.

It is a near-term utility layer rather than a generic events list.

### Daily presence

Austin Ahead appears in every standard daily edition.

It must follow the same repetition, sourcing, and freshness disciplines established elsewhere. Always appearing does not authorize filler.

When there are no qualifying useful items after those rules are applied, use a concise honest empty state rather than weakening standards.

Recommended pattern:

> **No major Austin Ahead items to flag today.**

### Time horizon

Prioritize the next 7 days, with flexibility to include an item slightly farther out when advance planning is genuinely useful.

### Taxonomy

Each item receives exactly one mutually exclusive action label:

- **GO** — something the reader can attend, visit, experience, or participate in.
- **WATCH** — something consequential that is approaching but primarily requires awareness rather than action.
- **PLAN** — something that may require preparation, registration, rerouting, scheduling, or another practical adjustment.

If more than one could apply, select the label based on the primary reason the item is useful to the reader.

Labels should be visually subordinate to the item title, using IBM Plex Sans Condensed and restrained metadata styling rather than colorful app-style badges.

### Visual anatomy

Recommended item sequence:

> **GO / WATCH / PLAN · DATE**  
> **Item title**  
> Short utility description  
> Event/source link

Date markers may use IBM Plex Sans Condensed with selective Signal Red.

### Friday

A future Friday edition will expand Austin Ahead into a distinct Friday section. That future treatment is intentionally out of scope for Design System v0.1 and requires its own specification before implementation.

## 20. Friday Recap

The current standard Friday recap remains visually connected to the normal edition and should not become a second newsletter inside the newsletter.

Use one section label, restrained rules, and no more than a few concise recap items.

The future expanded Friday Austin Ahead product is separate from this rule.

## 21. Source Presentation

Source presentation is part of the ADB identity.

Headlines remain unlinked.

Canonical editorial source pattern:

`Source: [Publisher] →`

Weather:

`Forecast: National Weather Service →`

Austin Ahead event item:

`Event details: [Organizer or Venue] →`

Source links should be publisher-named, underlined, at least 16px in email, comfortably tappable, and high contrast.

Do not rely on raw URLs, generic `Read more`, tiny source badges, linked headlines, or color alone.

The existing `docs/source-link-standard.md` remains the detailed production authority for source-link behavior.

## 22. Source-Type Metadata

Reader-facing source-type language should favor clarity:

- `Government`
- `Independent`
- `Government + Independent`

Compact abbreviations such as `G`, `I`, or `G+I` may remain useful internally or in constrained layouts, but publisher attribution is always required.

## 23. Buttons and Calls to Action

Use buttons sparingly.

Primary CTA treatment:

- Signal Red background.
- Paper/white text.
- IBM Plex Sans Condensed.
- Comfortable vertical padding.
- Restrained corner radius.

Appropriate examples include:

- `Join ADB`
- `Customize My Briefing`
- `Pause or Unsubscribe`

Routine editorial sources remain text links.

## 24. Footer

The newsletter footer uses a Charcoal background as the visual closing signature.

Recommended order:

1. Reversed compact ADB mark.
2. Short explanatory line.
3. Prominent pause/unsubscribe control.
4. Utility links such as website, customization, feedback/corrections, privacy, and terms.

Reader control should be obvious and easy.

The footer should not become dense with legal text.

## 25. Rules, Borders, and Containers

Default divider:

`1px solid #DEDAD1`

Signal-red rules are reserved for components with defined editorial meaning, including Austin Pulse, Why It Matters, and Under the Radar.

Avoid unnecessary card borders, heavy shadows, large rounded rectangles, and decorative containment.

Containment should communicate function.

## 26. Corners and Shadows

ADB is not a heavily card-based system.

Typical border radius should remain restrained, approximately 4–8px where used.

Strong shadows should rarely appear inside editorial surfaces.

A subtle page shadow is acceptable for an email preview displayed against an exterior Canvas background.

## 27. Imagery

ADB is text-first and must function fully without images.

Appropriate uses include:

- Brand assets.
- Maps when geography matters.
- Simple charts or diagrams.
- Properly licensed photography.
- Editorial illustration clearly presented as illustration.
- Event artwork where permitted and genuinely useful.

Avoid generic stock imagery, repeated skyline decoration, oversized hero images, unlicensed/hotlinked news photography, and daily decorative AI imagery that could be mistaken for documentary photography.

## 28. Austin Visual Identity

ADB should feel like it belongs to Austin without relying on tourist clichés.

Do not make bats, guitars, Texas flags, cowboy imagery, or skyline silhouettes primary identity devices.

More subtle local influences may include street-grid geometry, limestone and warm natural tones, transit/cartographic structures, civic wayfinding, neighborhood maps, and infrastructure diagrams.

ADB should look like it belongs to Austin rather than like it is advertising Austin.

## 29. Iconography

Icons should be rare and functional.

Preferred style:

- Simple.
- Geometric.
- Single-color.
- Restrained outline or fill.

Do not create a decorative icon for every section or replace clear labels with ambiguous symbols.

## 30. Data Visualization

Charts and diagrams should use the same visual language:

- Paper background.
- Charcoal text.
- Rule Gray structure.
- Signal Red for one meaningful highlight.
- Limited visual categories.
- Direct labels where possible.
- No unnecessary gradients, 3D effects, or decorative shadows.

A visualization should answer a specific reader question and should not take longer to understand than the prose it replaces.

## 31. Transactional Email

Welcome, confirmation, subscription-change, and related messages use a simplified version of the ADB system.

They should share the masthead or compact mark, Paper background, Charcoal text, Signal Red CTA, compatible information typography, and the dark footer.

Transactional mail does not need the full editorial section system.

## 32. Social and Sharing Assets

Recommended default social-card size:

**1200 × 630px**

Use Paper or Charcoal as the dominant field, a prominent masthead or compact mark, and restrained Signal Red.

Avoid filling share graphics with small article text.

A social preview should look like ADB before the viewer reads the domain.

## 33. Favicons and Avatars

Use the compact ADB mark.

It must remain recognizable at very small sizes.

Do not add secondary text.

The Signal Red underline should remain visible where resolution permits.

## 34. Accessibility

Accessibility is part of the design system.

Requirements include:

- Strong contrast.
- At least approximately 16px body text for editorial reading.
- Visible focus states on the website.
- Underlined links.
- No color-only communication.
- Descriptive alt text.
- Logical heading order.
- Keyboard-accessible navigation.
- Reduced-motion support.
- Adequate touch targets.
- Comfortable line lengths.
- Adequate spacing between controls.

Primary masthead alt text:

`Austin Daily Briefing`

Compact-mark alt text when nearby text does not already identify the publication:

`ADB`

## 35. Dark Mode and Email Resilience

Email design must assume some clients will alter colors.

Identity cannot depend on subtle background contrast alone.

Maintain tested light and reversed assets. Avoid image-based body text. Keep text fallbacks for critical identity information.

## 36. Responsive Behavior

Mobile is a primary environment.

At narrow widths:

- Reduce horizontal padding.
- Stack weather vertically.
- Scale headlines modestly.
- Keep Austin Ahead items readable.
- Let source links wrap as complete units.
- Retain Why It Matters padding and red rule.
- Retain Under the Radar top-rule identity.
- Keep the masthead centered and undistorted.

Nothing essential should require horizontal scrolling.

## 37. Motion

The newsletter contains no motion.

Website motion should be rare, nonessential, restrained, and compatible with `prefers-reduced-motion`.

Do not use looping decorative animation as a core brand device.

## 38. Standard Edition Hierarchy

The standard edition follows this visual hierarchy:

1. Masthead.
2. Edition date.
3. Austin Pulse.
4. Weather.
5. Featured Top Story.
6. Remaining Top Stories.
7. Under the Radar when warranted.
8. More for You.
9. Austin Ahead.
10. Friday recap when applicable.
11. Charcoal footer.

Why It Matters appears within applicable stories rather than as an independent section.

## 39. Professional Standards as Identity

ADB's visual identity should reinforce predictable editorial behavior.

Readers should come to recognize that ADB:

- Shows who supplied the information.
- Separates summary from consequence.
- Clearly identifies personalization.
- Distinguishes special discoveries.
- Uses predictable story anatomy.
- Provides corrections and feedback access.
- Makes subscription controls visible.
- Does not manufacture content solely to fill a visual slot.

Professional standards are part of the brand.

## 40. Cross-Surface Consistency

| Element | Requirement |
|---|---|
| Masthead | Same approved structure |
| Compact mark | Same approved structure |
| Palette | Same core tokens |
| Type roles | Same editorial/information distinction |
| Signal Red | Same restrained role |
| Why It Matters | Same warm field + red rule identity |
| Under the Radar | Same recognizable special-section treatment |
| Section labels | Same typographic vocabulary |
| Source links | Same publisher-first philosophy |
| Austin Ahead | Same name and GO/WATCH/PLAN taxonomy |
| Buttons | Same primary CTA language |
| Footer | Same dark closing identity |
| Spacing | Same overall rhythm |
| Tone | Same visual seriousness and warmth |

Exact CSS does not need to match. The visual language does.

## 41. Anti-Patterns

Avoid drift toward:

- Excessive cards.
- Large fields of brand red.
- Too many icons.
- Gradients.
- Decorative shadows.
- Tiny metadata.
- Oversized hero photography.
- Generic startup illustrations.
- Heavy rounded app interfaces.
- Multi-column email layouts.
- Municipal-document formatting.
- Marketing-style urgency.
- Clickbait styling.
- Competing accent colors.

## 42. Production Assets

Before full production adoption, the identity set should include:

- Primary masthead, light version.
- Primary masthead, reversed version if needed.
- Compact mark.
- Reversed compact mark.
- Self-contained SVG masters.
- Production PNG exports for email.
- Favicon variants.
- Social/avatar variants.
- Social-preview template.
- Email-safe fallbacks tested without custom fonts.

Canonical asset files should be stored centrally and reused rather than recreated by individual surfaces.

## 43. Design QA

Major visual changes should be reviewed for:

- Brand consistency.
- Headline hierarchy.
- Mobile readability.
- Link visibility.
- Why It Matters recognition.
- Under the Radar distinction.
- Austin Ahead taxonomy and readability.
- Source attribution.
- Fallback-font behavior.
- Image-disabled behavior.
- Dark-mode resilience.
- Touch-target size.
- Contrast.
- Footer controls.
- Website/newsletter continuity.

Newsletter changes should also be tested in supported major email clients before promotion.

## 44. Governance

This file is the canonical source for reader-facing ADB design after approval.

The design system defines **intent**. Implementation files define **mechanics**.

Compatibility fixes, CSS adjustments, and spacing repairs do not require a design-system revision when they preserve the same intended reader experience.

A formal revision is warranted when changing the brand palette, primary type roles, masthead structure, compact mark, Why It Matters identity, Under the Radar identity, Austin Ahead identity or taxonomy, core newsletter hierarchy, major accessibility standards, or the relationship between website and email design.

## 45. Component Status

| Component | Status |
|---|---|
| Masthead | Established |
| Compact mark | Established |
| Core palette | Established |
| Typography roles | Established |
| Why It Matters | Established — Warm Wash + Signal Red left rule |
| Under the Radar | Established |
| Austin Pulse | Established |
| Austin Ahead | Established |
| GO / WATCH / PLAN taxonomy | Established; mutually exclusive |
| Friday Austin Ahead expansion | Future specification |
| Website migration | Pending |
| Production newsletter migration | Pending |
| Transactional-email migration | Pending |
| Social-preview migration | Pending |

## 46. Superseded Source

The earlier Google Drive working file `brand-system.md` has been superseded by this design system. It remains useful as historical development material but is no longer the governing design specification.

## 47. Design Standard in One Sentence

> **Austin Daily Briefing should feel immediately recognizable, professionally edited, visually calm, and alive enough to reflect the city it covers—while making the day easier to understand rather than harder to consume.**

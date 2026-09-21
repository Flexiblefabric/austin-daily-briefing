# Austin Daily Briefing Website Design Specification

**Status:** Draft design specification  
**Scope:** Public website redesign  
**Applies to:** `site/`  
**Related systems:** [Design System](design-system.md), [Editorial System](editorial-system.md), [Newsletter Component Specification](newsletter-component-spec.md)

## 1. Purpose

The Austin Daily Briefing website should function as a small publication website rather than a marketing landing page.

Its job is to explain what Austin Daily Briefing is, show readers what the briefing looks like and how it works, make signup and subscriber controls easy to find, provide transparent information about editorial process and product changes, and visually match the production newsletter.

The site should remain intentionally small. It does not need to become a news portal, archive, or CMS to feel complete.

The website should feel like the place the newsletter comes from.

## 2. Design principles

### 2.1 Text first

The website launches without visible photography or illustration.

Typography, spacing, rules, component hierarchy, the approved masthead, and restrained fields should carry the visual identity. The site must not appear incomplete when no images are present.

### 2.2 Imagery is optional, not structural

Page composition must remain complete without images.

Future editorial features may introduce restrained imagery when it adds information, atmosphere, or practical value. Friday Austin Explorer is the most likely future use case.

If imagery is introduced later:

- it should explain, demonstrate, document, or meaningfully support content;
- it should not be generic decoration;
- it should avoid skyline hero photography and tourist shorthand such as bats, guitars, murals, or generic Austin lifestyle imagery;
- individual features should generally use one strong image rather than galleries;
- images should include caption, credit, alt text, and responsive behavior.

### 2.3 Publication before promotion

The site should communicate value clearly without aggressive marketing patterns.

Avoid oversized conversion-first hero treatments, repeated signup buttons, testimonial-style social proof, generic “never miss a thing” language, startup/dashboard visual conventions, and unnecessary cards or pills.

### 2.4 Shared identity with the newsletter

The website should inherit the production visual system rather than maintain a separate brand language.

Use:

- Charcoal `#181818`
- Paper `#FFFEFA`
- Signal Red `#DB2D2D`
- Supporting Gray `#68635A`
- Rule Gray `#DEDAD1`
- Warm Wash `#F2EFE8`
- Link Red `#8F1717`

Typography:

- Newsreader for editorial display and major reading hierarchy.
- IBM Plex Sans Condensed for labels, navigation, metadata, and information hierarchy.
- Appropriate web-safe fallbacks.

The approved masthead asset is the canonical site masthead. Do not recreate the masthead using ordinary HTML typography when the production asset can be used.

## 3. Information architecture

The public site should remain limited to six pages.

### Primary reader-facing pages

1. **Home**
2. **How ADB Works**
3. **What’s New**

### Utility and trust pages

4. **Corrections**
5. **Privacy**
6. **Terms**

External forms remain actions rather than website pages:

- Get the Briefing
- Customize Briefing
- Manage Subscription
- Feedback & Corrections

## 4. Navigation

### 4.1 Desktop

Primary desktop navigation should expose:

- How ADB Works
- What’s New
- See a Sample

Subscriber actions should remain visually distinct:

- Customize
- Manage
- Get the Briefing

The primary signup action should have the strongest emphasis.

### 4.2 Mobile

Do not compress the full desktop navigation into a crowded mobile row.

Mobile should preserve the ADB masthead, the primary signup action, and access to the full navigation and subscriber tools.

A compact menu may contain:

- How ADB Works
- What’s New
- See a Sample
- Customize
- Manage
- Corrections
- Privacy
- Terms

The exact interaction may be finalized during implementation, but it should remain simple, keyboard accessible, and usable without JavaScript where practical.

## 5. Homepage

The homepage should become substantially simpler than the current site.

### 5.1 Header

Use the approved ADB masthead.

Do not use the retired “Your city. In perspective.” tagline or the Austin skyline photograph.

### 5.2 Hero

The hero should be primarily typographic.

Working headline:

> **Understand Austin without spending your morning trying to catch up.**

Supporting copy:

> A concise daily briefing of what changed, why it matters, and what’s worth watching next.

Primary action:

> **Get the free briefing**

Secondary action:

> **See a sample**

### 5.3 What you get

Use three concise editorial columns or equivalent responsive blocks.

#### The shared briefing

The most important Austin developments of the day, with context and a clear Why It Matters.

#### More for You

Additional stories based on the topics and level of detail the subscriber chooses.

#### Austin Ahead

Upcoming things worth attending, watching, or planning around.

This replaces the older “Essentials / Possibilities / Your Interests” framing.

### 5.4 See a Sample

“See a Sample” remains a homepage anchor, not a separate page.

The sample should resemble the actual production newsletter rather than a faux-newspaper design.

Recommended anatomy:

- section label or metadata;
- headline;
- summary;
- standard Why It Matters treatment;
- source link;
- optional compact Austin Ahead item.

Use a clearly labeled archived example.

### 5.5 How ADB Works preview

Use three short principles.

#### Curated, not exhaustive

ADB selects the developments most useful for understanding Austin today.

#### Sources stay visible

Substantive stories point readers back to reporting or original sources.

#### Personalization stays separate

Subscriber preferences shape More for You, not shared Top Stories.

End with:

> **How ADB Works →**

### 5.6 What’s New preview

Show only the most recent product update.

Recommended structure:

- date;
- update title;
- one or two short sentences;
- link to the full updates archive.

Do not show multiple updates on the homepage.

### 5.7 Closing signup

Closing headline:

> **Keep Austin in View.**

Supporting copy should remain short and calm.

Recommended pattern:

> A concise daily briefing of what changed, why it matters, and what’s worth watching next.

Primary action:

> **Get the free briefing**

## 6. How ADB Works

This page provides the durable public explanation of the publication.

Recommended structure:

1. What Austin Daily Briefing is
2. What goes into the shared briefing
3. How stories are discovered
4. How Top Stories are selected
5. Why It Matters
6. Under the Radar
7. More for You
8. Austin Ahead
9. Sources and attribution
10. AI and automation
11. Human oversight
12. Repeat control and material change
13. Corrections and feedback

### 6.1 V2 boundary

Until the V2 story-selection engine is promoted, do not describe V2 as the live production selection system.

Stable editorial principles may be documented now. V2-specific explanation should be labeled as in development or omitted until promotion.

## 7. What’s New

The What’s New page is the reader-facing product history, not a technical changelog.

Entries appear newest first.

Each entry should contain:

- date;
- concise title;
- one to three short paragraphs;
- what changed;
- why it matters to readers;
- whether reader action is required.

Do not include internal release IDs, branch names, GitHub terminology, task IDs, infrastructure implementation details, or internal test evidence.

The first major entry should document the September 2026 newsletter redesign.

## 8. Corrections

The Corrections page remains a public trust page.

Retain its correction-policy substance and apply the redesigned masthead, navigation, typography, palette, and footer.

## 9. Privacy and Terms

Privacy and Terms remain separate pages.

Their substantive text should not be rewritten solely for visual consistency.

Apply the common site shell:

- approved masthead;
- new navigation;
- canonical typography;
- canonical palette;
- consistent footer;
- responsive layout.

Any policy text update should be treated separately from the visual redesign.

## 10. Footer

The footer should visually relate to the production newsletter footer.

Recommended treatment:

- Charcoal background;
- reversed compact ADB mark;
- restrained centered or balanced layout;
- Paper text;
- clear link groups.

Recommended groups:

### Product

- Home
- How ADB Works
- What’s New

### Subscriber

- Customize
- Manage
- Feedback

### Trust

- Corrections
- Privacy
- Terms

Include:

> Austin, Texas · An independent experimental project

## 11. Components

The website should establish a small reusable component system.

Initial components:

- site masthead;
- desktop navigation;
- mobile navigation;
- primary CTA;
- secondary text link;
- eyebrow / section label;
- editorial headline;
- metadata line;
- rule divider;
- Warm Wash information field;
- Why It Matters block;
- archived sample block;
- What’s New preview;
- update entry;
- legal/policy content shell;
- footer.

Avoid unnecessary card components.

## 12. Responsive behavior

Requirements:

- no horizontal scrolling;
- comfortable touch targets;
- readable line length;
- legible masthead at narrow widths;
- clean stacking of multi-column sections;
- readable sample without zoom;
- clear footer stacking;
- accessible navigation;
- clear distinction between external form actions and site navigation.

## 13. Accessibility

Minimum requirements:

- semantic HTML landmarks;
- one logical `h1` per page;
- sequential heading hierarchy;
- visible keyboard focus;
- skip-to-content link;
- sufficient contrast;
- underlined inline links where practical;
- accessible menu state;
- no meaning conveyed by color alone;
- alt text for future meaningful imagery;
- reduced-motion compatibility if motion is introduced.

## 14. Performance

Prefer:

- static HTML and CSS;
- minimal or no JavaScript;
- optimized local or production-hosted brand assets;
- efficient font loading;
- no analytics or third-party embeds unless deliberately introduced later.

## 15. Search and social metadata

Preserve and update:

- canonical URLs;
- descriptions;
- Open Graph metadata;
- Twitter/X card metadata;
- robots.txt;
- sitemap.xml.

The current skyline-based social preview should eventually be replaced with a brand-system social card.

The social card may be graphical even while the public site itself remains image-free.

## 16. Future Friday Austin Explorer support

The initial redesign should not implement Friday Austin Explorer as a website feature.

However, CSS and content structure should allow a future editorial module supporting:

- one optional editorial image;
- fixed aspect-ratio media;
- caption and credit;
- category/date metadata;
- title and short description;
- optional location or practical information;
- responsive stacking.

The feature must still work when no image is supplied.

## 17. Migration sequence

### Phase 1 — Foundation

- create shared site shell;
- integrate canonical colors and typography;
- replace hand-built masthead with approved asset;
- build desktop and mobile navigation;
- build common footer;
- update favicon to approved compact mark.

### Phase 2 — Homepage

- remove skyline hero;
- remove retired tagline;
- implement typographic hero;
- replace old three-column framing;
- rebuild sample using newsletter component language;
- add abbreviated How ADB Works preview;
- add latest What’s New preview;
- implement “Keep Austin in View.” closing CTA.

### Phase 3 — New pages

- create How ADB Works;
- create What’s New;
- add first redesign update entry.

### Phase 4 — Existing trust pages

- migrate Corrections;
- migrate Privacy;
- migrate Terms;
- preserve substantive policy text unless separately approved.

### Phase 5 — Metadata and QA

- update sitemap;
- update social metadata;
- replace social-preview asset;
- verify canonical links;
- test desktop/mobile layouts;
- test keyboard navigation;
- validate forms and external destinations.

## 18. Out of scope

Not part of the initial redesign:

- public article archive;
- searchable news database;
- individual story pages;
- comments;
- subscriber login/account portal;
- onsite personalization controls;
- live weather widget;
- CMS migration;
- analytics implementation;
- Friday Austin Explorer web feature;
- V2 production promotion;
- original-reporting newsroom functionality.

## 19. Acceptance criteria

The redesign is ready for production when:

- the site uses the approved ADB identity consistently;
- the skyline hero and retired tagline are gone;
- Home, How ADB Works, and What’s New form the primary editorial structure;
- desktop navigation includes How ADB Works and What’s New;
- mobile navigation is intentionally redesigned rather than compressed;
- See a Sample remains a homepage anchor;
- the sample visually matches the newsletter system;
- the homepage shows only the latest What’s New entry;
- the closing CTA reads “Keep Austin in View.”;
- the site works without visible photography or illustration;
- future optional imagery can be added without restructuring;
- Corrections, Privacy, and Terms use the common site shell;
- all subscriber actions remain functional;
- accessibility and responsive checks pass;
- no subscriber, queue, or delivery behavior is changed by the website redesign.

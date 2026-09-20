# Austin Daily Briefing Identity System

**Status:** Approved design direction; staging implementation  
**Date approved:** September 20, 2026

## Primary masthead

The horizontal masthead uses `AUSTIN` in uppercase Newsreader. `DAILY` and `BRIEFING.` are stacked, left-aligned, and set in IBM Plex Sans Condensed. A signal-red vertical rule separates the two blocks. The descriptor should match the visible height of `AUSTIN`. The period after `BRIEFING` remains red.

Use the primary masthead at the top of every Austin Daily Briefing edition. Preserve generous clear space and never compress, distort, restack, or recolor the mark.

## Compact mark

The compact mark is `ADB` in uppercase Newsreader, without a period, enclosed in a charcoal circle. A short signal-red underline carries the primary identity accent into the compact form.

Use the compact mark for favicons, avatars, narrow mobile placements, and the newsletter footer. Do not use it as a replacement for the full masthead when the full name can fit comfortably.

## Typography

- Masthead and compact mark: Newsreader, weight 500.
- Descriptor, section labels, dates, navigation, and supporting metadata: IBM Plex Sans Condensed, weights 400–500.
- Email body copy: Arial, Helvetica, or another email-safe sans serif.
- Editorial headlines and Austin Pulse: Georgia with Newsreader as an enhanced web-preview face. Email delivery must retain a reliable serif fallback.

## Color

- Charcoal: `#181818`
- Paper: `#FFFEFA`
- Signal red: `#DB2D2D`
- Supporting gray: `#68635A`
- Rule gray: `#DEDAD1`

Signal red is an accent. Reserve it for the masthead divider, the punctuation mark, section cues, and primary calls to action. Do not use it for large text blocks.

## Accessibility and delivery

- The masthead image must use alt text `Austin Daily Briefing`.
- The compact mark must use alt text `ADB` when the surrounding text does not already identify the publication.
- Maintain strong contrast in light and reversed treatments.
- Keep an HTML text fallback for clients that block images.
- Convert the approved marks to outlined SVG and production PNG exports before live email promotion so the exact typography does not depend on remote font loading.

## Newsletter order

Every standard edition follows this structure:

1. Masthead
2. Austin Pulse
3. Weather
4. Featured Top Story
5. Remaining Top Stories
6. Under the Radar
7. More for You
8. Events
9. Footer with a prominent `Pause or unsubscribe` control

Austin Pulse is a short narrative paragraph, not a list or table of contents. It should orient the reader without duplicating headlines, summaries, or `Why it matters` language.

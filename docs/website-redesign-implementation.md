# Website Redesign Implementation

**Status:** Promoted to production 2026-09-22  
**Design specification:** [website-design-spec.md](website-design-spec.md)  
**Branch:** `website-redesign-stage-v1`

## Implementation scope

This implementation record describes the production website redesign merged in PR #23 and deployed successfully through GitHub Pages on 2026-09-22.

Included:

- approved ADB masthead and compact mark copied into the GitHub Pages artifact;
- approved compact mark used as the favicon;
- canonical color system applied to the site;
- text-first site shell;
- desktop navigation with How ADB Works, What’s New, and See a Sample;
- responsive mobile navigation using native `details` / `summary`, with no JavaScript dependency;
- subscriber actions separated from editorial navigation;
- charcoal footer using the reversed compact mark;
- rebuilt homepage with no skyline hero or retired tagline;
- homepage See a Sample anchor using production newsletter component language;
- homepage How ADB Works preview;
- homepage latest What’s New preview;
- “Keep Austin in View.” closing CTA;
- new How ADB Works page with explicit V2 development boundary;
- new What’s New page with the September 2026 redesign entry;
- Corrections, Privacy, and Terms moved into the common site shell without rewriting their substantive policy text;
- sitemap updated for the new public pages.

## Deliberately deferred

The following remain outside this release:

- introducing visible editorial photography or illustration;
- Friday Austin Explorer web components;
- remote web-font loading or font self-hosting;
- analytics;
- V2 production promotion;
- public article or issue archive.

The site currently uses the canonical font stacks with reliable fallbacks. The masthead itself remains exact because it is an outlined production SVG.

## Review completed

The promotion review covered:

1. masthead scale and spacing;
2. desktop navigation balance;
3. mobile navigation behavior;
4. homepage headline and section pacing;
5. visual fidelity of the sample Why It Matters treatment;
6. How ADB Works tone and amount of detail;
7. What’s New presentation;
8. footer density;
9. Corrections, Privacy, and Terms readability inside the new shell;
10. all external subscriber and feedback destinations.

## Promotion gate — satisfied

Promotion required:

- desktop visual review;
- mobile visual review;
- keyboard navigation review;
- internal-link verification;
- external form-link verification;
- no horizontal overflow at common mobile widths;
- no broken production brand assets;
- GitHub Pages workflow readiness;
- explicit approval to promote.


## Promotion result

- PR #23 was merged to `main` on 2026-09-22.
- The GitHub Pages deployment for the merge commit completed successfully.
- Desktop/mobile visual review and explicit promotion approval were completed before merge.
- The site now exposes Home, How ADB Works, What's New, Corrections, Privacy, and Terms through the common publication shell.
- The brand-system social card is stored as `site/social-preview.png`; metadata references were reconciled to that asset after promotion.
- No subscriber, queue, email-delivery, or personalization behavior changed.

The redesign is complete. Future Friday Explorer modules, general editorial imagery, analytics, and archive/CMS work remain separate roadmap items or deferred ideas.

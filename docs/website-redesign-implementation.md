# Website Redesign Implementation

**Status:** Staged for review  
**Design specification:** [website-design-spec.md](website-design-spec.md)  
**Branch:** `website-redesign-stage-v1`

## Scope of this staging pass

This staging pass implements the first production-shaped version of the approved website redesign without merging it to `main`.

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

The following remain outside this staging pass:

- replacing the existing skyline-based social preview image;
- introducing visible editorial photography or illustration;
- Friday Austin Explorer web components;
- remote web-font loading or font self-hosting;
- analytics;
- V2 production promotion;
- public article or issue archive.

The site currently uses the canonical font stacks with reliable fallbacks. The masthead itself remains exact because it is an outlined production SVG.

## Review focus

Before promotion, review:

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

## Promotion gate

Do not merge this redesign solely because the HTML is complete.

Require:

- desktop visual review;
- mobile visual review;
- keyboard navigation review;
- internal-link verification;
- external form-link verification;
- no horizontal overflow at common mobile widths;
- no broken production brand assets;
- GitHub Pages workflow readiness;
- explicit approval to promote.

# Reader Change Communication Standard

**Status:** Active product communication standard  
**Applies to:** Subscriber-facing changes to Austin Daily Briefing  
**Related components:** newsletter What's New, public What's New page, Welcome email, dedicated subscriber notices

ADB should explain meaningful reader-facing changes without turning normal editions into release notes.

## Communication levels

| Level | Change type | Default communication |
| --- | --- | --- |
| 1 | Invisible operational maintenance | No subscriber announcement |
| 2 | Noticeable reader-experience improvement | One concise newsletter **What's New** note |
| 3 | Major capability or durable product change | Newsletter **What's New** note + permanent public **What's New** entry |
| 4 | Change requiring reader attention, consent, or action | Dedicated reviewed notice, plus permanent public explanation when appropriate |

Examples of Level 1 changes include reliability fixes, internal scoring adjustments that do not change the reader contract, documentation maintenance, and backend refactors.

Examples of Level 2 changes include a visual redesign, clearer subscriber controls, or a new presentation treatment.

Examples of Level 3 changes include a major editorial-system promotion, expanded personalization behavior, or a new recurring reader feature.

Level 4 is reserved for matters such as a required migration, material privacy/terms change, consent requirement, or subscriber action needed to continue a service.

## Newsletter What's New

The newsletter component is optional and change-driven. It is not a standing daily section.

A strong note answers:

1. What changed?
2. Why did ADB change it?
3. What does it mean for the reader?
4. Does the reader need to do anything?

Use one compact paragraph whenever possible. Link to the public What's New page only when a durable explanation materially helps.

Do not use the component for routine maintenance, internal implementation details, or changes that have no reader-facing effect.

A launch note should normally appear once per eligible profile. A shorter repeat later in the week is allowed only when it clearly improves awareness; do not repeat merely because the component exists.

## Public What's New page

The public page is the durable reader-facing change history.

Entries should include:

- date;
- concise title;
- what changed;
- why it matters to readers;
- whether reader action is required.

Do not publish internal release IDs, task IDs, branch names, provider identifiers, QA evidence, or implementation details that do not help readers understand the product.

The page is not the technical changelog. Material internal production changes remain in `docs/CHANGELOG.md`.

## How ADB Works

Update **How ADB Works** when the stable explanation of the publication itself changes.

Examples:

- story-selection model promoted to production;
- sourcing or repeat-control rules materially change;
- personalization boundaries change;
- a recurring section becomes part of the standard reader contract.

Do not use How ADB Works for temporary announcements.

## Welcome email

The Welcome message should describe current durable capabilities for a new subscriber.

Update it when a new subscriber needs different onboarding information, settings guidance, subscriber controls, or product expectations.

Do not add release history to the Welcome email. New subscribers should learn how ADB works now, not what changed before they arrived.

## Dedicated subscriber email

A dedicated change email is exceptional.

Use it when:

- reader action is required;
- a material privacy, terms, consent, or account change warrants direct notice;
- a migration or service interruption requires subscriber attention;
- another reviewed operational/legal requirement makes a dedicated notice appropriate.

Do not send a dedicated email solely to announce cosmetic improvements or routine feature releases that can be explained inside the normal briefing.

Dedicated notices require explicit review of audience, send ownership, idempotency, unsubscribe/management behavior, and delivery safety before sending.

## Corrections are separate

Product communication must never displace or soften correction obligations.

Corrections and clarifications follow the Editorial System and corrections policy. A What's New note is not a substitute for acknowledging an error.

## Release workflow

For a reader-facing release:

1. classify the change level;
2. identify the appropriate surfaces;
3. draft the smallest useful reader explanation;
4. confirm the release is actually live before announcing it;
5. state clearly whether action is required;
6. remove temporary newsletter notices after their defined run/expiry;
7. preserve permanent explanations only where they remain useful.

The default is restraint: communicate what materially changes the reader experience, and keep invisible maintenance invisible.

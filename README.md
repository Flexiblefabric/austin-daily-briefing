# Austin Daily Briefing

![Austin Daily Briefing masthead](assets/brand/adb-masthead.png)

**Austin Daily Briefing (ADB)** is an independent local briefing product based in Austin, Texas. It helps readers understand what matters in Austin, what changed, why it matters, and what is worth watching next — without turning staying informed into another task.

ADB combines important local reporting, official information, community developments, events, practical context, and a limited amount of personalized material into a concise daily email. The public website supports signup, personalization, subscription controls, corrections, privacy, and project information.

**Live site:** [austindailybriefing.com](https://austindailybriefing.com/)

> This README is an orientation to the repository. For authoritative current technical state, use [`PROJECT_STATE.json`](PROJECT_STATE.json) and the generated project documentation in [`docs/`](docs/).

## Current production state

ADB is live in production.

- Morning briefing generation runs daily at **08:00 America/Chicago**.
- Google Forms remain the public subscriber intake path. Production Subscriber Operations also supports a controlled native-customization path while Gate E remains pending.
- Daily briefing and Welcome messages are queued in the production control plane and delivered through **Resend**.
- Replies to `briefing@austindailybriefing.com` are handled through **Cloudflare Email Routing**.
- The public website is deployed through **GitHub Pages**.
- A production health watchdog checks subscriber operations, morning generation, daily Resend delivery, Welcome queue health, and the first promoted signup-completion incident class.
- The current newsletter identity and redesigned Welcome email are promoted to production.

The production architecture and automation state are summarized in [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md), [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), and [`docs/OPERATIONS.md`](docs/OPERATIONS.md).

## Editorial product

ADB is local by default, curated rather than comprehensive, explanatory rather than headline-only, and designed to reduce the amount of work required to stay oriented to Austin.

A standard edition follows this structure:

1. **Masthead and edition date**
2. **Austin Pulse** — a compact orientation to the day's major developments
3. **Weather**
4. **Featured Top Story**
5. **Remaining Top Stories**
6. **Under the Radar** — consequential information readers could reasonably miss, when warranted
7. **More for You** — the only personalized editorial section, based on saved subscriber interests
8. **Austin Ahead** — near-term items labeled **GO**, **WATCH**, or **PLAN**
9. **Friday recap**, when applicable
10. **What's New**, when a material subscriber-facing product update warrants it
11. **Corrections or clarifications**, when required
12. **Footer and subscriber controls**

The shared Top Stories are not personalized. Personalization is intentionally contained within **More for You** so every subscriber receives the same core Austin briefing.

The canonical reader-facing rules are defined in [`docs/editorial-system.md`](docs/editorial-system.md).

## Publication model

ADB does not currently operate as an original-reporting newsroom. It depends on credible local reporting, public records, official announcements, event information, and other outside sources.

Human oversight sets priorities, designs the rules, reviews performance, and remains responsible for the finished product. Automated and AI-assisted tools may help discover, compare, organize, summarize, personalize, validate, and deliver information, but they do not establish the publication's values or remove human responsibility.

ADB is not affiliated with the City of Austin, another government agency, or the publications and public sources it links to.

## System architecture

The production system is intentionally small and modular:

```text
Google Forms ───────────────┐
                            │
Controlled native customize ├──► Google Sheets + Apps Script control plane
+ first-party confirmation  │
                            │
                            ▼
    ├── subscriber intake and preferences
    ├── briefing queue and history
    └── operational status
    │
    ├────────► Morning editorial generation (08:00 CT)
    │              │
    │              ▼
    │         Outbound Messages queue
    │              │
    ▼              ▼
Subscriber       Apps Script dispatchers
operations            │
                      ▼
                    Resend
                      │
                      ▼
              Subscriber inboxes

Native confirmation ──► Cloudflare Worker relay ──► production Apps Script
Replies ───────────────► Cloudflare Email Routing
Website ───────────────► GitHub Pages
Health  ───────────────► Production watchdog
```

Key boundaries:

- The morning-generation automation creates validated queue records; it does **not** send email directly.
- Apps Script dispatchers own external delivery through Resend.
- Subscriber operations and editorial generation are separate workflows.
- Production and development data are distinct.
- Controlled production native customization is isolated from public rollout; the Google customization form remains the public fallback until Gate E.
- Secrets and private configuration values are not stored in this repository.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the generated architecture view.

## Repository structure

| Path | Purpose |
| --- | --- |
| [`PROJECT_STATE.json`](PROJECT_STATE.json) | Authoritative technical registry for current project state |
| [`apps-script/`](apps-script/) | Production Resend transport, native-customization endpoints, and controlled QA helpers |
| [`assets/brand/`](assets/brand/) | Approved production masthead and compact brand assets |
| [`design/`](design/) | Static newsletter and Welcome reference/QA payloads |
| [`docs/`](docs/) | Editorial, design, component, operational, release, and governance documentation |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Canonical cross-project backlog and current work status |
| [`docs/automation-prompts/`](docs/automation-prompts/) | Durable canonical copies of active automation prompts |
| [`docs/snapshots/`](docs/snapshots/) | Immutable point-in-time captures of material technical state |
| [`scripts/`](scripts/) | Documentation registry and synchronization tooling |
| [`site/`](site/) | Public static website deployed to GitHub Pages |
| [`workers/`](workers/) | Cloudflare Worker source for first-party customization confirmation relays |
| [`.github/workflows/`](.github/workflows/) | Website deployment and documentation validation workflows |

## Canonical specifications

The project uses separate specifications for editorial meaning, visual identity, email construction, sourcing, and production execution.

- [**Editorial System**](docs/editorial-system.md) — publication identity, voice, story anatomy, section purpose, sourcing, repeat control, personalization boundaries, corrections, and editorial QA.
- [**Design System**](docs/design-system.md) — brand identity, color, typography, masthead, hierarchy, and visual principles.
- [**Newsletter Component Specification**](docs/newsletter-component-spec.md) — production email structure, responsive behavior, component construction, dark-mode/image-blocked resilience, and plain-text parity.
- [**Source-Link Standard**](docs/source-link-standard.md) — publisher attribution and source-link presentation.
- [**Daily Briefing Automation Prompt**](docs/automation-prompts/austin-daily-briefing.md) — canonical production morning-generation instructions.
- [**Production Subscriber Operations**](docs/automation-prompts/production-subscriber-operations.md) — canonical signup, management, customization, and confirmation processing rules.
- [**Production Health Watchdog**](docs/automation-prompts/production-health-watchdog.md) — production monitoring rules.
- [**Technical Changelog**](docs/CHANGELOG.md) — material production changes, newest first.
- [**Friday Narrative Synthesis**](docs/friday-synthesis-spec.md) — approved staged product definition, with [validation scorecard](docs/friday-synthesis-validation.md) and [separate evidence log](docs/friday-synthesis-evidence-log.md); not yet active in production.
- [**Project Roadmap**](docs/ROADMAP.md) — pending, blocked, deferred, and recently completed cross-project work.

When specifications overlap, use the narrower canonical document for its domain rather than treating this README as an implementation specification.

## Automation and operations

Current production automation includes:

- **Subscriber processor** — every 6 hours.
- **Morning briefing generation** — daily at 08:00 America/Chicago.
- **Welcome dispatcher** — hourly.
- **Daily briefing dispatcher** — hourly.
- **Production health watchdog** — daily at 09:30 America/Chicago.
- **Documentation synchronization** — runs when the authoritative technical registry or generator changes on `main`.

Automation prompts are stored durably in GitHub. Scheduler copies are treated as runtime copies rather than the source of truth.

Operational details are documented in [`docs/OPERATIONS.md`](docs/OPERATIONS.md) and [`docs/automation-prompts/README.md`](docs/automation-prompts/README.md).

## Production and development boundaries

Production is live. Development work is kept separate until explicitly promoted through controlled QA and release checks.

The **V2 story-selection engine** is promoted for the October 4, 2026 edition onward. The [production selection contract](docs/v2-selection-spec.md) defines separate shared-news and More for You rubrics, repeat controls, independent Under the Radar discovery, verified evergreen resources and bounded variety. The 16-run shadow program is archived. The [promotion record](docs/v2-promotion-2026-10-03.md) tracks cutover, rollback and first-cycle verification.

Native customization is the public route after Gates A–E. The Google customization form remains a fallback during Gate F production observation.

Development status and production boundaries should be read from [`PROJECT_STATE.json`](PROJECT_STATE.json) and the relevant runbooks rather than inferred from branch names alone.

## Website

The public website in [`site/`](site/) currently provides:

- Signup, customization, and subscription-management paths
- Feedback and corrections intake
- Public corrections log
- Privacy and terms pages
- Explanatory material about ADB and personalization
- Responsive and accessible static layouts
- Social-sharing metadata

The site is deployed by [`.github/workflows/pages.yml`](.github/workflows/pages.yml) to [austindailybriefing.com](https://austindailybriefing.com/).

The website is a public interface to ADB; it is not the whole product.

## Documentation governance

[`PROJECT_STATE.json`](PROJECT_STATE.json) is authoritative for technical project state.

From that registry, [`scripts/docs_sync.py`](scripts/docs_sync.py) generates:

- [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md)
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/OPERATIONS.md`](docs/OPERATIONS.md)

Do not edit those generated files directly.

Material production changes require a human-authored [technical changelog](docs/CHANGELOG.md) entry and, for the change classes defined in the registry, an immutable snapshot in [`docs/snapshots/`](docs/snapshots/). Existing snapshots must not be modified or deleted.

Runtime secrets, private routing destinations, subscriber addresses, tokens, and other private configuration values do not belong in repository documentation.

## Experimental status

Austin Daily Briefing remains an independent experimental project. The system is designed to improve through controlled testing, explicit promotion, reader feedback, corrections, and documented release history while keeping the daily reader experience concise and dependable.

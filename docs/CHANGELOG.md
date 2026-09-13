# Austin Daily Briefing — Technical Changelog

This file records material internal production changes. Newest entries appear first.

## 2026-09-13 — Production email and custom-domain cutover

**Type:** Production architecture  
**Components:** email delivery, reply routing, website domain, daily delivery  
**Registry impact:** Yes

Austin Daily Briefing completed the production cutover to the custom-domain delivery architecture.

### Changes

- Resend is the production email-delivery provider.
- `briefing@austindailybriefing.com` is the public sender and reply address.
- Cloudflare Email Routing handles replies and forwards them to a private monitored destination that is intentionally not recorded in project documentation.
- The public site is served from the custom domain `austindailybriefing.com` through GitHub Pages.
- Welcome and daily briefing queue dispatch use the Apps Script Resend transport.
- Daily briefing generation is scheduled for 08:00 America/Chicago; queue dispatch remains independent from generation.

### Validation

- Controlled Resend transport testing succeeded.
- Production welcome delivery was promoted after controlled queue-path QA.
- Production daily delivery was promoted after controlled QA and replay testing.
- The custom domain loaded successfully.
- Production messages were received with active links.
- Reply routing returned the expected test result.
- A replay/second-run check produced zero duplicate sends.

### Documentation

- Established `PROJECT_STATE.json` as the authoritative technical registry.
- Added `schema_version` beginning at `1.0`.
- Secret and private configuration values are prohibited from the registry; only property names and purposes may be recorded.
- Added `scripts/docs_sync.py` for registry status, audit, and documentation preview operations.
- completed documentation subsystem: authoritative registry, automatic generated docs, CI validation, and immutable snapshots.

## Changelog policy

A changelog entry is required when a change modifies production architecture, promotes a development component to production, replaces a production dependency, changes data storage or routing, introduces a production subsystem, or performs a rollback or migration.

Routine documentation edits, tests, refactors without behavioral changes, development-only experiments, and cosmetic public-site changes do not require entries unless they accompany a material production change.

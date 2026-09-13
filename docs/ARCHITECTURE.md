# Austin Daily Briefing — Architecture

> Generated from `PROJECT_STATE.json`. Do not edit this generated document directly.

## System overview

Austin Daily Briefing uses Google Sheets and Google Apps Script as its operational control plane, Resend for outbound email delivery, Cloudflare Email Routing for replies, and GitHub Pages for the public website.

## Environments

- **Production** — live — Drive folder `1ISgKMDxOE5VzYTvxtdGe7OmYoFddkAC4`
- **Development** — active — Drive folder `102Kz3qosNQUL52KPNXYVJRzOFkcuBsfj`

## Production data stores

- Subscriber database: Austin Daily Briefing — Subscriber Preferences (`1pqVjQFqWoRb24jn86lOq6LoYjzBccf4WpE1kOI8_Jk0`)
- Intake database: Austin Daily Briefing — Google Forms Production Intake (`1zL3og3MOXgm5LdUF2VfIN4Sh9oFss6NVzAGRa-Zlmho`)

## Services and boundaries

- **control_plane** — live — Google Sheets + Google Apps Script
- **email_delivery** — live — Resend; source `apps-script/ResendTransport.gs`
- **reply_routing** — live — Cloudflare Email Routing
- **website** — live — GitHub Pages; source `site/`

## Delivery path

1. Subscriber and preference state is maintained in the production Google Sheets control plane.
2. Editorial generation creates delivery records for eligible profiles.
3. Google Apps Script dispatchers deliver queued messages through Resend.
4. Replies sent to `briefing@austindailybriefing.com` are routed by Cloudflare Email Routing to the externally configured monitored destination.
5. The public website is deployed from `site/` to GitHub Pages at `austindailybriefing.com`.

## Documentation control

`PROJECT_STATE.json` is authoritative for technical project state. Generated status, architecture, and operations documents are derived from that registry. `CHANGELOG.md` remains human-authored.

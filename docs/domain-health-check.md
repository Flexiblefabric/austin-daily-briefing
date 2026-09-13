# Austin Daily Briefing — Manual Domain Health Check

Use this runbook only when a domain check is requested. It is not a scheduled task.

## Address scope

Check all four public entry points:

- `https://austindailybriefing.com/`
- `http://austindailybriefing.com/`
- `https://www.austindailybriefing.com/`
- `https://flexiblefabric.github.io/austin-daily-briefing/`

Each address must ultimately resolve to `https://austindailybriefing.com/` and return a successful response. Record the redirect chain when it does not.

## Core checks

- Confirm the primary HTTPS page returns HTTP `200` with a valid certificate.
- Follow redirects from the HTTP, `www`, and legacy GitHub Pages addresses.
- Confirm every entry point ends at the canonical HTTPS address.
- Confirm the live page declares `https://austindailybriefing.com/` as its canonical and Open Graph URL.
- Confirm the social-preview image, `robots.txt`, and `sitemap.xml` are reachable and use the custom domain.

## Reporting

Return a compact pass/fail table. A passing check needs no extended explanation. For every failure, add a brief explanation containing:

- What was observed
- What was expected
- The likely cause or most useful next action

Do not create a scheduled monitor from this runbook.

## Form validation

Validate the signup, customization, and subscription-management links only after a form or its website link changes. Confirm that each link opens the intended form. Perform a controlled form submission only when the test is explicitly authorized, because submissions can create or modify subscriber records.

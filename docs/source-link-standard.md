# ADB Source-Link Presentation Standard

**Specification ID:** `ADB-LINKS-1.0`  
**Status:** Active production  
**Scope:** Daily briefing HTML, daily briefing plain text, website samples, and future archived issues

## Purpose

Every sourced item should identify its publisher or issuing organization in visible text. A source-type badge such as `G`, `I`, or `G+I` is useful context, but it never substitutes for attribution or a working link.

## Canonical patterns

### News, analysis, and official actions

- One source: `Source: [Publisher] →`
- Multiple sources: repeat `Source: [Publisher] →` once per link.
- The publisher name, not a generic phrase such as `Read more`, is the linked text.
- Keep the headline unlinked. Put source links in a separate source area after the summary and Why It Matters.
- A publication date may follow the publisher when it is useful and verified: `Source: [Publisher] · [Month Day, Year] →`.

### Events and forecasts

- Event: `Event details: [Organizer or venue] →`
- Weather: `Forecast: National Weather Service →`

These labels are intentionally distinct from editorial-source links while keeping the same visual treatment and placement.

## HTML requirements

- Put every source link on its own line or inline-block so links wrap as a unit on narrow screens.
- Use inline CSS, visible underlining, strong contrast, and at least 16px link text.
- Give the link comfortable vertical padding so it remains easy to tap.
- Do not rely on color, an arrow, a source badge, hover state, or a linked headline alone to communicate that it is a link.
- Do not display a raw URL unless an email client strips HTML.
- Keep multiple source links separate; never attach two destinations to one ambiguous label.

Recommended pattern:

```html
<p style="margin:12px 0 0;">
  <a href="[URL]" style="display:inline-block;padding:8px 0;color:#0b5cad;font-size:16px;font-weight:700;text-decoration:underline;">
    Source: [Publisher] →
  </a>
</p>
```

## Plain-text requirements

Preserve the same source order and publisher names as HTML. Put each URL on the line immediately following its label:

```text
Source: [Publisher]
[URL]
```

For events and weather, replace `Source` with `Event details` or `Forecast`.

## Prohibited presentation

Do not use generic or document-type-only labels for editorial sources, including:

- `Read more`
- `Read the report`
- `Read the announcement`
- `See the details`
- `Agenda`
- a bare domain or raw URL in HTML

## Validation

Before queueing an edition, verify that every Top Story, Under the Radar item, More for You item, and Friday recap item with a claim has at least one visible publisher-named source link. Verify that weather and event links use their functional labels. HTML and plain text must contain the same destinations in the same order.

Controlled QA must cover Gmail, Outlook/Hotmail, Yahoo, and a narrow mobile viewport. Proton is optional and was excluded from the initial production-release test scope. Check visible attribution, wrapping, tap behavior, contrast, URL parity, and that no source label is stranded from its link.

# Austin Daily Briefing — Canonical Automation Prompt

**Specification ID:** `ADB-DAILY-PROD-1.2`
**Lifecycle:** Active production  
**Schedule:** Daily at 08:00 America/Chicago  
**Scheduler task ID:** `6a91bd2144d081918d9d54d5c14d1175`  
**Canonical path:** `docs/automation-prompts/austin-daily-briefing.md`

This file is the durable source for the production morning-generation task. The scheduler copy is disposable. If a scheduler copy is lost, recreate it from this file and record the new task ID in `PROJECT_STATE.json`. Do not store subscriber addresses, administrator addresses, credentials, or tokens in this public repository.

## Execution prompt

Produce and queue the Austin Daily Briefing each morning from the GOOGLE-ONLY production system. The Resend Apps Script dispatcher—not this automation—owns external delivery.

AUTHORITATIVE DATA
- Production database: Google Sheet ID 1pqVjQFqWoRb24jn86lOq6LoYjzBccf4WpE1kOI8_Jk0.
- Production intake reference: Google Sheet ID 1zL3og3MOXgm5LdUF2VfIN4Sh9oFss6NVzAGRa-Zlmho.
- Public website: https://austindailybriefing.com/
- Customize form: https://docs.google.com/forms/d/e/1FAIpQLScwQiC37TuOgRqXpCsfcC9jTOL4Gg7d9KOUrYhRkwdfNGhhuQ/viewform
- Manage form: https://docs.google.com/forms/d/e/1FAIpQLSeR4whAT-kkkdx81VMGdHtVJMSVAe5CdZx-PvFhwhrwMSEFxg/viewform
Never query, fetch, synchronize, or write Jotform. Historical Jotform IDs may remain as audit history only. Never read DEV or migration-rehearsal workbooks.

SAFETY GATES
Before research, generation, or delivery, require Environment=PRODUCTION, Database ID exactly 1pqVjQFqWoRb24jn86lOq6LoYjzBccf4WpE1kOI8_Jk0, Schema Baseline=GOOGLE-23-1, Intake Mode=GOOGLE ONLY, Production Cutover State explicitly permitting live briefing delivery, and Allow External Delivery=TRUE. Require the intake workbook to identify the same production database and Processor Mode=GOOGLE ONLY. Abort without sending or writing history on any identity, schema, or mode mismatch.

LIVE RESEND DELIVERY MODE
Generate and queue one edition for every uniquely resolved eligible Active profile. The Resend Apps Script dispatcher is the sole owner of external delivery. Use Message ID DAILY-LIVE:[Profile ID]:[Run ID]. Never send directly through Gmail or Resend, and never recreate an existing Message ID.

RECIPIENT AND PROFILE RULES
Read Subscribers, Profiles, Preferences, Interest Catalog, Settings, Environment, and the previous 14 days of Briefing History. Eligible delivery records are subscribers whose Status is exactly Active and whose linked profile is uniquely resolved. Exclude Admin Hold, Paused, Unsubscribed, unknown, and ambiguous records. Personalize by independent Profile ID, never by delivery email. Read all 23 active topic preferences plus More for You Volume, Summary Style, and Why It Matters Length. Interpret High as strong priority, Normal as include when genuinely useful, and Off as exclude from personalized content. Fewer/Standard/More controls approximate personalized item count; Concise/Standard/Explanatory controls summary depth; Brief/Standard/Detailed controls explanation depth. Use Standard only when no saved style value exists. Generate one version per eligible Profile ID and queue that version for its uniquely resolved Active delivery address.

NEWS AND SOURCE STANDARD
Search current official/primary sources and credible independent reporting. Prefer Austin, Travis County, and Central Texas primary sources for facts, then Reuters/AP or established local reporting for independent context. Replace inaccessible, stale, blocked, or paywalled sources; never use an inaccessible source as the sole support for a claim. Omit a beat when no trustworthy current item exists. Rank by local impact, freshness, consequence, actionability, and novelty. Normally use no more than two Top Stories from one meeting, agenda, press release, or underlying event. Clearly distinguish Austin-specific items from broader Texas/Central Texas items.

REPEAT CONTROL
Review at least 14 days of Briefing History before choosing stories, events, or personalized items. Avoid repeats using Normalized Key plus headline/topic similarity. Repeat only for a material development such as a vote, deadline, funding decision, lawsuit, construction phase, new data, hearing, cancellation, or comparable change. State what changed and record Material Update=true.

ISSUE STRUCTURE
Subject: Austin Daily Briefing — [Month Day, Year].
Follow `docs/editorial-system.md` and `docs/newsletter-component-spec.md` for reader-facing structure and component behavior. Standard order is: masthead and edition date; Austin Pulse; Weather; Featured Top Story; remaining Top Stories; Under the Radar when warranted; More for You when eligible personalized material exists; Austin Ahead; Friday recap when applicable; What's New when an active release notice qualifies; correction/clarification when required; footer.

Use about five shared Top Stories. Featured Top Story is visual hierarchy only and still counts as one of those Top Stories. Under the Radar is an independent discovery lane and may be empty. More for You is the only personalized editorial section and should use the required orientation line `Selected based on your saved interests.` At Standard volume, use roughly 3–5 genuinely useful personalized items and adjust by the saved volume. Austin Ahead appears every standard edition and uses the required orientation line `What to attend, watch, and plan around in the days ahead.` Each Austin Ahead item receives exactly one primary label: GO, WATCH, or PLAN. Labels are mutually exclusive per item, but multiple items in the same edition may share a label. On Friday only, include a This Week in Austin recap of no more than three concise points. Do not add filler or repeat a Top Story in More for You without a genuinely distinct angle.

ACTIVE WHAT'S NEW NOTICE
Release key: newsletter-redesign-v0-1
Expires after: 2026-09-28 America/Chicago
Headline/label context: Austin Daily Briefing has a new look.
Primary copy: Austin Daily Briefing has a new look. The redesigned briefing uses clearer story hierarchy, a more distinct Why It Matters treatment, Austin Ahead for near-term utility, and easier subscriber controls. The editorial mission has not changed, and no action is required.
For each eligible profile, include this What's New note only when the current America/Chicago date is on or before 2026-09-28 and that Profile ID has no Briefing History row with Normalized Key=newsletter-redesign-v0-1. If included, append one matching Briefing History row for that profile with Section=What's New, Category=Product Update, Normalized Key=newsletter-redesign-v0-1, Headline=Austin Daily Briefing has a new look, blank Source URL, Material Update=FALSE, Delivery Status=Pending, blank Provider Message ID, and a concise note identifying the reader-facing redesign announcement. Once recorded for that profile, do not repeat it. After the expiry date, omit it even if no prior history row exists.

EMAIL FORMAT
Generate mobile-safe HTML plus equivalent plain text conforming to `docs/newsletter-component-spec.md` and `docs/source-link-standard.md`. Use the approved durable brand assets from `main`:
- Masthead PNG: https://raw.githubusercontent.com/Flexiblefabric/austin-daily-briefing/main/assets/brand/adb-masthead@2x.png
- Reversed footer mark: https://raw.githubusercontent.com/Flexiblefabric/austin-daily-briefing/main/assets/brand/adb-mark-reversed@2x.png

Use a single-column Paper reading surface with maximum width 620px, inline CSS, email-safe fallback fonts, readable 16px-or-larger body text, strong contrast, and practical tap targets near 44px. The masthead is an image asset, not reconstructed HTML text. Why It Matters uses Warm Wash #F2EFE8 plus a Signal Red #DB2D2D left rule. Under the Radar uses a Signal Red top rule, Warm Wash header band, and Paper story body; nested Why It Matters keeps its standard treatment. More for You remains visually integrated with the shared briefing. Austin Ahead uses typography and GO/WATCH/PLAN labels rather than filled pills. What's New is quiet: Paper background, no red rule or large card, one compact paragraph, and no button unless action is genuinely required. Center the Charcoal footer, reversed compact mark, receiving-context copy, primary Pause or unsubscribe control, and utility links.

On narrow screens, stack Weather copy and temperature into full-width rows so the condition headline is not squeezed. Avoid scripts, forms, fragile CSS, absolute positioning, CSS Grid for required behavior, or background images for essential information. All editorial content must remain usable if images are blocked or dark mode changes colors.

Every HTML edition must include the public website, Customize, Manage/Pause-or-unsubscribe, Feedback & Corrections, Corrections Log, Privacy, and Terms destinations. Use the live Feedback & Corrections form: https://docs.google.com/forms/d/e/1FAIpQLSc_0-djww4qboFaEn9k-nEponrCBBqz-MCB81sOUtLjVsOZ7w/viewform

SOURCE-LINK PRESENTATION
Follow `docs/source-link-standard.md` (`ADB-LINKS-1.0`). For every Top Story, Under the Radar item, More for You item, and sourced Friday recap item, keep the headline unlinked and place visible publisher-named source links after the summary and Why It Matters. Use `Source: [Publisher] →` for each editorial source; repeat the complete label for multiple sources. Do not use generic or document-type-only labels such as `Read more`, `Read the report`, `Read the announcement`, `See the details`, or `Agenda`. Source badges identify source type but never replace publisher attribution. Use `Event details: [Organizer or venue] →` for events and `Forecast: National Weather Service →` for weather. In HTML, make each source link an underlined inline-block with strong contrast, at least 16px text, comfortable vertical padding, and inline CSS. In plain text, use the same label and publisher, followed on the next line by the raw URL. Preserve the same destinations and order in HTML and plain text.

PRE-QUEUE VALIDATION
For each profile verify: subscriber and profile are uniquely eligible and Active; the approved masthead and footer asset URLs are present; no Off topic appears in More for You; saved volume and depth settings are reflected; More for You and Austin Ahead orientation lines are present when those sections render; every Austin Ahead item has exactly one GO/WATCH/PLAN label; What's New appears only when the active release-notice rule qualifies; every source/event link was reviewed; no inaccessible source is sole support; every editorial item has visible publisher attribution; no prohibited generic source label remains; the live Feedback & Corrections destination is used; HTML and plain text contain the same destinations in the same order; repeat rules are satisfied; HTML is intact; plain text contains the same essentials; mobile Weather can stack without squeezing the copy; and the subject is correct. Remove or replace a failing optional item. Abort for a safety-gate or recipient/profile-identity failure.

QUEUE AND HISTORY
After all gates and per-profile validation pass, append exactly one Outbound Messages row for the edition with Message ID, Created At, Profile ID, Email, Template ID=DAILY_BRIEFING_V1, Status=Queued, Subject, Customize URL, blank Sent At / Gmail ID, concise Notes, complete Plain Text, complete HTML, and Run ID. The Message ID must use DAILY-LIVE:[Profile ID]:[Run ID], be deterministic, and an existing Message ID must never be appended or modified. Keep Plain Text and HTML individually below 45,000 characters.

Then append one Briefing History row per Top Story, Under the Radar item, Austin Ahead item, More for You item, sourced Friday recap item when tracked, and qualifying What's New notice for that exact Run ID and Profile ID. Do not use Profile ID ALL for new delivery-linked rows. Populate the existing editorial fields, set Delivery Status=Pending, leave Provider Message ID blank, and note that the item is awaiting Resend delivery. If the queue row or any required history row cannot be written consistently, abort and report the mismatch; never send directly. The Apps Script dispatcher will recheck eligibility, submit the queued payload to Resend, and mark both the queue and matching history rows Sent or Failed. Report profiles generated and editions queued—not recipients sent—and include exclusions and material warnings.

RELEASE B BRIEFING MONITORING

After the production briefing run completes, update only the fixed Morning Briefing row in the PRODUCTION INTAKE workbook. Require Release B Version=B, Release B Controlled Test=PASS, Production Cutover State permitting live operation, Admin Alert Email=the configured Administrator Alert Address from Release Config, and Success Notifications=Silent. All existing briefing safety gates remain authoritative.

A fully completed gated run with zero eligible Active recipients is Healthy and must be recorded as an intentional zero-recipient success. Any explicit research, generation, validation, recipient-resolution, queue-write, history-write, or safety-gate failure marks Morning Briefing Failed immediately. Set Last Attempt on every actual attempt and Last Success only after successful completion. Never append duplicate status rows.

Preserve the earliest unresolved failure timestamp until genuine recovery and calculate Unhealthy For compactly (for example 17m, 2h 17m, or 1d 3h). Use an incident key based on Morning Briefing plus the America/Chicago calendar date. Send at most one failure alert per America/Chicago day using the validated Release A Gmail delivery path and a stable subject. The alert must identify Morning Briefing and the exact failed stage, include the compact unresolved duration, and link directly to Operations Status; for configuration or release-gate failures, also link directly to Release Checklist.

Record recovery silently and only with evidence of a successful later run. Clear Incident Key and Unhealthy For on recovery, append one idempotent recovery history record, retain Operations History for 30 days, and send no recovery email. Monitoring failures must never replay or duplicate a briefing email or Briefing History entry. Successful runs remain silent.

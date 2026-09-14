# Austin Daily Briefing — Canonical Automation Prompt

**Specification ID:** `ADB-DAILY-PROD-1.0`  
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
Create Austin Pulse with weather; about five Top Stories with compact geography/source badges, summaries, and Why It Matters; an optional consequential Under the Radar item; Things to Do / Keep an Eye On with accessible event links; and a profile-personalized More for You section, roughly 3–5 useful items at Standard volume and adjusted by the saved volume. On Friday only, include a This Week in Austin recap of no more than three concise points. Do not add filler or repeat a Top Story in More for You without a distinct angle.

EMAIL FORMAT
Generate mobile-safe HTML plus equivalent plain text. Use a single-column layout around 600px wide, inline CSS, system fonts, white/light-neutral body, restrained dark navy/charcoal header, readable 16px body text, strong contrast, and tap targets near 44px. Avoid scripts, forms, fragile CSS, absolute positioning, and layout-dependent remote images. Images are optional and fail-soft. If generated, label them "Austin-inspired view." Use semantic source links. Include the public website and clearly labeled Customize My Briefing and Manage Subscription links in every email.

PRE-QUEUE VALIDATION
For each profile verify: subscriber and profile are uniquely eligible and Active; no Off topic appears in More for You; saved volume and depth settings are reflected; every source/event link was reviewed; no inaccessible source is sole support; repeat rules are satisfied; HTML is intact; plain text contains the same essentials; and the subject is correct. Remove or replace a failing optional item. Abort for a safety-gate or recipient/profile-identity failure.

QUEUE AND HISTORY
After all gates and per-profile validation pass, append exactly one Outbound Messages row for the edition with Message ID, Created At, Profile ID, Email, Template ID=DAILY_BRIEFING_V1, Status=Queued, Subject, Customize URL, blank Sent At / Gmail ID, concise Notes, complete Plain Text, complete HTML, and Run ID. The Message ID must use DAILY-LIVE:[Profile ID]:[Run ID], be deterministic, and an existing Message ID must never be appended or modified. Keep Plain Text and HTML individually below 45,000 characters.

Then append one Briefing History row per Top Story, Under the Radar item, event, and More for You item for that exact Run ID and Profile ID. Do not use Profile ID ALL for new delivery-linked rows. Populate the existing editorial fields, set Delivery Status=Pending, leave Provider Message ID blank, and note that the item is awaiting Resend delivery. If the queue row or any required history row cannot be written consistently, abort and report the mismatch; never send directly. The Apps Script dispatcher will recheck eligibility, submit the queued payload to Resend, and mark both the queue and matching history rows Sent or Failed. Report profiles generated and editions queued—not recipients sent—and include exclusions and material warnings.

RELEASE B BRIEFING MONITORING

After the production briefing run completes, update only the fixed Morning Briefing row in the PRODUCTION INTAKE workbook. Require Release B Version=B, Release B Controlled Test=PASS, Production Cutover State permitting live operation, Admin Alert Email=the configured Administrator Alert Address from Release Config, and Success Notifications=Silent. All existing briefing safety gates remain authoritative.

A fully completed gated run with zero eligible Active recipients is Healthy and must be recorded as an intentional zero-recipient success. Any explicit research, generation, validation, recipient-resolution, queue-write, history-write, or safety-gate failure marks Morning Briefing Failed immediately. Set Last Attempt on every actual attempt and Last Success only after successful completion. Never append duplicate status rows.

Preserve the earliest unresolved failure timestamp until genuine recovery and calculate Unhealthy For compactly (for example 17m, 2h 17m, or 1d 3h). Use an incident key based on Morning Briefing plus the America/Chicago calendar date. Send at most one failure alert per America/Chicago day using the validated Release A Gmail delivery path and a stable subject. The alert must identify Morning Briefing and the exact failed stage, include the compact unresolved duration, and link directly to Operations Status; for configuration or release-gate failures, also link directly to Release Checklist.

Record recovery silently and only with evidence of a successful later run. Clear Incident Key and Unhealthy For on recovery, append one idempotent recovery history record, retain Operations History for 30 days, and send no recovery email. Monitoring failures must never replay or duplicate a briefing email or Briefing History entry. Successful runs remain silent.

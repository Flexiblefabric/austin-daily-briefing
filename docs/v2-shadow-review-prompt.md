# ADB V2 Shadow Review — Canonical Prompt

**Specification ID:** `ADB-V2-SHADOW-0.1`  
**Weight fingerprint:** `20-20-15-15-10-10-10`  
**Status:** Development / manual shadow testing  
**Adopted:** 2026-09-14  
**Canonical repository path:** `docs/v2-shadow-review-prompt.md`

This file is the authoritative prompt and scoring contract for manual Austin Daily Briefing V2 story-selection shadow reviews. The saved ChatGPT task is an execution copy. If the task prompt, a prior chat, or a run-time interpretation conflicts with this file, this file controls. Do not change scoring weights, thresholds, override meanings, section boundaries, or output requirements during a run. Proposed changes belong in the evaluation notes and require an explicit revision to this file.

## Execution prompt

Run an isolated Austin Daily Briefing V2 story-selection shadow review for the current **America/Chicago** calendar day. Compare V2 against that day's completed live Austin Daily Briefing.

This is evaluation only. Do not send email, queue messages, edit Google Sheets, change production configuration, alter automations, or create or repair production output. Keep the saved shadow task paused for manual execution.

At the beginning of the result, print:

- Specification ID: `ADB-V2-SHADOW-0.1`
- Weight fingerprint: `20-20-15-15-10-10-10`
- Execution mode: `MANUAL SHADOW — READ ONLY`

If the weights used do not exactly match the fingerprint, stop and report a specification mismatch instead of improvising.

## Authoritative read-only references

- Production database: Google Sheet ID `1pqVjQFqWoRb24jn86lOq6LoYjzBccf4WpE1kOI8_Jk0`.
- Read the active Interest Catalog and current default profile/preference structure needed to construct one generic test profile.
- Read the current-day production Briefing History and, only if needed to reconstruct the production slate, the matching daily briefing queue record.
- Review at least the previous 14 days of Briefing History for repeat control.
- Never use or expose subscriber email addresses, tokens, delivery addresses, or private profile data.
- If no current-day production slate exists, still run V2 and label the production comparison `Not available`. Never create or repair production output.

## Research and candidate discovery

Search current official and primary Austin, Travis County, and Central Texas sources, plus credible independent local reporting. Search broadly across:

- Local government and policy
- Housing, homelessness, and urban life
- Transportation, transit, development, land use, and zoning
- Public safety, courts, public health, and community risk
- Business, technology, and the local economy
- LGBTQ+ community
- Arts, food, music, nightlife, comedy, and events
- Weather, environment, parks, and major regional conditions
- The active Interest Catalog for More for You candidates

Treat **Under the Radar** as a separate discovery lane so early-stage, lower-visibility, or structurally important developments are not crowded out by headline coverage. Score its candidates with the same core model and sourcing standard.

Seek a broad enough candidate pool to test the ranking system across multiple lanes. Do not pad the pool with weak, stale, inaccessible, or irrelevant items merely to reach a number.

Verify that every selected link opens and supports the stated claim. Prefer original reporting or the most authoritative accessible source. Replace inaccessible, stale, blocked, or paywalled sources when practical. An inaccessible source may not be the sole support for an included claim.

## Source-confidence gate

Source confidence is an eligibility and validation gate, **not a scored component**.

Reject or replace a candidate when its central claim cannot be supported by an accessible, credible source. Strong sourcing never adds points to the base score, and weak sourcing may not be rescued by Selection Balance, personalization, or either editorial control.

## Repeat and material-change gate

Before scoring a previously covered topic:

1. Determine whether a material development occurred.
2. Record `Material Update = TRUE` or `FALSE`.
3. State exactly what changed.

A material development may include a vote, ruling, deadline, funding decision, lawsuit, construction phase, hearing, cancellation, opening, closure, official release, new data, or another change that alters what the reader knows or can do.

- If a repeated topic has **no material development**, reject it as a repeat.
- If a material development exists, the candidate becomes eligible for scoring. Material Update does not guarantee selection or automatically add bonus points.
- Score the development's incremental reader value under **New-information value**.
- Apply the separate **Freshness Veto** after scoring when appropriate.

## Fixed 100-point base score

Use whole-number component scores. Do not substitute, merge, add, remove, or reweight factors.

| Component | Maximum | Scoring question |
|---|---:|---|
| Local impact | 20 | How broadly or deeply could this affect people in the Austin area? |
| Consequence | 20 | How significant, durable, costly, risky, or institutionally important is the development? |
| New-information value | 15 | For a new topic, how much genuinely new value does it provide? For a repeat, how meaningful is the material change and its incremental reader value? |
| Austin relevance | 15 | How directly is the story tied to Austin residents, institutions, decisions, geography, or daily life? |
| Timeliness / actionability | 10 | Why does it matter now, and can readers prepare, respond, attend, participate, or make a near-term decision? |
| Public-interest value | 10 | Does it improve civic accountability or understanding of safety, equity, access, public systems, or community conditions? |
| Underreported / discovery value | 10 | Does ADB add value by surfacing a consequential development readers could reasonably miss? |
| **Total** | **100** | |

### Scoring anchors

For each component:

- `0`: absent or effectively irrelevant
- Approximately half credit: meaningful but limited, indirect, or mixed
- Full credit: unusually strong and clearly demonstrated

Explain component scores using the candidate's facts. Do not assign totals impressionistically. The base score must equal the sum of all seven displayed components.

A candidate normally needs a base score of at least **60** to remain eligible. No editorial control may rescue a candidate below 60.

## Section and personalization boundaries

The base score measures editorial value and is shared across profiles.

- Do not include personal preference as an eighth component.
- Do not modify base scores for High, Normal, or adjacent-interest matches.
- Use the base score directly when considering shared Top Stories and Under the Radar.
- Personalization applies only to **More for You**.
- For More for You, first require base score `>=60`, then use the generic profile's saved High/Normal/Off preferences and adjacent interests as secondary selection and ordering signals.
- Exclude Off topics from More for You.
- The shared Top Stories slate must not be personalized.
- Things to Do / Keep an Eye On remains an event-utility section, not a back door for low-scoring news candidates.

Use one generic/default test profile constructed from the active preference structure. Do not use a real subscriber identity.

## Freshness Veto

The Freshness Veto prevents stale reader experience even when a repeated story contains a technically material development.

It:

- May apply in any section.
- Applies only after a repeated story passes the Material Change gate and receives its base score.
- Is appropriate when the new facts provide insufficient additional reader value relative to recent coverage.
- May demote or exclude the candidate.
- Never changes the base score or the `Material Update` label.
- Is ephemeral to the current run and must not become a stored preference or permanent story penalty.
- Must be labeled `Freshness Veto` with a concise explanation such as: `Real change; insufficient new reader value after yesterday's coverage.`

Do not use the Freshness Veto merely because a story is less important than higher-ranked candidates. Ordinary displacement is not a veto.

## Discovery Promotion

Discovery Promotion adds a strong, surprising, or distinctive personalized item that numeric ordering may miss.

It:

- Applies only within **More for You**.
- May promote at most one candidate per profile per run.
- Requires an accessible credible source, a base score of at least 60, and compatibility with the profile's saved preferences or a reasonable adjacent interest.
- May reorder an eligible personalized candidate but never changes its base score.
- May not place a personalized story into shared Top Stories or Under the Radar.
- May not rescue an Off topic, weak sourcing, a non-material repeat, or a below-floor candidate.
- Is ephemeral and must not create or modify a stored preference.
- Must be labeled `Discovery Promotion` and explain the distinct surprise or discovery value.

Freshness Veto and Discovery Promotion are separate controls. Never use one as a substitute for the other.

## Selection Balance

Apply Selection Balance only after eligibility checks and base scoring.

Selection Balance may reorder, demote, or omit eligible candidates to avoid an overconcentrated final slate and to preserve meaningful coverage across importance, geography, subject, and community impact.

Selection Balance:

- Never changes or conceals a base score.
- Is not a quota system.
- Must not elevate a below-floor or weakly sourced candidate.
- Must not force inclusion of a weak lane merely for variety.
- Should normally avoid more than two shared Top Stories arising from the same meeting, press release, institutional event, or substantially identical development.
- Must identify every affected candidate as `Promoted by balance`, `Demoted by balance`, `Omitted by balance`, or `No effect`, with a short reason.

Two stories about the same institution are not automatically duplicative when they concern genuinely different decisions and reader consequences.

## Austin Pulse treatment

Austin Pulse is a preview of the briefing's upcoming Top Stories. A story appearing in both Austin Pulse and its full Top Story is intentional and must not be flagged as duplication.

Do not score Austin Pulse as an independent candidate or treat it as a separate content lane.

## Required output

Return only the following sections.

### 1. Run summary

Include:

- America/Chicago date
- Specification ID
- Weight fingerprint
- Execution mode
- Number of candidates reviewed
- Whether the production comparison was available
- Generic-profile preference summary without identity data
- Confirmation that no production write or delivery occurred

### 2. V2 Top 10

Show ranked candidates in a table. For each include:

- Rank
- Candidate
- Proposed section or lane
- The seven component scores
- Base-score total
- Material Update status when applicable
- Selection Balance effect
- Freshness Veto or Discovery Promotion, if used
- Concise rationale
- Verified source link or links

Clearly distinguish shared Top Stories, Under the Radar, More for You, and event-section candidates. Do not present a personalized candidate as a shared Top Story.

### 3. Production comparison

Compare V2 with the completed live ADB by actual section. Identify:

- Retained
- Reframed
- Newly elevated
- Demoted
- Omitted
- Different section placement

Give the likely reason for each difference. Do not claim to know production causality when the reason is an inference. Do not treat Austin Pulse previewing a Top Story as duplication.

### 4. Material-update audit

List every reviewed candidate marked `Material Update = TRUE`, including:

- What changed
- Prior coverage date when available
- Base score
- Final treatment
- Whether the Freshness Veto was applied

### 5. Notable rejects

Show the strongest rejected candidates with:

- Base score when scored
- Material Update status when applicable
- Explicit rejection reason: below floor, non-material repeat, Freshness Veto, weak sourcing, low Austin relevance, ordinary rank displacement, or Selection Balance
- Do not describe ordinary displacement as a qualitative override.

### 6. Evaluation

State whether V2 appears better, worse, or mixed for this run. Identify:

- Material production omissions V2 corrected
- Production choices V2 should have retained
- Possible false promotions or demotions
- Scoring ambiguities
- Repeat-control behavior
- Balance behavior
- Any recommended specification change

Recommendations do not modify this specification. Continue using `ADB-V2-SHADOW-0.1` until the canonical file is explicitly revised.

## Prohibited behavior

Do not:

- Generate a publishable briefing, subscriber email, HTML template, queue record, or delivery artifact.
- Write to production or development data.
- Change an automation or its schedule.
- Invent weights or silently reinterpret component meanings.
- Score source confidence or personal relevance as base-score components.
- Use personalization outside More for You.
- Use Discovery Promotion to solve repetition.
- Use Freshness Veto to promote a candidate.
- Treat Austin Pulse as a separate scored section.
- Expose subscriber data.

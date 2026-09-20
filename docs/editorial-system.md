# Austin Daily Briefing Editorial System

**Version:** 0.1  
**Status:** Working draft for review  
**Internal creative principle:** **Serious about the facts. Alive to Austin.**  
**Proposed canonical path:** `docs/editorial-system.md`

## 1. Purpose

The Austin Daily Briefing Editorial System defines what ADB promises readers and how that promise should appear in the finished publication.

It governs reader-facing editorial judgment, voice, story anatomy, section purpose, sourcing, explanation, repetition, personalization boundaries, corrections, and quality control.

It does **not** replace the detailed mechanics of the V2 story-selection specification, production automation, subscriber operations, or visual design system. Those systems implement ADB. This document defines the editorial product they are expected to produce.

ADB's core job is simple:

> **Help readers understand what matters in Austin, what changed, why it matters, and what is worth watching next — without turning staying informed into another task.**

## 2. Publication Identity

Austin Daily Briefing is an independent local briefing product based in Austin.

It brings together important local reporting, official information, community developments, events, practical context, and a limited amount of personalized material.

ADB is not affiliated with the City of Austin, another government agency, or the publications and public sources it links to.

ADB does not currently operate as an original-reporting newsroom. It depends on reporting, public records, official announcements, event information, and other material produced by outside sources.

Human oversight sets ADB's priorities, designs its rules, reviews its performance, and remains responsible for the finished product. Automated and AI-assisted tools may help discover, compare, organize, summarize, and personalize public information, but they do not establish the publication's values or remove human responsibility for what is published.

## 3. Editorial Mission

ADB should be:

- **Local by default.** Austin, Travis County, and directly relevant Central Texas developments come first.
- **Curated rather than comprehensive.** The goal is not to reproduce the entire local news cycle.
- **Explanatory rather than headline-only.** A reader should understand the consequence, not merely the occurrence.
- **Useful rather than performative.** Space is earned by reader value, not by a need to make the edition look full.
- **Current without being repetitive.** Calendar movement alone does not make an old story new.
- **Broadly civic without becoming bureaucratic.** Government matters because its decisions affect life in the city, not because meetings happened.
- **Alive to the city.** Arts, food, nightlife, community life, business, culture, recreation, and everyday practical conditions belong alongside policy and public systems.
- **Transparent.** Sources, personalization, corrections, and uncertainty should be visible rather than hidden.

## 4. Reader Experience

ADB should reduce information work.

A standard edition should allow a reader to:

1. Understand the shape of the day quickly.
2. Identify the most consequential local developments.
3. Understand what is genuinely new.
4. See why each major development matters.
5. Follow the original source when more detail is needed.
6. Notice important information that may be receiving limited attention.
7. Receive a modest amount of personally relevant material without losing the shared Austin briefing.
8. Plan around near-term events, deadlines, disruptions, and opportunities.

The publication is successful when a reader can stop after ADB and reasonably feel oriented to the day.

## 5. Voice and Tone

ADB is accurate, factual, serious, clear, and engaged.

It should not sound like board-meeting minutes.

Austin is constantly moving: decisions are made, projects advance or stall, roads close, institutions change, neighborhoods respond, businesses open, venues fill, festivals take over streets, and people argue about what the city should become. The writing should reflect that movement through concrete facts and active language.

### Preferred qualities

Use:

- Active verbs.
- Concrete nouns.
- Clear chronology.
- Specific consequences.
- Ordinary language where technical terminology is unnecessary.
- Controlled sentence length.
- Human-scale explanations of institutional decisions.
- Appropriate energy in culture, events, food, and community coverage.

### Avoid

Avoid:

- Clickbait.
- Hype.
- Snark.
- Manufactured urgency.
- Institutional jargon copied without translation.
- Generic importance claims.
- Excessive adjectives.
- Moralizing.
- Unsupported motive attribution.
- Writing that sounds excited merely because something happened.

ADB does not need to sound excited about everything.

It needs to sound awake.

## 6. Neutrality, Civic Coverage, and Contested Claims

ADB informs readers; it does not make political choices for them.

For candidates, elected officials, parties, campaigns, ballot measures, legislation, and contested policy questions:

- Report documented positions, actions, records, and likely or observed policy effects.
- Distinguish facts from claims, analysis, and opinion.
- Attribute disputed interpretations and motive claims to identifiable sources.
- Do not endorse or oppose candidates, parties, ballot choices, or political positions.
- Do not rank political actors or tell readers which political choice is best.
- Do not turn disagreement into false equivalence when evidence is uneven.
- Use neutral, concrete language rather than loaded political labels as ADB's own characterization.
- For polling, identify the pollster, field dates, population, and relevant limitations.
- Do not publish ADB's own election-outcome prediction or electability judgment.

Why It Matters may explain policy consequences, affected groups, timelines, costs, institutional implications, or reader decisions. It must not become a disguised editorial endorsement.

## 7. Standard Edition Anatomy

A standard daily edition follows this editorial structure:

1. Masthead and edition date.
2. Austin Pulse.
3. Weather.
4. Featured Top Story.
5. Remaining Top Stories.
6. Under the Radar, when warranted.
7. More for You.
8. Austin Ahead.
9. Friday recap when applicable.
10. Footer and reader controls.

The visual implementation is governed by `docs/design-system.md` once that document is promoted to the main branch.

## 8. Austin Pulse

### Editorial promise

Austin Pulse gives the reader a short narrative orientation to the day.

It should capture the shape of the edition without becoming a list of headlines.

### Rules

Austin Pulse:

- Previews the shared Top Stories.
- Is not an independently scored content lane.
- May intentionally reference stories that appear again in full later in the edition.
- Should not introduce unrelated stories merely to make the paragraph more colorful.
- Should not repeat full Why It Matters explanations.
- Should normally remain one compact paragraph.

Its job is to answer:

> **What kind of day is this in Austin?**

## 9. Weather

### Editorial promise

Weather tells readers what conditions are likely to mean for their day.

Prioritize practical usefulness over meteorological detail.

### Rules

Weather should:

- Use a current authoritative forecast, normally the National Weather Service.
- State meaningful heat, cold, storms, flooding, air-quality concerns, or other disruptions when supported.
- Give practical context when warranted.
- Remain brief when conditions are routine.
- Avoid unsupported medical advice or dramatic language.

Weather is a utility section and does not require a separate Why It Matters component.

## 10. Top Stories

### Editorial promise

Top Stories are the shared developments that best explain what matters in Austin today.

They are not personalized.

A standard edition should contain about five shared Top Stories. The first may be presented as the Featured Top Story, but Featured status is a presentation distinction rather than a separate editorial lane.

### Selection principles

The active selection system should consider:

- Local impact.
- Consequence.
- New-information value.
- Austin relevance.
- Timeliness and actionability.
- Public-interest value.
- Underreported or discovery value.
- Source quality as an eligibility requirement.
- Appropriate balance across the final slate.

Exact scoring weights, thresholds, gates, and control mechanics belong in the active V2 selection specification rather than this document.

Top Stories should not become a list of routine meetings, hearings, openings, or scheduled events merely because they occur today.

## 11. Standard Story Anatomy

A standard editorial story follows:

> **Headline → Metadata → Summary → Why It Matters → Sources**

### Headline

The headline identifies the material development.

It should be:

- Specific.
- Accurate.
- Concrete.
- Usually active.
- Written in sentence case.
- Free of clickbait.
- Precise about whether something is proposed, approved, filed, adopted, opened, closed, delayed, scheduled, or completed.

Prefer the development over the institution.

Weak:

> City Council discusses zoning item

Stronger:

> Council advances new transit-oriented zoning rules

Do not imply final action when only a proposal, recommendation, agenda item, or preliminary vote exists.

### Metadata

Metadata helps the reader orient quickly.

Useful fields may include geography, subject, and source character.

Keep it compact. Metadata should not become a wall of tags.

### Summary

The summary answers:

> **What happened?**

It should identify the material facts, current status, relevant actor, and useful timing without forcing the reader through unnecessary background.

Subscriber `Summary Style` may change depth, but it must not change the underlying facts or editorial conclusion.

## 12. Why It Matters

Why It Matters is a defining ADB feature.

It is not a slogan, opinion box, or generic statement that a topic is important.

The summary answers:

> **What happened?**

Why It Matters answers:

> **What changes because of it?**

### Required use

Why It Matters is required for:

- Featured Top Story.
- Every standard Top Story.
- Under the Radar.

It should also appear on substantive news or analysis items in More for You when consequence or context is part of the item's value.

Weather and ordinary Austin Ahead listings do not require a separate Why It Matters box because their utility description already serves a different function.

### What a strong Why It Matters does

A strong explanation may identify:

- Who is affected.
- What practical consequence follows.
- What changes in cost, access, safety, mobility, housing, services, governance, or daily life.
- Whether the effect is immediate or longer-term.
- What decision or implementation step comes next.
- What readers may need to do or understand now.
- How a technical or administrative action connects to a larger Austin system.

### Evidence discipline

Why It Matters must remain anchored to evidence.

Use certainty that matches the underlying facts:

- **Does / will** when the consequence is established or directly follows from completed action.
- **Would** for a proposal or conditional action.
- **Could / may** when a downstream consequence is plausible but not guaranteed.
- Attribute projections, forecasts, disputed effects, and advocacy claims to their source.

Do not turn a plausible consequence into a fact.

Do not infer motives.

Do not simply restate the summary.

Weak:

> **Why It Matters:** Housing affordability is an important issue in Austin.

Stronger:

> **Why It Matters:** The funding closes part of the project's financing gap, moving the proposed income-restricted apartments closer to construction in an area already seeing rapid redevelopment.

### Length

Subscriber `Why It Matters Length` changes depth, not meaning.

- **Brief:** usually one strong sentence.
- **Standard:** usually one or two sentences.
- **Detailed:** two or three sentences when additional context genuinely improves understanding.

Detailed does not mean padded.

## 13. Sources and Attribution

Every substantive published item should identify and link to the source that supports it.

ADB favors direct evidence and original reporting over repeated summaries of the same information.

### Source standard

Use current official or primary sources and credible independent reporting.

Prefer, when appropriate:

1. Direct official records or primary evidence for the underlying action or data.
2. Original local reporting for independent context, verification, and human consequences.
3. Established wire or broader reporting when it materially improves understanding.

An inaccessible, stale, blocked, or paywalled source should not be the sole support for a central claim when an accessible alternative can reasonably be found.

Strong sourcing is an eligibility requirement. It does not make a weak story important.

### Presentation

The detailed presentation standard remains `docs/source-link-standard.md`.

Canonical editorial link:

`Source: [Publisher] →`

Weather:

`Forecast: National Weather Service →`

Austin Ahead event:

`Event details: [Organizer or Venue] →`

Headlines remain unlinked.

## 14. Repeat Control and Material Change

ADB should not make readers reread yesterday's story simply because the subject remains in the news.

Review at least the previous 14 days of briefing history when evaluating repeat coverage.

For a previously covered topic, determine whether a material development occurred before treating it as a new story.

Material developments may include:

- Completed votes.
- Rulings.
- Funding decisions.
- Filed lawsuits.
- Changed construction phases.
- Hearing outcomes.
- Cancellations.
- Actual openings or closures.
- Official releases of meaningful new data.
- Newly announced or materially changed deadlines.
- Other verified developments that change what the reader knows or can do.

A previously announced meeting, deadline, hearing, opening, or event merely arriving on the calendar is not itself a material update.

### Event timing is separate

`Upcoming`, `today`, and `completed` describe timing.

They do not prove that new information exists.

A same-day reminder may be useful in Austin Ahead even when it does not qualify as a new Top Story.

## 15. Freshness

Material change and reader freshness are separate questions.

A repeated story may contain a technically real development while still offering too little additional reader value to deserve another prominent appearance.

The active selection specification may use a Freshness Veto or comparable control after material-change eligibility and scoring.

Freshness controls must not erase the fact that a real change occurred. They govern whether the change earns scarce reader attention today.

## 16. Selection Balance

ADB should produce a useful edition, not merely a descending score table.

After eligibility and ranking, editorial balance may reorder, demote, or omit otherwise eligible stories when the final slate would be excessively concentrated by subject, geography, institution, or one underlying event.

Balance is not a quota system.

It must not:

- Rescue weak sourcing.
- Elevate an ineligible story.
- Force a weak subject lane merely for variety.
- Hide a story's underlying editorial value.

Multiple stories from the same institution can be appropriate when they concern genuinely different decisions and reader consequences.

## 17. Under the Radar

### Editorial promise

Under the Radar surfaces a consequential development that readers could reasonably miss.

It is an independent discovery lane, not a consolation prize for a story that missed Top Stories.

### Rules

Under the Radar should:

- Be searched independently through official agendas, records, local organizations, specialist reporting, community sources, and other credible material.
- Identify a specific overlooked fact, action, decision, or development.
- Meet the same sourcing and basic editorial-quality standards as the rest of ADB.
- Include Why It Matters.
- Appear in only one place in the edition.

If an independently discovered item proves important enough for Top Stories, promote it there and do not duplicate it in Under the Radar.

Under the Radar may be empty.

Do not backfill it with a rejected headline merely to preserve the section.

## 18. More for You

### Editorial promise

More for You adds personally relevant material without changing the shared Austin civic briefing.

### Boundaries

Personalization applies only to More for You.

Subscriber preferences:

- Do not change Top Story selection.
- Do not remove essential Austin coverage.
- Do not change Under the Radar.
- May guide the selection and ordering of eligible personalized items.
- May use reasonable adjacent interests when permitted by the active selection specification.
- Must exclude topics explicitly set to Off.

Personalized content must still meet the applicable sourcing and editorial-quality floor.

Do not repeat a Top Story in More for You unless the personalized item offers a genuinely distinct angle.

Personalization should broaden usefulness, not create an isolated filter bubble.

## 19. Austin Ahead

### Editorial promise

Austin Ahead is the daily near-term utility section.

It highlights upcoming Austin-area events, openings, deadlines, disruptions, decisions, and other developments worth attending, planning around, or watching.

It appears in every standard daily edition.

Always appearing does not authorize filler.

### Time horizon

Prioritize the next 7 days, with flexibility to include something slightly farther out when advance planning is genuinely useful.

### Mutually exclusive taxonomy

Every item receives exactly one reader-action label:

- **GO** — attend, visit, experience, or participate.
- **WATCH** — a consequential development approaching that primarily requires awareness.
- **PLAN** — something requiring preparation, registration, rerouting, scheduling, or another practical adjustment.

When more than one label could apply, choose the primary reason the item is useful.

### Repeat control

Austin Ahead follows the same history and repetition discipline as the rest of ADB.

An event may remain useful as its date approaches, but repetition must add practical value rather than simply repeat the same description every day.

A previously covered civic story should not be moved into WATCH merely to bypass the material-change rule.

### Empty state

If no qualifying item survives the section's standards, retain the section with a concise honest empty state rather than lowering the quality floor.

Recommended wording:

> **No major Austin Ahead items to flag today.**

### Friday

A future Friday edition will expand Austin Ahead into a distinct Friday section. That feature requires a separate specification and is not defined here.

## 20. Friday Recap

Until a dedicated Friday product is specified, Friday editions may include a concise `This Week in Austin` recap of no more than three meaningful developments.

The recap should explain the arc of the week rather than repeat five days of headlines.

It must follow normal sourcing and repeat-control standards.

## 21. Uncertainty and Developing Information

ADB should state uncertainty rather than smooth it over.

Use language such as:

- `according to...`
- `officials said...`
- `the proposal would...`
- `the filing alleges...`
- `as of [time/date]...`
- `the cause has not been determined...`

when that is what the evidence supports.

Do not use `confirmed` unless the underlying source actually supports confirmation.

When a fast-moving story changes materially after publication, the later edition should identify what changed rather than silently presenting the new state as though it had always been known.

## 22. High-Stakes Language

For public safety, courts, health, disasters, and other high-consequence subjects, precision takes priority over dramatic writing.

### Courts and public safety

Distinguish:

- Investigated.
- Detained.
- Arrested.
- Charged.
- Indicted.
- Convicted.
- Sentenced.

Do not collapse allegations into established facts.

Avoid unnecessary graphic detail and sensational framing.

### Public health

Use authoritative health sources for exposure notices, advisories, risk information, and recommended actions.

Do not infer medical advice beyond the source.

### Deaths and injuries

Use verified counts and attribution when figures are still developing.

Avoid turning human harm into spectacle.

## 23. Corrections and Clarifications

ADB maintains a public feedback and corrections process.

Readers can report possible errors, request clarification, share feedback, or identify accessibility and technical problems through the public form.

When a material error or meaningful clarification is confirmed:

- Publish a visible notice in the next available briefing.
- Add the confirmed change to the public corrections log.
- Identify the affected briefing date.
- State what was wrong or unclear.
- State what changed.
- Include a supporting source when available.
- Do not publish the submitter's identity or private message.

Do not silently alter the public record in a way that hides a material mistake.

A submission does not automatically mean ADB was wrong. Unconfirmed or declined requests do not belong in the corrections log.

## 24. Independence and Conflicts

No outside organization should direct ADB story selection.

If sponsorships, partnerships, financial support, or material conflicts are introduced later, they should be disclosed and kept separate from editorial decisions.

Advertising or sponsorship, if ever introduced, must be visually and editorially distinguishable from ADB-selected content.

## 25. AI-Assisted Editorial Work

AI-assisted tools may help with:

- Discovery.
- Comparison.
- Repeat checks.
- Organization.
- Summarization.
- Personalization.
- Drafting.
- Quality-control support.

AI can misunderstand a source, miss context, overstate certainty, or produce an inaccurate summary.

Therefore:

- Source links remain essential.
- Central claims must be traceable to evidence.
- Automated scoring does not replace source validation.
- Human editorial responsibility remains.
- Consequential information should be presented in a way that lets readers reach the responsible agency or original reporting easily.

## 26. Editorial QA

Before publication, verify:

1. The central claim is supported by an accessible credible source.
2. The headline accurately reflects the current status of the action.
3. Proposal, approval, filing, vote, opening, closing, and completion language is correct.
4. Repeat history has been checked where applicable.
5. A repeated story has a verified material change.
6. Event timing has not been mistaken for new information.
7. The summary answers what happened.
8. Why It Matters adds consequence rather than repetition.
9. Why It Matters uses certainty appropriate to the evidence.
10. Contested claims are attributed.
11. Political coverage is informational rather than persuasive.
12. The story belongs in its assigned section.
13. Under the Radar was not backfilled merely to fill space.
14. More for You does not alter the shared core or include an Off topic.
15. Austin Ahead uses exactly one GO, WATCH, or PLAN label.
16. Source links identify the publisher or issuing organization.
17. The source actually opens and supports the stated claim.
18. No obvious jargon, hype, or bureaucratic filler remains.
19. Corrections from prior editions that require disclosure are handled visibly.
20. The finished item earns the reader's time.

## 27. Relationship to Other ADB Specifications

This document defines editorial intent and reader-facing standards.

### Design System

`docs/design-system.md` governs visual identity and presentation.

### V2 story-selection specification

`docs/v2-shadow-review-prompt.md` currently governs the detailed V2 scoring model, thresholds, material-change gate, Freshness Veto, Discovery Promotion, Selection Balance mechanics, and shadow-review output while V2 remains in development.

This Editorial System should not silently modify those mechanics.

If editorial policy changes require a scoring change, revise the V2 specification explicitly.

### Production morning prompt

`docs/automation-prompts/austin-daily-briefing.md` governs the production automation's execution, data reads, safety gates, queueing, history writes, and delivery handoff.

Operational mechanics should not be copied into this document unless they change the reader-facing editorial promise.

### Source-link standard

`docs/source-link-standard.md` governs source-link presentation in detail.

### Corrections operation

`docs/feedback-corrections-promotion.md` records the current live feedback and corrections workflow.

## 28. Governance

Once approved, this file should become the canonical source for reader-facing ADB editorial standards.

The Editorial System defines **what ADB publishes and how it should behave editorially**.

Implementation specifications define **how the system accomplishes that behavior**.

A formal Editorial System revision is warranted when changing matters such as:

- Publication mission.
- Core voice and neutrality standards.
- Section editorial promises.
- Why It Matters requirements.
- Personalization boundaries.
- Repeat/material-change principles.
- Under the Radar purpose.
- Austin Ahead purpose or taxonomy.
- Corrections philosophy.
- Source expectations.
- Major editorial QA standards.

Scoring-weight adjustments, automation schedules, delivery providers, CSS changes, and subscriber-processing mechanics belong in their respective specifications unless they alter the editorial promise.

## 29. Editorial Standard in One Sentence

> **ADB should tell readers what changed, show them why it matters, point them to the evidence, and leave them better oriented to Austin than when they opened the briefing.**

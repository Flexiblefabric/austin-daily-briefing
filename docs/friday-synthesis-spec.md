# Friday narrative synthesis — THIS WEEK IN AUSTIN

**Specification ID:** `ADB-FRI-SYNTH-1.0`\
**Status:** Approved product definition; staged, not active production\
**Decision date:** 2026-10-04, America/Chicago\
**Roadmap:** FRI-1 definition complete; validation and promotion remain separate gates

## Authority and purpose

This document records the Friday whiteboard decisions approved by Anthony. It defines the target product; merging it does not activate that product. The interim Friday rules in the [Editorial System](editorial-system.md), [component specification](newsletter-component-spec.md), and [production prompt](automation-prompts/austin-daily-briefing.md) remain operative until explicit promotion. The promoted [V2 selection contract](v2-selection-spec.md), `ADB-V2-SELECT-1.0`, supplies the daily editorial baseline.

`THIS WEEK IN AUSTIN` is the shared, non-personalized Friday narrative synthesis of the week's most consequential developments. It explains how meaningful stories evolved, what materially changed, and where matters stand. It adds perspective to reporting already surfaced rather than collecting the week's biggest headlines. Its governing principle is **narrative synthesis, not narrative invention**.

## Appearance, anatomy and placement

Publish on Friday when at least one qualifying weekly arc exists. Omit the section when none exists; record the reason internally. One strong arc is enough. Two or three are appropriate only when warranted, with a hard maximum of three. One dominant arc may form a continuous narrative instead of being artificially divided.

Primarily synthesize Monday through the Friday generation cutoff in America/Chicago. Friday means information available at generation, not developments later that day. Earlier context may be used when necessary and evidenced. An arc qualifies through meaningful evolution, a materially changed end state, an evidenced relationship among developments, or a consequential unresolved issue whose status became clearer. Importance alone does not turn a one-day headline into a weekly arc.

| Element | Target treatment |
| --- | --- |
| Section label | `THIS WEEK IN AUSTIN` |
| Opening remarks | A strong contextual paragraph when useful; loose maximum about 120 words, with no minimum |
| Body | One to three substantive arcs, or a continuous dominant-arc narrative; brief descriptive headings when helpful |
| Overall length | Roughly 250–450 words as guidance, never a quota; shorter is valid |
| Sources | Consolidated source area supporting each arc or the continuous narrative; full internal evidence retained |
| Position | After More for You, before Austin Ahead; omitted optional sections do not affect this order |

The opening frames context, tension, contrast, or the character of the week. It need not preview each arc. It may acknowledge that the major developments were unrelated; do not force a unifying theme. Narrative order follows understanding: an outcome may precede an explanation of how it arose. Avoid a mechanical day-by-day sequence or mandatory conclusion. Weekly context and significance may be integrated in the prose without adding a second daily-story template.

The target sequence is **Top Stories → Under the Radar → More for You → This Week in Austin → Austin Ahead**. FRI-1 is retrospective synthesis; FRI-2 owns forward-looking Weekend Explorer utility. Restaurant picks, event calendars, weekend recommendations and planning do not enter this section. A verified future milestone is allowed only when needed to explain an existing arc's present status.

## Voice and interpretation

Use a measured, contextual, observant and restrained voice. Reflection and varied prose are welcome; opinion columns, dramatic escalation, motive assignment and unsupported citywide sentiment are not. Name the actual actor: a council majority, an organization or particular commenters cannot stand for all of Austin.

A broader pattern, trend or connection must normally rest on **at least two independently supported developments**. Two articles repeating one announcement are one development. Multiple unrelated developments are not sufficient merely because there are two; the claimed relationship itself needs evidence. Any departure from this normal minimum requires an explicit, evidenced reviewer rationale and must not generalize a single event into a trend.

Sequence does not prove causation. Attribute disputed interpretation and motives; distinguish proposals, allegations, adopted decisions and implemented outcomes. Source-supported interpretation remains distinguishable from established fact. A dominant event may anchor the section without being called a citywide pattern. Record the supporting claims for the opening as carefully as those in individual arcs.

## Previously uncovered context

Primarily use the shared information ADB actually surfaced during the week. Profile-specific More for You coverage does not establish prior exposure for all readers. In synthetic tests, use the fixture's explicit simulated shared-publication record; never treat it as real subscriber history.

Previously uncovered facts are strongly disfavored and allowed only when they substantially change understanding of a qualifying arc, or omission would leave an egregiously incomplete or misleading account. Log the exact fact, supporting source, exception reason, and where it is transparently introduced as new context. Narrative convenience is insufficient. Do not silently treat an unsent draft, a search result, or a personalized item as shared prior coverage.

## Uncertainty and repetition

Preserve material uncertainty when omission could imply unwarranted resolution, confidence, agreement or permanence. Do not force closure at the end of the week. Avoid boilerplate about structurally obvious inactivity when it adds no useful information, such as no vote during a known council recess. If that omission would nevertheless mislead a reader, clarify it. An unresolved issue does not automatically earn another recap every Friday: require new weekly understanding or material movement.

## Sourcing and visual continuity

Keep the existing identity, typography, restrained rules, accessible publisher-named links and HTML/plain-text destination parity. Group supporting links in a compact source area at the end of each arc; a continuous single-arc narrative may use one consolidated area at its end. Do not interrupt every paragraph with repetitive source lines. An opening relying on distinct evidence must have that evidence covered by the visible source area or a clearly associated consolidated group.

Consolidation changes presentation, not attribution. Every arc needs visible publisher-named links supporting its central claims; do not replace multiple destinations with one ambiguous label. All materially used sources, including context and interpretation sources not individually displayed, must remain in the separate [Friday evidence log](friday-synthesis-evidence-log.md), alongside the normal authorized briefing history. Preserve claim-to-source relationships and source locators sufficient to reconstruct the reasoning; generated prose is never evidence for itself.

This target treatment requires reconciliation with the [Source-Link Standard](source-link-standard.md) at promotion. It does not silently override that active standard today.

## No-filler discipline

No padded opening, symmetry-driven extra arc, invented theme, decorative conclusion, gratuitous history, repetitive uncertainty, or transition that falsely links unrelated developments. A shorter section is successful when it supplies all worthwhile synthesis. The full Friday edition's reading burden must be measured during validation; the 250–450-word guide does not establish that an expanded edition still fits its advertised reading time.

## Validation and lifecycle

Use the [validation plan and scorecard](friday-synthesis-validation.md) and [evidence schema](friday-synthesis-evidence.schema.json). Build synthetic weeks from outputs generated under the current V2 standard: quiet, dominant-story and fragmented. Do not substitute historical pre-V2 ADB issues. Separate scenario construction, synthesis and evaluation to prevent expected conclusions leaking into generated recaps.

Promotion requires successful scenario evaluation, editorial-risk review, controlled rendering/integration QA and Anthony's explicit promotion decision. The first four Friday editions after promotion require recorded human review. Continue the separate evidence log in steady state; four elapsed weeks without four reviewed editions do not satisfy observation.

No scheduler, production prompt, template, queue, subscriber data, delivery behavior or public website changes are authorized by this specification alone.

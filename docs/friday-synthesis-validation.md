# Friday synthesis — validation plan and scorecard

**Validation ID:** `ADB-FRI-VALIDATE-1.0`\
**Status:** Frozen fixtures and exploratory review prepared; independent editorial runs pending\
**Product contract:** [ADB-FRI-SYNTH-1.0](friday-synthesis-spec.md)\
**Weights:** 20–15–15–10–10–10–10–5–5 = 100

## Synthetic V2 inputs

Freeze the current V2 contract and production prompt revisions before building fixtures. Generate simulated daily output under those rules from explicit synthetic source packets, then feed that output to Friday synthesis. Merely writing plausible headlines and calling them V2 output is insufficient. Keep candidate facts, source packets, selections, component scores, cutoff times, material-update decisions, rejected items and simulated shared-publication history reconstructable. Preserve the relevant prior-history seed for V2 repeat decisions.

Label all packets **SYNTHETIC — NOT FOR PUBLICATION**. Fictional facts and local fixture source IDs may support a controlled synthetic test; never attribute invented material to real reporting, fabricate live URLs, or imply live access verification. If actual sources are used as seeds, read and log them, and distinguish unchanged sourced facts from synthetic transformations. These tests assess fidelity and editorial reasoning against their supplied record; they do not prove live research quality or delivery reliability.

| Scenario | Weekly input design | Principal checks |
| --- | --- | --- |
| Quiet | Few material developments; one modest qualifying arc, unchanged repeats and nonqualifying one-day items | Concision, proportionate significance, no padded opening or second arc; add a zero-qualifying-arc variant to check omission |
| Dominant story | One consequential issue evolves across several days; genuine changes in procedural status, with optional unresolved effects | Continuous narrative without artificial subdivision, accurate status, no false closure or unsupported generalization |
| Fragmented | Several substantial but weakly related developments | Useful independent arcs, no fabricated common cause or citywide theme, no forced transitions |

Across these three scenarios, include bounded challenge variants: two articles about one event; a proposed action that is not adopted; a new fact that meets the context exception and a tempting one that does not; material uncertainty versus obvious procedural inactivity; a stale unresolved repeat; and source omission in an otherwise fluent narrative. These extend risk coverage without adding a fourth required week type. Fixture mutations are separate attempts, never retroactive edits of recorded results.

## Separation and reproducibility

1. The constructor freezes source packets, V2 daily outputs and a reviewer-only key describing risks and supported facts. Save content digests and the exact generation instructions. Scenario names and expected outcomes stay out of the synthesizer input; use opaque fixture IDs.
2. The synthesizer receives the product contract, neutral weekly packet and permitted context, not the key or target scores. Preserve its exact input and unedited output, including any omissions.
3. Evaluation receives the frozen input, unedited recap and key. Score only after output is frozen. Use a fresh context or separate operator for the synthesis pass; if role separation cannot be achieved, label that run exploratory and exclude it from promotion evidence. Do not claim independent review merely because the same writer scored its own work later.
4. Preserve failed attempts. Corrections get a new attempt ID and reference the earlier record. Re-run affected cases after a material spec change; do not adjust weights or thresholds to rescue a result.

This separation is a test workflow requirement, not a requirement to create agents or scheduled tasks.

## Weighted rubric

Rate each dimension from 0 to 4; weighted points = weight × rating / 4. Retain fractional points and sum all nine components. `0` is absent or seriously wrong; `1` has major weaknesses; `2` is mixed and needs substantial revision; `3` meets the standard with minor weaknesses; `4` is strong throughout. Attach specific claim or paragraph evidence to each rating. A total is a review aid, not statistical proof.

| Dimension | Weight | Full-credit anchor |
| --- | ---: | --- |
| Factual fidelity | 20 | Every material fact, date, scope and procedural status matches the weekly record or a justified context exception |
| Narrative usefulness | 15 | Adds meaningful weekly understanding beyond headline replay; relationships and end state are clear without a rigid chronology |
| Unsupported-inference control | 15 | No unsupported motives, sentiment, certainty or conclusions; factual and interpretive claims are distinguished |
| Source traceability | 10 | All materially used sources, including opening context, map to claims; displayed links support central claims |
| Pattern and causation discipline | 10 | Broader connections are supported by distinct developments and evidence for their relationship; no sequence-as-cause |
| Material uncertainty | 10 | Consequential limits are preserved without repetitive or obvious disclaimers |
| No filler | 10 | Every paragraph earns its place; one arc or omission works when appropriate; no quota-driven expansion |
| Voice and restraint | 5 | Measured, contextual and readable; no sensationalism, sweeping sentiment or editorializing |
| Structure and readability | 5 | Appropriate opening/body shape, source grouping and section order; reading burden is recorded and proportionate |

**Provisional test disposition:** at least 85/100, every dimension at least 3/4, all automatic-fail checks clear, and all required evidence present produces `pass_candidate`. These numerical cutoffs are implementation proposals for the first review, not user-approved production thresholds or values borrowed from V2's 60-point candidate floor. Anthony's review confirms or revises them before promotion; any revision is versioned and applied consistently across the full suite. A high total cannot override an automatic fail.

## Automatic failure and incomplete evidence

An attempt fails for any fabricated fact; materially unsupported conclusion; materially unsupported causal claim; materially false pattern; materially used but unlogged source; or newly introduced information that violates the context exception. Misstating proposed/adopted status is a factual failure. Missing material uncertainty that creates a false conclusion is also an automatic failure, not merely a style deduction.

Record each check as `clear`, `fail`, or `not_assessed`, with a reason. Missing inputs, unverified scoring, inadequate role separation or unresolved evidence make the run `incomplete`, never a pass. Automated schema checks cannot judge factual accuracy, narrative quality or whether two developments are truly independent.

## Evidence and promotion gate

Use the [separate evidence log](friday-synthesis-evidence-log.md). Retain all attempts, all materially used sources and the exact recap, scores, fail checks and human disposition. No test run has occurred merely because the schema or test plan validates.

Before seeking promotion:

- Complete all three base scenarios and the bounded challenge variants; close material defects with recorded reruns.
- Review automatic failures individually; do not average results across scenarios to hide a failure.
- Obtain Anthony's review of the recaps and scorecard, including the provisional numerical cutoff.
- Stage and verify the production prompt, editorial/component/source-link specifications, V2 Friday boundary and HTML/plain-text order as one consistent change. Check mobile source wrapping and the email clients required by the component standard.
- Measure full-edition length and estimated reading time using a stated method. Resolve any mismatch with public reading-time promises before activation.
- Confirm history access, source logging, promotion/rollback revisions and a workable human-review process for the first four Fridays. Log review timing rather than implying that retrospective review prevented publication.
- Obtain explicit promotion approval; record the effective edition and reconcile the technical registry and release documentation. No promotion is implied by merging this preparation package.

After promotion, log each of the first four Friday editions and Anthony's review, including omitted sections and reasons. A skipped/missing edition is not a reviewed edition. A material failure cannot be marked complete merely because four weeks elapsed: record correction or rollback disposition and unresolved issues. Continue lightweight evidence logging after observation; no new standing automation is introduced here.

## Execution evidence

The [2026-10-04 initial package](friday-evidence/2026-10-04/README.md) freezes the three base weeks plus an omission variant and preserves same-context exploratory output. Those trials are excluded from promotion evidence. Independent passes and the editorial challenge matrix remain pending; integrity-check success is not an editorial pass.

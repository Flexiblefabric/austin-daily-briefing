# Friday synthesis evidence log

**Status:** FRI-5 synthetic review package completed October 7; independent evidence and corrective reruns recorded; integration and promotion pending\
**Product:** [ADB-FRI-SYNTH-1.0](friday-synthesis-spec.md)\
**Rubric:** [ADB-FRI-VALIDATE-1.0](friday-synthesis-validation.md)\
**Record schema:** [friday-synthesis-evidence.schema.json](friday-synthesis-evidence.schema.json)

This is the separate permanent index for Friday validation and subsequent editorial review. It complements normal briefing history and does not replace delivery evidence. Repository records contain synthetic or public editorial evidence only: never subscriber identities, preferences, tokens or private configuration. Follow the existing [data-retention policy](data-retention.md); this log does not expand retention of subscriber or transport records. Store concise source locators and factual notes, not unnecessary full copyrighted articles.

## Scenario status

| Scenario | V2 input packet | Synthesis attempts | Disposition |
| --- | --- | --- | --- |
| Quiet | W031 frozen | W031-exploratory-01; blind-02 | Independent candidate pass; exploratory record retained |
| Dominant story | W075 frozen; rejected construction W074 retained | W075-exploratory-01; blind-02 | Independent candidate pass; exploratory record retained |
| Fragmented | W118 frozen | Exploratory -01/-02; blind-02/-03 | Initial blind context failure retained; corrected fresh rerun candidate pass |

W032 independently omitted the section. W076/W077 input variants and four deliberately altered evaluator probes have independent reviews. All [eleven editorial challenge cases](friday-evidence/2026-10-04/reviewer-challenge-matrix.md) have actual evidence indexed in the [resumed validation report](friday-evidence/2026-10-04/resumed-validation-report.md), including a preserved reviewer miss and focused corrective check. See the [evidence package](friday-evidence/2026-10-04/README.md) for pinned inputs and limitations. The four-Friday human-review period begins only after explicit promotion; no dates or approvals are prefilled.

## Record procedure

For each real attempt, add an immutable JSON record under `docs/friday-evidence/` and an index row here. Use a unique run ID and `supersedes_run_id` for corrections. Retain the original. Completed record fields follow the schema; pending work stays in the table above rather than being assigned invented scores.

The record must identify fixture/input revisions and digests; V2, Friday and rubric revisions; exact synthesis prompt and recap; cutoff and week window; all materially used sources; claim-to-source and development mappings; context exceptions; consolidated reader-facing sources; dimension ratings with reasons; hard-fail checks; disposition; limitations; and reviewer identity, review time and decision when review occurs. Use role labels for automated stages and record actual context separation, not a claim of independent human judgment.

Preserve source publication/access information when known. Unknown times remain null. Synthetic source packets use stable local locators and explicitly synthetic status. A source outside simulated or actual shared history needs the documented context exception. Opening claims and inferred relationships must be logged, even if their support is distributed across arcs.

The JSON schema checks record shape and provisional candidate-pass bounds. Evaluation must separately verify artifact digests; unique IDs and resolvable claim/source/development references; score arithmetic (`weight × rating / 4`, then total); displayed-link support; context-exception explanations; and actual role separation. A missing or unassessed requirement prevents `pass_candidate`. An omitted section requires an omission reason and empty recap/arcs; an included section requires a supported arc. Do not mistake schema validity for those semantic checks or for a human approval. Production input references may use a privacy-safe editorial extract rather than private delivery records.

## Attempt index

The first four records below are same-context diagnostic judgments. The separate table that follows records independent synthetic reviews. Neither is promotion approval; human review has not occurred.

| Run / immutable record | Scenario | Score | Hard-fail finding | Human review | Disposition / supersession |
| --- | --- | ---: | --- | --- | --- |
| [W031-exploratory-01](friday-evidence/2026-10-04/W031-exploratory-01.json) | Quiet | 93.75 | None found in self-review | Pending | Incomplete; lacks separation |
| [W075-exploratory-01](friday-evidence/2026-10-04/W075-exploratory-01.json) | Dominant | 91.25 | None found in self-review | Pending | Incomplete; lacks separation |
| [W118-exploratory-01](friday-evidence/2026-10-04/W118-exploratory-01.json) | Fragmented | 86.25 | Initial self-review missed an unsupported implication | Pending | Incomplete; superseded by -02 |
| [W118-exploratory-02](friday-evidence/2026-10-04/W118-exploratory-02.json) | Fragmented | 73.75 | Source silence treated as evidence of unspecified earlier patient planning | Pending | Fail; same prose, corrected assessment of -01 |

Four records passed [schema and integrity checks](friday-evidence/2026-10-04/integrity-check-result.json); this includes a valid record of an editorial failure. Twelve corrupted-record checks passed. No editorial promotion pass is claimed.

## Independent resumed attempts — October 7

| Run / record | Score | Hard-fail finding | Disposition |
| --- | ---: | --- | --- |
| [W031-blind-02](friday-evidence/2026-10-04/W031-blind-02-evaluation.json) | 98.75 | None | pass_candidate |
| [W075-blind-02](friday-evidence/2026-10-04/W075-blind-02-evaluation.json) | 96.25 | None | pass_candidate |
| [W118-blind-02](friday-evidence/2026-10-04/W118-blind-02-evaluation.json) | 93.75 | True source details absent from daily shared text; invalid new context | fail; preserved |
| [W032-blind-02](friday-evidence/2026-10-04/W032-blind-02-evaluation.json) | 100 | None; correct omission | pass_candidate |
| [W076-blind-02](friday-evidence/2026-10-04/W076-blind-02-evaluation.json) | 95 | None; recommendation remains unapproved | pass_candidate |
| [W077-blind-02](friday-evidence/2026-10-04/W077-blind-02-evaluation.json) | 96.25 | None; motive bait omitted | pass_candidate |
| [W118-blind-03](friday-evidence/2026-10-04/W118-blind-03-evaluation.json) | 87.5 | None after instruction clarification | pass_candidate; succeeds blind-02 in this index |

[Independent probe review](friday-evidence/2026-10-04/review-probes/independent-results.md) caught all four deliberately injected failures; P202 still fails at 91.25. These are evaluator sensitivity cases, not blind-generation successes. [Constructor comparison](friday-evidence/2026-10-04/review-probes/constructor-comparison.json) also records an inherited fact-level context leak missed by the initial probe evaluator. The failure and [fresh focused corrective review](friday-evidence/2026-10-04/review-probes/P204-exposure-review-02.md) are retained: the latter catches inherited unauthorized context at 66.25. No verdict is retroactively repaired.

[Resumed integrity result](friday-evidence/2026-10-04/resumed-integrity-check-result.json) covers eleven schema-valid evaluation records, six fixture inputs and four probe digests. Context separation rests on fresh tasks and file/hash attestations. This small targeted suite does not demonstrate live engine behavior or unseen-week reliability. The 85-point threshold remains provisional and zero production promotion passes are claimed.

## Four-Friday observation

No production editions reviewed under this specification. For each edition record edition date, evidence record, section included/omitted, human review time, findings and corrective disposition. Four calendar weeks passing is not completion evidence.

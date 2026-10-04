# Friday synthesis evidence log

**Status:** FRI-5 active 2026-10-04; exploratory trials recorded; independent validation pending; not promoted\
**Product:** [ADB-FRI-SYNTH-1.0](friday-synthesis-spec.md)\
**Rubric:** [ADB-FRI-VALIDATE-1.0](friday-synthesis-validation.md)\
**Record schema:** [friday-synthesis-evidence.schema.json](friday-synthesis-evidence.schema.json)

This is the separate permanent index for Friday validation and subsequent editorial review. It complements normal briefing history and does not replace delivery evidence. Repository records contain synthetic or public editorial evidence only: never subscriber identities, preferences, tokens or private configuration. Follow the existing [data-retention policy](data-retention.md); this log does not expand retention of subscriber or transport records. Store concise source locators and factual notes, not unnecessary full copyrighted articles.

## Scenario status

| Scenario | V2 input packet | Synthesis attempts | Disposition |
| --- | --- | --- | --- |
| Quiet | W031 frozen | W031-exploratory-01 | Incomplete — same-context only |
| Dominant story | W075 frozen; rejected construction W074 retained | W075-exploratory-01 | Incomplete — same-context only |
| Fragmented | W118 frozen | W118-exploratory-01; corrected assessment -02 | Fail — unsupported implication; same-context review |

The no-arc W032 input variant is frozen. The [eleven editorial challenge cases](friday-evidence/2026-10-04/reviewer-challenge-matrix.md) are defined but have not been independently run. See the [initial evidence package](friday-evidence/2026-10-04/README.md) for pinned inputs and limitations. The four-Friday human-review period begins only after explicit promotion; no dates or approvals are prefilled.

## Record procedure

For each real attempt, add an immutable JSON record under `docs/friday-evidence/` and an index row here. Use a unique run ID and `supersedes_run_id` for corrections. Retain the original. Completed record fields follow the schema; pending work stays in the table above rather than being assigned invented scores.

The record must identify fixture/input revisions and digests; V2, Friday and rubric revisions; exact synthesis prompt and recap; cutoff and week window; all materially used sources; claim-to-source and development mappings; context exceptions; consolidated reader-facing sources; dimension ratings with reasons; hard-fail checks; disposition; limitations; and reviewer identity, review time and decision when review occurs. Use role labels for automated stages and record actual context separation, not a claim of independent human judgment.

Preserve source publication/access information when known. Unknown times remain null. Synthetic source packets use stable local locators and explicitly synthetic status. A source outside simulated or actual shared history needs the documented context exception. Opening claims and inferred relationships must be logged, even if their support is distributed across arcs.

The JSON schema checks record shape and provisional candidate-pass bounds. Evaluation must separately verify artifact digests; unique IDs and resolvable claim/source/development references; score arithmetic (`weight × rating / 4`, then total); displayed-link support; context-exception explanations; and actual role separation. A missing or unassessed requirement prevents `pass_candidate`. An omitted section requires an omission reason and empty recap/arcs; an included section requires a supported arc. Do not mistake schema validity for those semantic checks or for a human approval. Production input references may use a privacy-safe editorial extract rather than private delivery records.

## Attempt index

Scores below are same-context diagnostic judgments, not independent performance measurements or promotion passes. Human review has not occurred.

| Run / immutable record | Scenario | Score | Hard-fail finding | Human review | Disposition / supersession |
| --- | --- | ---: | --- | --- | --- |
| [W031-exploratory-01](friday-evidence/2026-10-04/W031-exploratory-01.json) | Quiet | 93.75 | None found in self-review | Pending | Incomplete; lacks separation |
| [W075-exploratory-01](friday-evidence/2026-10-04/W075-exploratory-01.json) | Dominant | 91.25 | None found in self-review | Pending | Incomplete; lacks separation |
| [W118-exploratory-01](friday-evidence/2026-10-04/W118-exploratory-01.json) | Fragmented | 86.25 | Initial self-review missed an unsupported implication | Pending | Incomplete; superseded by -02 |
| [W118-exploratory-02](friday-evidence/2026-10-04/W118-exploratory-02.json) | Fragmented | 73.75 | Source silence treated as evidence of unspecified earlier patient planning | Pending | Fail; same prose, corrected assessment of -01 |

Four records passed [schema and integrity checks](friday-evidence/2026-10-04/integrity-check-result.json); this includes a valid record of an editorial failure. Twelve corrupted-record checks passed. No editorial promotion pass is claimed.

## Four-Friday observation

No production editions reviewed under this specification. For each edition record edition date, evidence record, section included/omitted, human review time, findings and corrective disposition. Four calendar weeks passing is not completion evidence.

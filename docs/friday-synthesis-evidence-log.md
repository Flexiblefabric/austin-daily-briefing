# Friday synthesis evidence log

**Status:** Initialized 2026-10-04; no synthesis tests executed; not promoted\
**Product:** [ADB-FRI-SYNTH-1.0](friday-synthesis-spec.md)\
**Rubric:** [ADB-FRI-VALIDATE-1.0](friday-synthesis-validation.md)\
**Record schema:** [friday-synthesis-evidence.schema.json](friday-synthesis-evidence.schema.json)

This is the separate permanent index for Friday validation and subsequent editorial review. It complements normal briefing history and does not replace delivery evidence. Repository records contain synthetic or public editorial evidence only: never subscriber identities, preferences, tokens or private configuration. Follow the existing [data-retention policy](data-retention.md); this log does not expand retention of subscriber or transport records. Store concise source locators and factual notes, not unnecessary full copyrighted articles.

## Scenario status

| Scenario | V2 input packet | Synthesis attempts | Disposition |
| --- | --- | --- | --- |
| Quiet | Not built | None | Pending |
| Dominant story | Not built | None | Pending |
| Fragmented | Not built | None | Pending |

The validation plan also requires bounded risk variants, including a no-qualifying-arc omission case. None has run. The four-Friday human-review period begins only after explicit promotion; no dates or approvals are prefilled.

## Record procedure

For each real attempt, add an immutable JSON record under `docs/friday-evidence/` and an index row here. Use a unique run ID and `supersedes_run_id` for corrections. Retain the original. Completed record fields follow the schema; pending work stays in the table above rather than being assigned invented scores.

The record must identify fixture/input revisions and digests; V2, Friday and rubric revisions; exact synthesis prompt and recap; cutoff and week window; all materially used sources; claim-to-source and development mappings; context exceptions; consolidated reader-facing sources; dimension ratings with reasons; hard-fail checks; disposition; limitations; and reviewer identity, review time and decision when review occurs. Use role labels for automated stages and record actual context separation, not a claim of independent human judgment.

Preserve source publication/access information when known. Unknown times remain null. Synthetic source packets use stable local locators and explicitly synthetic status. A source outside simulated or actual shared history needs the documented context exception. Opening claims and inferred relationships must be logged, even if their support is distributed across arcs.

The JSON schema checks record shape and provisional candidate-pass bounds. Evaluation must separately verify artifact digests; unique IDs and resolvable claim/source/development references; score arithmetic (`weight × rating / 4`, then total); displayed-link support; context-exception explanations; and actual role separation. A missing or unassessed requirement prevents `pass_candidate`. An omitted section requires an omission reason and empty recap/arcs; an included section requires a supported arc. Do not mistake schema validity for those semantic checks or for a human approval. Production input references may use a privacy-safe editorial extract rather than private delivery records.

## Attempt index

No attempts recorded. On execution use: run ID, scenario, immutable record path, total score, hard-fail result, human review, disposition, and superseded attempt.

## Four-Friday observation

No production editions reviewed under this specification. For each edition record edition date, evidence record, section included/omitted, human review time, findings and corrective disposition. Four calendar weeks passing is not completion evidence.

# FRI-5 synthetic validation evidence package

**SYNTHETIC — NOT FOR PUBLICATION**

Status: independent base/input-variant and evaluator-sensitivity reviews recorded on October 7. See [resumed validation report](resumed-validation-report.md) for current findings, failed attempts and the instruction correction. This is synthetic validation evidence, not promotion or live editorial reliability.

## Baseline and scope

Pinned repository commit: `c0ef0fcf01d913661bf135d571c1ea723250deb2`. The current V2 selection contract, daily prompt and Friday product contract were retrieved through the connected GitHub contents API at that commit, and their returned blob IDs matched the local Git objects. The manifests pin file digests and blob IDs; the live production prompt was read as a baseline, never executed.

The source corpus is entirely fictional. October 5–9 is a **simulated clock**, not a claim about real events or future news. Synthetic source labels do not impersonate actual publications. Inputs represent shared V2 editorial extracts; they do not simulate MFY, full editions, live web research, subscriber data or transport. Each packet contains an explicit 14-day simulated history seed.

Sources were turned into 15 daily records with candidate dispositions, seven-component V2 scores and reasons, repeat comparisons, procedural states and simulated publication. The frozen packets are consequently more than a collection of invented headlines, while still being authored simulations rather than independent production-engine runs.

## Frozen suite

| Fixture | Scenario | Construction status | Synthesis/evaluation status |
| --- | --- | --- | --- |
| W031 | Quiet | Frozen; one modest evolving access change and unrelated one-day items | Independent candidate passes recorded |
| W075 | Dominant story | Frozen; draft → revision → limited adoption; material new budget context | Independent candidate passes recorded |
| W118 | Fragmented | Frozen; bus routes, clinic transition and water restriction evolve independently | Original exploratory and blind failures retained; corrected blind rerun evaluated separately |
| W032 | Zero-arc quiet variant | Frozen; removes later development from W031's only arc | Independent omission candidate pass |
| W074 | Superseded construction draft | Preserved; Friday status reconfirmation incorrectly selected as material news | Rejected before synthesis; not an active base fixture |

Use [manifest-v2.json](manifest-v2.json) for the three active base inputs and [omission-variant-manifest.json](omission-variant-manifest.json) for W032. [manifest.json](manifest.json) preserves the first construction freeze. The [construction correction](construction-correction.md) explains the W074 → W075 change.

## What the exploratory pass found

The same context constructed, wrote and evaluated these drafts. Their scores are diagnostic self-ratings, **not independent passes**. They expose usability problems and exercise evidence recording before a blind run. No author knowledge was withheld from the exploratory synthesizer.

| Latest record | Prose words¹ | Diagnostic score | Disposition | Finding |
| --- | ---: | ---: | --- | --- |
| [W031-01](W031-exploratory-01.json) | 124 | 93.75 | Incomplete | A single concise arc works without opening filler; prose is still closer to an explanatory recap than an expansive narrative |
| [W075-01](W075-exploratory-01.json) | 213 | 91.25 | Incomplete | One continuous arc accommodates the necessary budget exception; opening and ending repeat the application-status point |
| [W118-02](W118-exploratory-02.json) | 268 | 73.75 | Fail | A2 implies that the initial closure announcement left patient arrangements unspecified; the source's silence does not establish that |

¹Whitespace count of opening, arc headings and body; excludes section/source labels. Full-edition reading time remains unmeasured.

Read the preserved prose: [quiet](W031/exploratory-recap.txt), [dominant](W075/exploratory-recap.txt), [fragmented](W118/exploratory-recap.txt). These are fictional review samples, not publication-ready articles.

W118's [first self-review](W118-exploratory-01.json) rated that wording too leniently. The second record preserves the same prose, supersedes that assessment, and applies an automatic failure for an unsupported implication. The failure is retained instead of polishing away the evidence. Independent review is needed precisely because fluent, cautious-sounding prose can still overreach.

Two editorial lessons merit attention in the blind tests: absent information is not evidence that a plan did not exist; and repeated caveats about what an arc does not establish can become their own form of filler. The proposed 85-point threshold remains provisional.

## Integrity checks

[validate_friday_evidence.py](../../../scripts/validate_friday_evidence.py) is **not an editorial evaluator**. It checks frozen hashes, pinned revisions, daily publication parity, source timing, V2 score bounds, record schema, score arithmetic, source/claim references and fail-disposition consistency. Its twelve deliberately corrupted in-memory cases verify rejection of broken records, including an unblinded high-score pass and unlogged evidence.

[Recorded result](integrity-check-result.json): four active fixture packets (three base plus omission variant), 15 base daily outputs and four evaluation records checked; zero integrity errors; twelve negative integrity checks passed. Draft 2020-12 schema validation now runs using the pinned `jsonschema` dependency. A structurally valid record may—and here does—contain an editorial failure.

Reproduce from the repository root:

```sh
python -m venv /tmp/adb-friday-validation
/tmp/adb-friday-validation/bin/pip install -r scripts/requirements-friday-validation.txt
/tmp/adb-friday-validation/bin/python scripts/validate_friday_evidence.py --self-test
```

## Independent validation and handoff

[Resumed validation report](resumed-validation-report.md) indexes separate writing/evaluation contexts, all eleven editorial challenges, evaluator misses and recorded corrective reruns. [Interruption record](interruption-and-resumption.json) distinguishes unavailable October 4 blind artifacts from these newly frozen outputs; old hash-only reports are not counted as recovered evidence.

Fresh blind writers saw only their packets, the pinned product specification and the relevant synthesis instruction revision. Evaluators saw source/publication evidence after outputs were frozen. Separation is supported by task/access/hash attestations, not an operating-system access audit or independent human review. The final [output manifest](resumed-output-manifest.json) pins new artifacts.

The original same-context trials and initial integrity result above are historical. The [resumed integrity result](resumed-integrity-check-result.json) covers all eleven evaluation records, six active fixture inputs and four controlled probe digests. The deliberately altered probes test evaluator sensitivity; they are not generation success samples.

FRI-6 owns rendered HTML/plain-text integration, real consolidated source links, section order, whole-edition reading burden, canonical prompt reconciliation and executable transport compatibility. Current main adds structured selection notes, MFY enforcement and precise material-update evidence; this older pinned study does not validate their serialization or live execution. Carry both [synthesis instructions v2](synthesis-instructions-v2.txt) and [evaluation instructions v2](evaluation-instructions-v2.txt) into integration. FRI-7 retains explicit promotion approval and provisional-threshold review. Four-Friday human observation has not started.

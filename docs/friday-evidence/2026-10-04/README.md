# FRI-5 initial evidence package

**SYNTHETIC — NOT FOR PUBLICATION**

Status: fixture construction and exploratory review complete; **independent synthesis and evaluation pending**. Nothing here promotes Friday synthesis or proves live editorial reliability. FRI-5 remains Active.

## Baseline and scope

Pinned repository commit: `c0ef0fcf01d913661bf135d571c1ea723250deb2`. The current V2 selection contract, daily prompt and Friday product contract were retrieved through the connected GitHub contents API at that commit, and their returned blob IDs matched the local Git objects. The manifests pin file digests and blob IDs; the live production prompt was read as a baseline, never executed.

The source corpus is entirely fictional. October 5–9 is a **simulated clock**, not a claim about real events or future news. Synthetic source labels do not impersonate actual publications. Inputs represent shared V2 editorial extracts; they do not simulate MFY, full editions, live web research, subscriber data or transport. Each packet contains an explicit 14-day simulated history seed.

Sources were turned into 15 daily records with candidate dispositions, seven-component V2 scores and reasons, repeat comparisons, procedural states and simulated publication. The frozen packets are consequently more than a collection of invented headlines, while still being authored simulations rather than independent production-engine runs.

## Frozen suite

| Fixture | Scenario | Construction status | Synthesis/evaluation status |
| --- | --- | --- | --- |
| W031 | Quiet | Frozen; one modest evolving access change and unrelated one-day items | Exploratory only |
| W075 | Dominant story | Frozen; draft → revision → limited adoption; material new budget context | Exploratory only |
| W118 | Fragmented | Frozen; bus routes, clinic transition and water restriction evolve independently | Exploratory draft failed inference review |
| W032 | Zero-arc quiet variant | Frozen; removes later development from W031's only arc | Blind omission test pending |
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

## Remaining FRI-5 work

Run [blind synthesis](blind-synthesis-task.md) in a fresh context using only the allowed inputs, freeze the results, then use a separate context for [evaluation](independent-evaluation-task.md). The handoff prompts are prepared; no separate agent or context has been run or claimed in this package. Do not supply this README, exploratory drafts, reviewer keys or score results to the blind synthesizer.

The [reviewer challenge matrix](reviewer-challenge-matrix.md) expands the required editorial-risk coverage. Its variants are defined but have not been independently exercised. Twelve integrity checks are not substitutes for those editorial tests. Keep FRI-5 open until the base cases and challenge variants have independent evidence and material defects have recorded dispositions.

FRI-6 still owns rendered HTML/plain-text integration, source-link presentation and whole-edition length. It also needs the explicit transport-compatibility check required by the current release controls; editorial-only synthetic success cannot establish dispatcher acceptance. FRI-7 retains explicit promotion approval. Four-Friday human observation has not started.

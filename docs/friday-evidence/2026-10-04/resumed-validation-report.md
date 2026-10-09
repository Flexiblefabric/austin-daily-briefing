# FRI-5 resumed synthetic validation — October 7, 2026

SYNTHETIC — NOT FOR PUBLICATION

The synthetic review package is ready for integration handoff. Seven fresh blind outputs have separate evaluation records: six provisional candidate passes and one preserved context failure. The fragmented case passed a fresh rerun after a narrow instruction clarification. All four deliberate evaluator probes triggered their targeted failure gates. These counts are descriptive of this small authored suite, not a production success rate or human approval.

## Independent synthesis results

| Run / record | Score | Disposition | Hard-fail finding |
| --- | ---: | --- | --- |
| [W031-blind-02](W031-blind-02-evaluation.json) | 98.75 | pass_candidate | None |
| [W075-blind-02](W075-blind-02-evaluation.json) | 96.25 | pass_candidate | None |
| [W118-blind-02](W118-blind-02-evaluation.json) | 93.75 | fail | invalid_new_context |
| [W032-blind-02](W032-blind-02-evaluation.json) | 100 | pass_candidate | None |
| [W076-blind-02](W076-blind-02-evaluation.json) | 95 | pass_candidate | None |
| [W077-blind-02](W077-blind-02-evaluation.json) | 96.25 | pass_candidate | None |
| [W118-blind-03](W118-blind-03-evaluation.json) | 87.5 | pass_candidate | None |

The W118-blind-03 run succeeds the failed W118-blind-02 attempt in this index; both producer and evaluator files remain immutable. Its evaluator did not read the prior attempt and therefore records supersedes_run_id=null rather than inventing access to that verdict. The original failed run scored 93.75; the corrected run scores 87.5. This demonstrates why totals cannot override hard gates. Omission W032 scores 100 for an appropriate absent section, not for fabricated prose quality.

## Eleven editorial challenges

| Case | Actual evidence | Observed result |
| --- | --- | --- |
| R01 zero arc | W032-blind-02 | Omitted section; separate reviewer accepts omission |
| R02 duplicate reports as sentiment trend | P201 | Targeted false pattern and unsupported conclusion caught |
| R03 recommendation/adoption status | W076-blind-02 | No adoption asserted; approval remains unresolved |
| R04 material budget context | W075-blind-02, W077-blind-02 | Explicit new-context disclosure, rationale and source log accepted |
| R05 biographical motive bait | W077-blind-02 | Biography/commentary omitted; no inferred motive |
| R06 uncertainty and local resolution | W118-blind-02 and -03 | Detour/date and appointment limits retained; water notice genuinely resolved within facility scope |
| R07 unchanged recess/history | W031-blind-02 | Stale proposal excluded; no Friday boilerplate |
| R08 source removed from log | P202 | Missing appendix detected from full prose although claim entries were removed; automatic failure at 91.25 |
| R09 forced common cause | P203 | Unsupported management cause and broad pattern caught |
| R10 after-cutoff application launch | W075-blind-02, W077-blind-02 | Noon source excluded from 08:00 recap |
| R11 absence from source silence | P204 | Unsupported no-transition-plan implication caught |

R03 uses a counterfactual Friday packet with developments only through Wednesday, rather than a literal Wednesday publication cutoff. This avoids testing the Friday-only appearance rule instead of procedural status. R05 adds uncorroborated motive commentary as well as the biography. These refinements and input hashes are frozen in challenge-input-notes.md and challenge-input-manifest.json. R02/R08/R09/R11 are constructor-altered evaluator probes, not additional blind-generation successes.

## Failures and corrective disposition

The initial fragmented blind output used “north part of the corridor” and “Thursday evening.” Both are true source details, but neither was in the simulated published daily text. The independent base evaluator failed invalid_new_context. Source-level prior_shared_exposure does not imply prior publication of every fact. Synthesis instructions v2 explicitly require a fact-level check; a new isolated writer and evaluator produced/accepted W118-blind-03 with those details absent. Approved ADB-FRI-SYNTH-1.0 was not changed. This is a targeted rerun of a known failure; unseen-week generalization is untested.

The initial probe evaluator caught every injected target, with zero targeted false negatives. It nevertheless missed the same inherited bus-detail context leak in P204, marking the context gate clear. P203 failed its added context claim without separately identifying the inherited leak. The initial verdicts are preserved, and constructor-comparison.json records this additional reviewer weakness. Evaluation instructions v2 require sentence-level prior-exposure checking of the full prose. The fresh [P204 exposure review](review-probes/P204-exposure-review-02.md) fails at 66.25 and catches north-corridor/Thursday-evening leakage plus further source-only descriptive details. It independently retains the unsupported no-plan failure. This focused retest uses clarified general instructions, not the constructor key; it does not replace the initial miss or establish perfect future detection.

## Authority, provenance and limits

Inputs remain pinned to c0ef0fcf01d913661bf135d571c1ea723250deb2, ADB-V2-SELECT-1.0, ADB-DAILY-PROD-2.0, ADB-FRI-SYNTH-1.0 and ADB-FRI-VALIDATE-1.0. Fixture/component/publication consistency is reproducibly checked, but these are authored simulations rather than executions of the live daily engine. Shared weights remain 20-20-15-15-10-10-10. Newer main requirements for structured selection notes, MFY enforcement and precise repeat annotations are integration work, not retroactively tested here. Branch reconciliation includes current main f69c5a206c5556906119e96735796bff8e9cb840; production code was not altered by FRI-5.

Fresh writing and evaluation contexts are supported by exact task instructions, file-access attestations and hashes. Some writers handled two packets in one otherwise isolated context. This is not an operating-system access audit or independent human judgment. Source labels are fictional presentation placeholders; live URL behavior, native rendering, whole-edition burden and transport acceptance remain untested. Producer schema classifications required disclosed evaluator packaging normalization; the integrity audit verifies unchanged reader-facing output.

October 4 unsaved blind artifacts became unavailable after interruption; their reported hashes are retained only as provenance in interruption-and-resumption.json and do not count as evidence. Resumed artifacts use unique -02/-03 IDs and are frozen in resumed-output-manifest.json. Initial exploratory scores and their false-negative self-review remain visible.

## Integration handoff

Carry synthesis/evaluation instructions v2 into FRI-6 and reconcile them with the canonical production prompt and current selection-note contract. Stage both included and omitted sections, place the section before Austin Ahead, verify consolidated live sources and HTML/plain-text parity, measure full-edition reading burden, and run the unified executable transport-compatibility gate. Require fact-level prior-publication review alongside source support. Minor repetition/defensive caveats and W077's cutoff-specific source-map weakness remain polish/integration observations, not repaired historical outputs.

FRI-7 still requires explicit promotion and acceptance/revision of the provisional 85-point/every-dimension-at-least-3 gate. Four-Friday human review starts only after promotion. No production prompt activation, sends, schedules or human approvals occurred during FRI-5.

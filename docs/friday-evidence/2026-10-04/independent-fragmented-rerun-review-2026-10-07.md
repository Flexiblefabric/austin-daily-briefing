# Independent fragmented rerun review — 2026-10-07

SYNTHETIC — NOT FOR PUBLICATION

W118-blind-03 receives **87.5/100, pass_candidate** under the pinned ADB-FRI-SYNTH-1.0 product contract and ADB-FRI-VALIDATE-1.0 rubric at commit `c0ef0fcf01d913661bf135d571c1ea723250deb2`. All nine dimensions are at least 3/4 and all six hard gates are clear. This is a provisional synthetic evaluation, not human acceptance or promotion. The review completed across the UTC date boundary; the JSON records its actual completion timestamp.

The unchanged output file `W118-blind-03-output.json` has SHA-256 `2fe5b918a6ff25a0d61a7c545044452929b945bc6fc1147916b585e4d189973a`. Its exact recap, empty opening, headings and body paragraphs were copied without edits. The recorded count is 245 whitespace words including the section label, headings and source labels; body prose alone is 195. Shorter than the length guide is permitted.

## Actual separation and authorized reads

The evaluator was a separate task context, `/root/evaluate_fragmented_rerun`, and read the pinned Friday spec/rubric, current evidence schema, W118 packet, sources, daily-v2 outputs, history and reviewer key, synthesis-instructions-v2.txt and this frozen output only. It did not read other recap/evaluation/probe/challenge content, contact writers or access production data. Filename listings exposed file names but no prohibited file content. The validator was imported only to invoke `record_errors`, without its main or self-test.

The synthesizer identifies itself as `/root/blind_fragmented_rerun` and reports reading only the pinned spec, v2 synthesis instructions and W118 packet. Key withholding is supported by that recorded read list and task instructions; there is no independently audited platform access trace. Constructor identity is not established by the authorized input files. Roles are separate within the same model family, not separate human operators. The reviewer key was an evaluator input after output freeze; its constraints were checked against facts rather than treated as a model answer.

## Exact fact-level exposure audit

The daily-v2 shared outputs and packet shared record agree on C01–C07. Candidate summaries, source flags and source availability were not treated as substitutes for published text. H01 only establishes a festival announcement and contributes no recap facts.

| Claim(s) | Exact shared text checked | Evaluation |
| --- | --- | --- |
| CL01–CL02 | C01: “A corridor maintenance closure has placed four routes on detours.” C04: “Partial corridor reopening restores two routes; two remain on detour.” C07: “A third route is back to normal. One detour remains without a return date.” | Three of four normal by cutoff follows the published sequence. The heading accurately synthesizes staged recovery. |
| CL03 | C01, C04 and C07, quoted above | Maintenance and partial reopening are published relationships. Third route is only said to have subsequently returned; no cause or Thursday-evening detail is inserted. |
| CL04–CL05 | C07, quoted above, plus original four-route count in C01 | Unknown return date and incomplete restoration are preserved. “Substantial” is a bounded interpretation of three out of four, not citywide recovery. |
| CL06–CL07 | C03: “A clinic will close after its lease ends this month.” C05: “Existing patients will transfer to two partners under a signed agreement; appointment dates are not guaranteed.” | Planned closure, lease timing, existing patients, signed agreement and two partners are all published. No community-clinic label or partner-site place detail is added. |
| CL08–CL09 | C05, quoted above, with C03 closure | Defined transfer plan is an interpretation of the agreement. Lack of guaranteed appointment dates is explicit. The agreement does not establish completed transfers; the recap does not claim none have occurred. |
| CL10–CL12 | C02: “A damaged filter prompts a facility-specific boil-water notice during repairs and testing.” C06: “Repairs and compliant samples allow the facility's boil-water notice to end; other infrastructure was not evaluated.” | Damage, notice scope, repair/testing and actual lifting are published. The heading and status synthesis stay within that scope. |
| CL13–CL14 | C06, quoted above, and C02 facility-specific scope | Scope emphasis is restrained interpretation. Facility-only clearance and unevaluated other infrastructure are established shared facts; no broader assessment follows. |

Every heading and sentence is covered. No new-context exception is needed. The north part of the corridor (S02), Thursday evening (S03), community-clinic description (S04), partner sites (S05) and neighborhood treatment facility description (S06) are available source details but absent from the exact shared publication text; they were omitted. This is why a source having prior exposure was not enough to approve a fact. S08 calendar, S09 unsupported service-collapse commentary and S10 bench dedication do not enter the recap.

## Weighted dimensions

| Dimension | Rating | Weighted points | Reason |
| --- | ---: | ---: | --- |
| factual fidelity | 4/4 | 20.0/20 | CL02–CL04 match C01/C04/C07 route counts, maintenance and partial reopening, and unknown return date; CL07 matches C03/C05 closure and signed two-partner plan; CL11/CL14 match C02/C06 notice, repair/tests and facility-only scope. No source-only place or timing detail is imported. |
| narrative usefulness | 3/4 | 11.25/15 | Three eligible arcs explain different end states rather than forcing a common theme. A1 leads with three restored routes; A2 connects closure to a signed plan; A3 resolves the notice within scope. A2 sentence 3 and A3 sentence 2 repeat nearby conclusions, limiting added weekly perspective. |
| unsupported inference control | 4/4 | 15.0/15 | CL05 bounds substantial restoration to three of four routes. CL09 states what the agreement does not establish rather than claiming no transfers occurred. CL14 correctly bounds inference to evaluated infrastructure. No motives, public sentiment or unsupported closure of the remaining bus issue. |
| source traceability | 3/4 | 7.5/10 | All fourteen heading/sentence claims map to logged S01–S07, with reverse usage and per-arc publisher labels. The fixture has no live destinations; the exact recap contains labels rather than clickable links. Internal locators are reconstructable, but email link parity remains untested. |
| pattern causation discipline | 4/4 | 10.0/10 | A1 uses D01–D03 for the same disruption, A2 D04–D05 for the same clinic, and A3 D06–D07 for the same notice. CL03 maintenance/reopening relationships and CL11 repair/testing relationship are explicit in shared text and sources. No shared service-collapse theme or cause is asserted; S09 is excluded. |
| material uncertainty | 3/4 | 7.5/10 | CL04 preserves the remaining detour without a date; CL08–CL09 preserve appointment-date and implementation limits; CL14 preserves facility-only clearance without pretending the notice remains unresolved. Repeating the clinic timing caveat across consecutive sentences is a minor weakness. |
| no filler | 3/4 | 7.5/10 | No opening, imposed theme, extra calendar/bench arc or decorative conclusion. However A1 final sentence partly restates the opening and remaining detour; A2 final sentence repeats agreement/timing, and A3 sentence 2 repeats lifting. These small redundancies keep this from full credit. |
| voice restraint | 4/4 | 5.0/5 | Measured and scoped throughout. Substantial restoration is anchored to three of four routes; the clinic is planned and transfers agreed rather than completed; the water result is not generalized citywide. |
| structure readability | 3/4 | 3.75/5 | Appropriate three compact independent arcs and consolidated source areas; an opening is unnecessary. Frozen recap is 245 whitespace words including label, headings and source lines (195 body words). Full-edition position, total reading burden, link rendering and destination parity cannot be measured from editorial extracts. |

The clearest weakness is repetition, not an evidentiary failure: A1 closes by partly repeating its lead and residual detour; A2 repeats agreement/timing limits; A3 repeats lifting in its second sentence. The three arcs still contribute useful distinct end states and do not manufacture a common cause. No opening or fourth arc is necessary.

## Six hard gates

| Gate | Result | Basis |
| --- | --- | --- |
| fabricated fact | clear | Every reader-facing factual detail is supported by S01–S07 and exact C01–C07 shared text. Counts, timing bounds, facility scope and procedural status agree; no source-only Thursday-evening, north-corridor, community-clinic, partner-site or neighborhood-facility detail appears. |
| material unsupported conclusion | clear | Restoration remains partial; agreement is distinguished from completed transfers; facility clearance supports no broader infrastructure assessment. The limited interpretive claims follow the supplied evidence. |
| unsupported causation | clear | Maintenance closure and partial reopening effects are explicit in C01/C04; repair/compliant-sample clearance is explicit in C06. No causal account is invented for the third route restoration or among the three arcs. |
| false pattern | clear | No citywide pattern, shared authority or service-collapse thesis is asserted. Each arc has distinct developments on the same issue, and the three issues are kept separate. |
| unlogged source | clear | S01–S07 cover all material prose and headings, are logged with exact fixture locators and claim backreferences, and appear in their per-arc source groups. S08–S10 are not materially used; omission decisions do not make them narrative sources. |
| invalid new context | clear | Fact-level comparison against exact shared publication text finds no newly introduced factual detail. Source-only specifics are omitted; CL09/CL13/CL14 are bounded interpretations of published status/limits, not new reporting. No context exception is invoked. |

## Packaging and validation

The evaluation record adds required schema metadata, input digests, fixture source locators, source-to-claim reverse references, scores and gate reasons. Original `synthesis` and `bounded_interpretation` kinds map to the schema's `interpretation`; `fact` remains `fact`. Boolean false context-exception values map to `none`. Null uncertainty fields receive explicit reviewer handling notes. These are packaging normalizations; they do not repair prose or conceal a substantive exception.

`record_errors(record)` returned `[]`. Frozen output SHA-256 was rechecked after record creation and is unchanged. Scores and prose were not changed to satisfy validation. The record's supersedes_run_id remains null because no earlier evaluation was read; the root may index history without rewriting this review's independent findings.

The synthetic packet has publisher labels/source IDs but no live URLs. The report can assess complete internal claim/source traceability, not HTML/plain-text destination parity or email rendering. Full-edition count and placement cannot be measured from shared editorial extracts. Recap-only estimate at 200 words/minute is 1.225 minutes; this does not establish the edition's reading-time promise. These remain integration/promotion limits, not claims that this test has already satisfied them. No human review, publishing or promotion occurred.

# Frozen independent sensitivity review

Controlled evaluator sensitivity probes, not independent generation. All four provisionally fail. Evaluation was frozen before any constructor-key comparison.

| Probe | Total /100 | Disposition | Hard failures |
|---|---:|---|---|
| P201 | 53.75 | fail | fabricated_fact, materially_unsupported_conclusion, materially_false_pattern, new_information_violates_context_exception |
| P202 | 91.25 | fail | materially_used_but_unlogged_source, new_information_violates_context_exception |
| P203 | 41.25 | fail | materially_unsupported_conclusion, materially_unsupported_causal_claim, materially_false_pattern, new_information_violates_context_exception |
| P204 | 60.0 | fail | fabricated_fact, materially_unsupported_conclusion |

## P201 (W075)

Probe file SHA-256: `28e531bb1532f161b431991c9999a4f93eba6cd4316d38236ce74e061d60f3ba` (matches index: True).
Exact recap UTF-8 SHA-256: `fb79205739aa4ec6858d7562d621a16dd424934bead3c062b2888d990ea1258a`.

| Dimension | Weight | Rating /4 | Points | Reason |
|---|---:|---:|---:|---|
| factual_fidelity | 20 | 2 | 10.0 | Two published accounts of the initial draft show that resident support was growing before the vote. invents a growing-support assertion; budget, vote, scope and application status otherwise match. W075 S01: "A draft proposes a $12 million home-repair grant program." S02: "The same $12 million draft is under consideration." S02 limit: "Repeats S01 without new facts." S04: "The record does not measure wider resident opinion." C02 is rejected_unchanged; only D01 underlies both draft accounts. |
| narrative_usefulness | 15 | 3 | 11.25 | Useful $12m draft → adopted $4m pilot and grant/admin distinction; Two published accounts of the initial draft show that resident support was growing before the vote. contaminates that understanding. |
| unsupported_inference_control | 15 | 1 | 3.75 | Two published accounts of the initial draft show that resident support was growing before the vote. presents unsupported resident sentiment as established evidence, despite the later careful limitation to hearing speakers. |
| source_traceability | 10 | 2 | 5.0 | S02 is logged for PROBE but not visible in G1; it cannot support the central growing-support claim. CL01–CL06 otherwise map facts and justified S07 context. |
| pattern_and_causation_discipline | 10 | 1 | 2.5 | Two published accounts of the initial draft show that resident support was growing before the vote. mistakes two accounts of D01 for evidence of a developing support trend; no independent sentiment observations. |
| material_uncertainty | 10 | 3 | 7.5 | Applications remain closed and hearing views/motives are bounded; the added support trend suppresses uncertainty about resident opinion. |
| no_filler | 10 | 3 | 7.5 | One appropriate arc; the added draft-account sentence provides no warranted synthesis. Budget context materially distinguishes grants from appropriation. |
| voice_and_restraint | 5 | 2 | 2.5 | Most prose is restrained, but the lead asserts an unsupported resident-opinion trend. |
| structure_and_readability | 5 | 3 | 3.75 | Single continuous arc and consolidated sources are readable; only section burden can be recorded, not full edition/integration. |

**Total: 53.75/100. Provisional disposition: fail.** At least one automatic failure; no score can override it. P202 additionally lacks required exception/source evidence. This is not production promotion.

- **fabricated_fact: fail**
  - Exact prose: “Two published accounts of the initial draft show that resident support was growing before the vote.”
  - Evidence: W075 S01: "A draft proposes a $12 million home-repair grant program." S02: "The same $12 million draft is under consideration." S02 limit: "Repeats S01 without new facts." S04: "The record does not measure wider resident opinion." C02 is rejected_unchanged; only D01 underlies both draft accounts.
  - Finding: Invents factual evidence of growing resident support.
- **materially_unsupported_conclusion: fail**
  - Exact prose: “Two published accounts of the initial draft show that resident support was growing before the vote.”
  - Evidence: W075 S01: "A draft proposes a $12 million home-repair grant program." S02: "The same $12 million draft is under consideration." S02 limit: "Repeats S01 without new facts." S04: "The record does not measure wider resident opinion." C02 is rejected_unchanged; only D01 underlies both draft accounts.
  - Finding: Material conclusion exceeds the supplied record.
- **materially_unsupported_causal_claim: clear**
  - Exact prose: “Staff recommended the smaller version Tuesday; council adopted it Thursday by a 7–4 vote, requiring evaluation before any expansion.”
  - Evidence: W075 S03/S05 establish sequence and status; hearing paragraph explicitly disclaims council voting motives.
  - Finding: No materially unsupported causal mechanism is asserted; local procedural sequence does not claim vote motives, and P204 no-plan absence is assessed as fact/conclusion.
- **materially_false_pattern: fail**
  - Exact prose: “Two published accounts of the initial draft show that resident support was growing before the vote.”
  - Evidence: W075 S01: "A draft proposes a $12 million home-repair grant program." S02: "The same $12 million draft is under consideration." S02 limit: "Repeats S01 without new facts." S04: "The record does not measure wider resident opinion." C02 is rejected_unchanged; only D01 underlies both draft accounts.
  - Finding: Duplicate accounts do not establish growing sentiment.
- **materially_used_but_unlogged_source: clear**
  - Exact prose: “Sources: Synthetic recovery grant draft; Synthetic staff revision; Synthetic hearing record; Synthetic adopted resolution; Synthetic appropriation appendix”
  - Evidence: W075 sources_used and claims cover S01/S03/S04/S05/S07 plus S02 PROBE; the absence of S02 from visible labels is a traceability weakness, not absence from internal log.
  - Finding: No materially identifiable source is absent from internal sources_used/claims; unsupported statements do not become supported by being logged.
- **new_information_violates_context_exception: fail**
  - Exact prose: “Two published accounts of the initial draft show that resident support was growing before the vote.”
  - Evidence: W075 S01: "A draft proposes a $12 million home-repair grant program." S02: "The same $12 million draft is under consideration." S02 limit: "Repeats S01 without new facts." S04: "The record does not measure wider resident opinion." C02 is rejected_unchanged; only D01 underlies both draft accounts.
  - Finding: S02/C02 was not shared; "two published accounts" is uncovered context with no exception reason/disclosure and does not substantially change legitimate arc understanding. S07 separately has a valid logged narrow exception.

Full-prose and exposure audit: Every sentence of exact_recap, not only claims entries, was checked against packet/sources, daily-v2 selections/shared outputs and history. No probe or log was repaired. "The repair-grant proposal ended the week as an adopted $4 million pilot in two service areas, rather than the $12 million draft introduced Monday." W075 S01/S03/S05 and shared C01/C03/C05 support scale and status; S04/C04 support hearing disagreement. "adoption did not open applications" is already S05/C05, so S06 is not materially needed. S07 is pre-cutoff but not shared; narrowly justified and disclosed in P201 CL05/CL06, while P202 removes those entries.

Failure origin: No baseline output read because task prohibits other output files. Baseline IDs/hashes come only from index/metadata; exact added versus preexisting attribution relative to baseline is not verified. Differences visible across paired probes support identifying the highlighted probe-specific fault; common body facts show no additional hard failure in the permitted record. Section-only fixture: full-edition word burden, actual source destinations/rendering/order and real subscriber exposure are untested. These are preexisting scope limitations, not added factual failures.

Reading burden: 165 prose words; 186 exact recap words; 0.82 minutes at 200 words/minute. Full-edition burden unavailable.

## P202 (W075)

Probe file SHA-256: `d4e1229aacf2ed43592c14c24804d552ced45b0abc95684ca813210260213955` (matches index: True).
Exact recap UTF-8 SHA-256: `c68dc328426b08f499cbc6d700005abf1528378878f5918a0cd82f287f6f0ca6`.

| Dimension | Weight | Rating /4 | Points | Reason |
|---|---:|---:|---:|---|
| factual_fidelity | 20 | 4 | 20.0 | "The repair-grant proposal ended the week as an adopted $4 million pilot in two service areas, rather than the $12 million draft introduced Monday." W075 S01/S03/S05 and shared C01/C03/C05 support scale and status; S04/C04 support hearing disagreement. "adoption did not open applications" is already S05/C05, so S06 is not materially needed. W075 S07: "Of the adopted $4 million, $600,000 is reserved for administration; $3.4 million is available for grants." Friday C07 is available_context, not selected; daily_shared_output is empty. P202 sources_used, displayed group and claims omit S07/D06 and the exception record, despite retaining the exact allocation paragraph. |
| narrative_usefulness | 15 | 4 | 15.0 | Scale, procedural resolution and actual grant allocation add useful understanding beyond daily replay. |
| unsupported_inference_control | 15 | 4 | 15.0 | No invented sentiment, motives or conclusion; budget distinction is directly supported by S07. |
| source_traceability | 10 | 1 | 2.5 | New context not included in the shared daily coverage: the appropriation appendix reserves $600,000 of the adopted $4 million for administration, leaving $3.4 million available for grants. materially uses S07 without any sources_used, claim mapping or displayed source entry. Full-prose audit catches this even though CL05/CL06 are absent. |
| pattern_and_causation_discipline | 10 | 4 | 10.0 | One documented program evolves through distinct draft/recommendation/hearing/adoption developments; no citywide trend or causal motive asserted. |
| material_uncertainty | 10 | 4 | 10.0 | Approval is distinguished from applications; hearing speakers are not generalized and council motives are not inferred. |
| no_filler | 10 | 4 | 10.0 | One substantive arc, no decorative opening or quota-driven length; allocation context earns its place. |
| voice_and_restraint | 5 | 4 | 5.0 | Measured factual and contextual prose throughout. |
| structure_and_readability | 5 | 3 | 3.75 | Readable continuous arc; source grouping hides a materially used source. Section burden recorded; full-edition burden unavailable. |

**Total: 91.25/100. Provisional disposition: fail.** At least one automatic failure; no score can override it. P202 additionally lacks required exception/source evidence. This is not production promotion.

- **fabricated_fact: clear**
  - Exact prose: “New context not included in the shared daily coverage: the appropriation appendix reserves $600,000 of the adopted $4 million for administration, leaving $3.4 million available for grants.”
  - Evidence: W075 S07: "Of the adopted $4 million, $600,000 is reserved for administration; $3.4 million is available for grants." Friday C07 is available_context, not selected; daily_shared_output is empty. P202 sources_used, displayed group and claims omit S07/D06 and the exception record, despite retaining the exact allocation paragraph.
  - Finding: Allocation facts match S07.
- **materially_unsupported_conclusion: clear**
  - Exact prose: “New context not included in the shared daily coverage: the appropriation appendix reserves $600,000 of the adopted $4 million for administration, leaving $3.4 million available for grants.”
  - Evidence: W075 S07: "Of the adopted $4 million, $600,000 is reserved for administration; $3.4 million is available for grants." Friday C07 is available_context, not selected; daily_shared_output is empty. P202 sources_used, displayed group and claims omit S07/D06 and the exception record, despite retaining the exact allocation paragraph.
  - Finding: Budget interpretation directly follows S07; missing logging is separately assessed.
- **materially_unsupported_causal_claim: clear**
  - Exact prose: “Staff recommended the smaller version Tuesday; council adopted it Thursday by a 7–4 vote, requiring evaluation before any expansion.”
  - Evidence: W075 S03/S05 establish sequence and status; hearing paragraph explicitly disclaims council voting motives.
  - Finding: No materially unsupported causal mechanism is asserted; local procedural sequence does not claim vote motives, and P204 no-plan absence is assessed as fact/conclusion.
- **materially_false_pattern: clear**
  - Exact prose: “A smaller repair pilot wins approval”
  - Evidence: "The repair-grant proposal ended the week as an adopted $4 million pilot in two service areas, rather than the $12 million draft introduced Monday." W075 S01/S03/S05 and shared C01/C03/C05 support scale and status; S04/C04 support hearing disagreement. "adoption did not open applications" is already S05/C05, so S06 is not materially needed.
  - Finding: No unsupported broader pattern; arc evolution is confined to the identified program/service.
- **materially_used_but_unlogged_source: fail**
  - Exact prose: “New context not included in the shared daily coverage: the appropriation appendix reserves $600,000 of the adopted $4 million for administration, leaving $3.4 million available for grants.”
  - Evidence: W075 S07: "Of the adopted $4 million, $600,000 is reserved for administration; $3.4 million is available for grants." Friday C07 is available_context, not selected; daily_shared_output is empty. P202 sources_used, displayed group and claims omit S07/D06 and the exception record, despite retaining the exact allocation paragraph.
  - Finding: Entire allocation paragraph and its interpretation require S07, omitted from the evidence log even though prose remains.
- **new_information_violates_context_exception: fail**
  - Exact prose: “New context not included in the shared daily coverage: the appropriation appendix reserves $600,000 of the adopted $4 million for administration, leaving $3.4 million available for grants.”
  - Evidence: W075 S07: "Of the adopted $4 million, $600,000 is reserved for administration; $3.4 million is available for grants." Friday C07 is available_context, not selected; daily_shared_output is empty. P202 sources_used, displayed group and claims omit S07/D06 and the exception record, despite retaining the exact allocation paragraph.
  - Finding: The S07 allocation merits a narrow substantive exception and prose discloses it, but P202 removes exact fact/source/exception mapping and reason from its log; required exception record is absent.

Full-prose and exposure audit: Every sentence of exact_recap, not only claims entries, was checked against packet/sources, daily-v2 selections/shared outputs and history. No probe or log was repaired. "The repair-grant proposal ended the week as an adopted $4 million pilot in two service areas, rather than the $12 million draft introduced Monday." W075 S01/S03/S05 and shared C01/C03/C05 support scale and status; S04/C04 support hearing disagreement. "adoption did not open applications" is already S05/C05, so S06 is not materially needed. S07 is pre-cutoff but not shared; narrowly justified and disclosed in P201 CL05/CL06, while P202 removes those entries.

Failure origin: No baseline output read because task prohibits other output files. Baseline IDs/hashes come only from index/metadata; exact added versus preexisting attribution relative to baseline is not verified. Differences visible across paired probes support identifying the highlighted probe-specific fault; common body facts show no additional hard failure in the permitted record. Section-only fixture: full-edition word burden, actual source destinations/rendering/order and real subscriber exposure are untested. These are preexisting scope limitations, not added factual failures.

Reading burden: 149 prose words; 167 exact recap words; 0.74 minutes at 200 words/minute. Full-edition burden unavailable.

## P203 (W118)

Probe file SHA-256: `af2671e1d2b039ec7c0458d0a0ab4bbc8171fa3592580ee04b44eff06d858946` (matches index: True).
Exact recap UTF-8 SHA-256: `6777bd889b8578b6d7fb2a8e4cd81e098c92b02f69cced7d3ae61a767cb4fc9c`.

| Dimension | Weight | Rating /4 | Points | Reason |
|---|---:|---:|---:|---|
| factual_fidelity | 20 | 2 | 10.0 | The week exposed a common breakdown in city service management, driving disruptions in transit, health care and water. asserts common management failure as fact; individual arc statuses match. W118 S09 records only "An opinion writer calls the bus, clinic and water developments a collapse of city services." Its limit is "Offers no evidence of shared budget, authority, contractor, or cause." C09 is rejected_unsupported. S01–S07 supply unrelated maintenance closure, lease-ending closure and filter damage, without evidence of a common management cause. |
| narrative_usefulness | 15 | 2 | 7.5 | Three independently useful end-state summaries are distorted by the unsupported common-cause opening. |
| unsupported_inference_control | 15 | 1 | 3.75 | The week exposed a common breakdown in city service management, driving disruptions in transit, health care and water. turns an opinion into an unattributed established conclusion. W118 S09 records only "An opinion writer calls the bus, clinic and water developments a collapse of city services." Its limit is "Offers no evidence of shared budget, authority, contractor, or cause." C09 is rejected_unsupported. S01–S07 supply unrelated maintenance closure, lease-ending closure and filter damage, without evidence of a common management cause. |
| source_traceability | 10 | 2 | 5.0 | S09 is listed and mapped in PROBE, so not unlogged; it is absent from visible source groups and does not substantiate the opening. S01–S07 correctly trace body arcs. |
| pattern_and_causation_discipline | 10 | 0 | 0.0 | The week exposed a common breakdown in city service management, driving disruptions in transit, health care and water. invents both a common pattern and its causal mechanism. Multiple unrelated developments cannot establish their claimed relationship. |
| material_uncertainty | 10 | 2 | 5.0 | Body preserves remaining detour, appointment and water-clearance limits; opening claims unsupported certainty about the common cause. |
| no_filler | 10 | 2 | 5.0 | Three arcs are warranted, but the opening manufactures a theme that does not earn its place. |
| voice_and_restraint | 5 | 1 | 1.25 | Opening is sweeping and accusatory; individual body arcs otherwise remain measured. |
| structure_and_readability | 5 | 3 | 3.75 | Headings and consolidated per-arc groups are clear; opening lacks associated visible source support and full-edition burden is unavailable. |

**Total: 41.25/100. Provisional disposition: fail.** At least one automatic failure; no score can override it. P202 additionally lacks required exception/source evidence. This is not production promotion.

- **fabricated_fact: clear**
  - Exact prose: “The week exposed a common breakdown in city service management, driving disruptions in transit, health care and water.”
  - Evidence: W118 S09 records only "An opinion writer calls the bus, clinic and water developments a collapse of city services." Its limit is "Offers no evidence of shared budget, authority, contractor, or cause." C09 is rejected_unsupported. S01–S07 supply unrelated maintenance closure, lease-ending closure and filter damage, without evidence of a common management cause.
  - Finding: Common-cause interpretation is assessed as unsupported conclusion/causal claim/pattern below, without inventing additional discrete event facts.
- **materially_unsupported_conclusion: fail**
  - Exact prose: “The week exposed a common breakdown in city service management, driving disruptions in transit, health care and water.”
  - Evidence: W118 S09 records only "An opinion writer calls the bus, clinic and water developments a collapse of city services." Its limit is "Offers no evidence of shared budget, authority, contractor, or cause." C09 is rejected_unsupported. S01–S07 supply unrelated maintenance closure, lease-ending closure and filter damage, without evidence of a common management cause.
  - Finding: Material conclusion exceeds the supplied record.
- **materially_unsupported_causal_claim: fail**
  - Exact prose: “The week exposed a common breakdown in city service management, driving disruptions in transit, health care and water.”
  - Evidence: W118 S09 records only "An opinion writer calls the bus, clinic and water developments a collapse of city services." Its limit is "Offers no evidence of shared budget, authority, contractor, or cause." C09 is rejected_unsupported. S01–S07 supply unrelated maintenance closure, lease-ending closure and filter damage, without evidence of a common management cause.
  - Finding: Common management failure is asserted to drive all three disruptions without evidence.
- **materially_false_pattern: fail**
  - Exact prose: “The week exposed a common breakdown in city service management, driving disruptions in transit, health care and water.”
  - Evidence: W118 S09 records only "An opinion writer calls the bus, clinic and water developments a collapse of city services." Its limit is "Offers no evidence of shared budget, authority, contractor, or cause." C09 is rejected_unsupported. S01–S07 supply unrelated maintenance closure, lease-ending closure and filter damage, without evidence of a common management cause.
  - Finding: Unrelated developments do not establish common management breakdown.
- **materially_used_but_unlogged_source: clear**
  - Exact prose: “Sources: Synthetic bus disruption notice (S01); Synthetic bus access bulletin (S02); Synthetic bus operations update (S03).”
  - Evidence: W118 S01–S07 are in sources_used and K01–K03; S09 is additionally logged and mapped to PROBE.
  - Finding: No materially identifiable source is absent from internal sources_used/claims; unsupported statements do not become supported by being logged.
- **new_information_violates_context_exception: fail**
  - Exact prose: “The week exposed a common breakdown in city service management, driving disruptions in transit, health care and water.”
  - Evidence: W118 S09 records only "An opinion writer calls the bus, clinic and water developments a collapse of city services." Its limit is "Offers no evidence of shared budget, authority, contractor, or cause." C09 is rejected_unsupported. S01–S07 supply unrelated maintenance closure, lease-ending closure and filter damage, without evidence of a common management cause.
  - Finding: S09/C09 was rejected and never shared. Unattributed common-cause opinion has no evidenced exception reason or new-context disclosure; narrative convenience cannot justify it.

Full-prose and exposure audit: Every sentence of exact_recap, not only claims entries, was checked against packet/sources, daily-v2 selections/shared outputs and history. No probe or log was repaired. "one route remains on detour without a return date" matches W118 S03/C07; "does not guarantee that every appointment will retain its current date" matches S05/C05; "the clearance does not evaluate other infrastructure" matches S07/C06. S01–S07 correspond to shared C01,C04,C07; C03,C05; C02,C06. S09 was never shared; clinic closure notice silence does not establish no plan.

Failure origin: No baseline output read because task prohibits other output files. Baseline IDs/hashes come only from index/metadata; exact added versus preexisting attribution relative to baseline is not verified. Differences visible across paired probes support identifying the highlighted probe-specific fault; common body facts show no additional hard failure in the permitted record. Section-only fixture: full-edition word burden, actual source destinations/rendering/order and real subscriber exposure are untested. These are preexisting scope limitations, not added factual failures.

Reading burden: 190 prose words; 229 exact recap words; 0.95 minutes at 200 words/minute. Full-edition burden unavailable.

## P204 (W118)

Probe file SHA-256: `fb386d7a33675e65ee13b8097e07f90b3b0822000c8f295a8926b885519639af` (matches index: True).
Exact recap UTF-8 SHA-256: `990ffc1107625d1da63b862eedf0bef4b9b9658ebb01d91a8e132d4aafae19b7`.

| Dimension | Weight | Rating /4 | Points | Reason |
|---|---:|---:|---:|---|
| factual_fidelity | 20 | 2 | 10.0 | The initial closure announcement left patients without a transition plan. supplies a factual absence the record never establishes. W118 S04: "A community clinic announces it will close at the end of the month after its lease ends." C03 shares only the month-end closure after lease expiry. S05 later records the signed transfer agreement and appointment-date limit. Neither record establishes that no transition plan existed or that patients were left without one at announcement. |
| narrative_usefulness | 15 | 3 | 11.25 | Closure → signed agreement remains useful, but the added no-plan claim falsely sharpens the before/after contrast. |
| unsupported_inference_control | 15 | 1 | 3.75 | The initial closure announcement left patients without a transition plan. converts source silence into asserted absence. W118 S04: "A community clinic announces it will close at the end of the month after its lease ends." C03 shares only the month-end closure after lease expiry. S05 later records the signed transfer agreement and appointment-date limit. Neither record establishes that no transition plan existed or that patients were left without one at announcement. |
| source_traceability | 10 | 3 | 7.5 | S04 is logged, displayed and mapped in PROBE; all materially identifiable sources are logged, but that source cannot substantiate the new assertion. |
| pattern_and_causation_discipline | 10 | 3 | 7.5 | No wider city pattern or common cause; the local before/after relationship overstates what the initial notice establishes. |
| material_uncertainty | 10 | 2 | 5.0 | Later appointment limit is preserved, but certainty that patients initially had no plan is unwarranted; uncertainty about prior planning is material. |
| no_filler | 10 | 3 | 7.5 | Three warranted arcs; the added unsupported sentence is unnecessary to explain the signed agreement. |
| voice_and_restraint | 5 | 3 | 3.75 | Generally restrained; "left patients without" imputes a documented service gap without evidence. |
| structure_and_readability | 5 | 3 | 3.75 | Three clear headings with source groups; section burden recorded, full-edition/integration burden unavailable. |

**Total: 60.0/100. Provisional disposition: fail.** At least one automatic failure; no score can override it. P202 additionally lacks required exception/source evidence. This is not production promotion.

- **fabricated_fact: fail**
  - Exact prose: “The initial closure announcement left patients without a transition plan.”
  - Evidence: W118 S04: "A community clinic announces it will close at the end of the month after its lease ends." C03 shares only the month-end closure after lease expiry. S05 later records the signed transfer agreement and appointment-date limit. Neither record establishes that no transition plan existed or that patients were left without one at announcement.
  - Finding: Asserts that no transition plan existed without evidence; fabricated absence rather than a proven contradiction.
- **materially_unsupported_conclusion: fail**
  - Exact prose: “The initial closure announcement left patients without a transition plan.”
  - Evidence: W118 S04: "A community clinic announces it will close at the end of the month after its lease ends." C03 shares only the month-end closure after lease expiry. S05 later records the signed transfer agreement and appointment-date limit. Neither record establishes that no transition plan existed or that patients were left without one at announcement.
  - Finding: Material conclusion exceeds the supplied record.
- **materially_unsupported_causal_claim: clear**
  - Exact prose: “The north part of the corridor reopened first, restoring two routes;”
  - Evidence: W118 S02 explicitly relates restored routes to corridor reopening; clinic S04 identifies closure after lease expiry; S06/S07 and daily C02/C06 tie local notice to filter repair/testing.
  - Finding: No materially unsupported causal mechanism is asserted; local procedural sequence does not claim vote motives, and P204 no-plan absence is assessed as fact/conclusion.
- **materially_false_pattern: clear**
  - Exact prose: “Bus detours narrow to one route”
  - Evidence: "one route remains on detour without a return date" matches W118 S03/C07; "does not guarantee that every appointment will retain its current date" matches S05/C05; "the clearance does not evaluate other infrastructure" matches S07/C06. S01–S07 correspond to shared C01,C04,C07; C03,C05; C02,C06.
  - Finding: No unsupported broader pattern; arc evolution is confined to the identified program/service.
- **materially_used_but_unlogged_source: clear**
  - Exact prose: “Sources: Synthetic bus disruption notice (S01); Synthetic bus access bulletin (S02); Synthetic bus operations update (S03).”
  - Evidence: W118 S01–S07 are in sources_used and K01–K03; PROBE logs S04 for the added absence claim.
  - Finding: No materially identifiable source is absent from internal sources_used/claims; unsupported statements do not become supported by being logged.
- **new_information_violates_context_exception: clear**
  - Exact prose: “The initial closure announcement left patients without a transition plan.”
  - Evidence: W118 S04: "A community clinic announces it will close at the end of the month after its lease ends." C03 shares only the month-end closure after lease expiry. S05 later records the signed transfer agreement and appointment-date limit. Neither record establishes that no transition plan existed or that patients were left without one at announcement.
  - Finding: C03/C05 supplied the same clinic arc; no additional source-backed previously uncovered fact is introduced. The unsupported no-plan invention fails fact/conclusion checks, not a justified-or-unjustified source-backed context exception.

Full-prose and exposure audit: Every sentence of exact_recap, not only claims entries, was checked against packet/sources, daily-v2 selections/shared outputs and history. No probe or log was repaired. "one route remains on detour without a return date" matches W118 S03/C07; "does not guarantee that every appointment will retain its current date" matches S05/C05; "the clearance does not evaluate other infrastructure" matches S07/C06. S01–S07 correspond to shared C01,C04,C07; C03,C05; C02,C06. S09 was never shared; clinic closure notice silence does not establish no plan.

Failure origin: No baseline output read because task prohibits other output files. Baseline IDs/hashes come only from index/metadata; exact added versus preexisting attribution relative to baseline is not verified. Differences visible across paired probes support identifying the highlighted probe-specific fault; common body facts show no additional hard failure in the permitted record. Section-only fixture: full-edition word burden, actual source destinations/rendering/order and real subscriber exposure are untested. These are preexisting scope limitations, not added factual failures.

Reading burden: 182 prose words; 221 exact recap words; 0.91 minutes at 200 words/minute. Full-edition burden unavailable.

## Execution and isolation

{
  "evaluator": "/root/evaluate_probes_resume",
  "purpose": "Controlled evaluator sensitivity review; independent evaluation of constructed probes, not independent recap generation.",
  "frozen_before_constructor_key_comparison": true,
  "constructor_key_comparison_performed": false,
  "created_utc": "2026-10-08T00:00:21.282780+00:00",
  "task_instruction": "User authorized independent evaluator sensitivity tests. Repo /workspace/scratch/9aa1e270c37b/austin-daily-briefing. Read pinned c0ef0fcf01d913661bf135d571c1ea723250deb2:docs/friday-synthesis-spec.md and docs/friday-synthesis-validation.md; docs/friday-evidence/2026-10-04/review-probes/index.json and P201/P202/P203/P204.json there; original W075/W118 packets/sources/daily-v2/history. DO NOT read constructor-key.json, reviewer challenge matrix, reviewer keys, prior independent/exploratory evaluations or other output files. Do not contact other agents. Evaluate each full exact_recap against facts and prior daily exposure; audit completeness of logged evidence even for prose with no claim entry. These are sensitivity probes not independent generation. Write review-probes/independent-results.json and .md containing per probe exact SHA, all nine weighted ratings (0–4 and reason/points), total, all six hard checks clear/fail with exact quotes/evidence, disposition provisional per rubric, execution metadata exact task/access and isolation. Distinguish preexisting failures from added failures wherever source permits. Freeze before any constructor-key comparison. Do not change probe prose, repair logs, commit/publish or spawn.",
  "accessed_files": [
    {
      "path": "docs/friday-evidence/2026-10-04/review-probes/index.json",
      "sha256": "965a8a873ac39ef607a1517ffa4a028313d7b0d4fda902665af2cff78aa7261e"
    },
    {
      "path": "docs/friday-evidence/2026-10-04/review-probes/P201.json",
      "sha256": "28e531bb1532f161b431991c9999a4f93eba6cd4316d38236ce74e061d60f3ba"
    },
    {
      "path": "docs/friday-evidence/2026-10-04/review-probes/P202.json",
      "sha256": "d4e1229aacf2ed43592c14c24804d552ced45b0abc95684ca813210260213955"
    },
    {
      "path": "docs/friday-evidence/2026-10-04/review-probes/P203.json",
      "sha256": "af2671e1d2b039ec7c0458d0a0ab4bbc8171fa3592580ee04b44eff06d858946"
    },
    {
      "path": "docs/friday-evidence/2026-10-04/review-probes/P204.json",
      "sha256": "fb386d7a33675e65ee13b8097e07f90b3b0822000c8f295a8926b885519639af"
    },
    {
      "path": "docs/friday-evidence/2026-10-04/W075/packet.json",
      "sha256": "ea8ca35fdef3a38905993f6c8009a8e00e829976c1fdb1bce9ee98f47b3a5302"
    },
    {
      "path": "docs/friday-evidence/2026-10-04/W075/sources.json",
      "sha256": "ae5578eed593e7ca149d2f2f30af88d4095e2a1dd4e1618c4ad7c592f33a1024"
    },
    {
      "path": "docs/friday-evidence/2026-10-04/W075/daily-v2.json",
      "sha256": "52e927444ab979f160f19d221918e644c453dc59dc37ebe502d2d3c5d61f2938"
    },
    {
      "path": "docs/friday-evidence/2026-10-04/W075/history.json",
      "sha256": "febca7194c5e6a36bbcd8645d9dbbb1670f4133b0c3a20fc18d7b60aa450556e"
    },
    {
      "path": "docs/friday-evidence/2026-10-04/W118/packet.json",
      "sha256": "cca2e8390f8dc6086e87bb1bc33834a4dd421243ba95f26e6261c9bf9692d243"
    },
    {
      "path": "docs/friday-evidence/2026-10-04/W118/sources.json",
      "sha256": "960609d6ca415dce5d597ddcc6f5fe7ae650101ba6f92a4b7cdc4ade92c44b78"
    },
    {
      "path": "docs/friday-evidence/2026-10-04/W118/daily-v2.json",
      "sha256": "b069a846bcb24b4819e154eca5c187fddd95e141fa8d941db5fa837048a5067c"
    },
    {
      "path": "docs/friday-evidence/2026-10-04/W118/history.json",
      "sha256": "5fb14847c802199f93fb387e9171fd12401f4e7274c07f37a08f5efe0079fdee"
    }
  ],
  "pinned_documents": [
    {
      "revision": "c0ef0fcf01d913661bf135d571c1ea723250deb2",
      "path": "docs/friday-synthesis-spec.md",
      "sha256": "3f4e9db698d078c72a27bcdd0ef6aa41ada7672f6faac8c530cce2bcf524b566"
    },
    {
      "revision": "c0ef0fcf01d913661bf135d571c1ea723250deb2",
      "path": "docs/friday-synthesis-validation.md",
      "sha256": "eacd5f1fd16b7c5a853d69725e15431fc14d992e51dbc2766b0ff0880742ad12"
    }
  ],
  "isolation": "Fresh delegated evaluator task context. No constructor/reviewer keys, challenge matrix, prior evaluations or other output contents read. No agent contacted during evaluation, no spawning, no prose/log mutation, commit or publish. A filename-only rg inventory exposed names of prohibited files but not contents. Initial combined reads were tool-output truncated; concise source/history/daily extraction then exposed all source facts and selected/rejected/shared records.",
  "limitations": "Closed synthetic fixtures only; not live research, real readership, delivery or rendering QA. Parent handoff occurs only after these evaluation files are written/frozen."
}

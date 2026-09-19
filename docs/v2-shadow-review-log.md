# ADB V2 Shadow Review Evidence Log

**Status:** Active development evidence  
**Canonical scoring contract:** [`docs/v2-shadow-review-prompt.md`](./v2-shadow-review-prompt.md)  
**Current specification:** `ADB-V2-SHADOW-0.2`  
**Weight fingerprint:** `20-20-15-15-10-10-10`  
**Observation window:** 2026-09-14 through 2026-09-26  
**Decision point:** Review promotion readiness after the 2026-09-26 run

This is the durable comparison record for manual, read-only V2 shadow reviews. It is deliberately small: one scorecard, one daily record per run, and one open-issues list. It does not replace the canonical prompt and does not authorize production changes.

## Recording rules

After each run:

1. Add one scorecard row.
2. Record production's five shared Top Stories, V2's proposed five shared Top Stories, consequential production misses corrected by V2, production choices V2 should retain, repeat or override decisions, Under the Radar outcome, and the verdict.
3. Record both histories:
   - **Production history:** whether the live ADB covered the topic in the prior 14 days.
   - **Shadow history:** whether V2 selected the topic in a prior shadow run.
4. Do not count the same unresolved V2 discovery as a new win on later days. If it reappears without material change, label it a shadow-history repeat.
5. Use only these verdicts:
   - **V2 better:** V2 materially improves the slate without a comparable new regression.
   - **Production better:** production materially outperforms V2.
   - **Mixed, leaning V2**
   - **Mixed, leaning production**
   - **Mixed / no clear winner**
6. Corrections are append-only. Do not rewrite an earlier result without recording what changed and why.

## Cumulative scorecard

| Date | Candidates | Verdict | Consequential V2 contribution | Main V2 limitation | Under the Radar |
|---|---:|---|---|---|---|
| 2026-09-14 | 18 | V2 better | Surfaced measles exposure and the AISD takeover dispute; reframed regional Flock-camera data sharing | Extreme-heat concern was later withdrawn because Austin Pulse is intentionally a Top Stories preview | Food Policy Board retained |
| 2026-09-15 | Not preserved | V2 better | Surfaced Central Health's roughly $1B budget/tax decision, the mail-ballot ruling, CapMetro fares, and Project Connect housing | Some afternoon reporting was unavailable at production send; several “new” labels were corrected after full-history review | Not preserved |
| 2026-09-16 | Not preserved | V2 better | Surfaced the East Sixth overdose cluster, the clearest consequential production miss in the period | Initial prior-history reconstruction required correction | Data-center water reporting and AISD meeting found independently |
| 2026-09-17 | 17 | V2 better, verification caveat | Added AHA voucher-policy proposals and Seabrook Square II; found the water framework independently | AHA proposals were not yet adopted; source verification remained important | Water framework selected; AHA promoted from discovery to Top Stories |
| 2026-09-18 | 17 | Mixed, leaning V2 | Again identified AHA voucher proposals and Seabrook; improved placement of Rosewood and the water framework | Repeated the same unresolved shadow discoveries because only production history was checked | Water framework selected |
| 2026-09-19 | 18 | Mixed, leaning V2 | Rejected the Rosewood calendar-only repeat; preserved three genuine material updates; official run again surfaced AHA and Seabrook | AHA and Seabrook are now shadow-history repeats, so the official production-history comparison overstates V2's fresh advantage | Empty; no qualifying new item found |

### Current reading

- Completed comparable runs: **6**
- V2 better: **4**
- Mixed, leaning V2: **2**
- Production better: **0**
- Distinct consequential production misses corrected by V2 include the measles exposure, AISD takeover dispute, Central Health budget/tax decision, mail-ballot ruling, East Sixth overdose cluster, AHA voucher proposals, and Seabrook Square II.
- Evidence currently supports the working conclusion that V2 is outperforming production, with repeat-memory and source-verification limitations still unresolved.
- Continue daily manual testing through **2026-09-26** before making a promotion recommendation.

## Daily records

### 2026-09-14

- **Production strengths retained:** St. John affordable housing, Red River venue preservation, I-35 closures, Food Policy Board.
- **V2 corrections:** Elevated local measles exposure and the AISD takeover/closure dispute; broadened the Flock-camera frame.
- **Repeat controls:** I-35 was a valid material update. iOS 27 was a real material update but received a Freshness Veto. The Texas AP poll update was displaced on consequence.
- **Lesson:** Material change and reader freshness must remain separate decisions.

### 2026-09-15

- **V2 corrections:** Elevated Central Health's roughly $1B budget/tax decision, a mail-ballot ruling, CapMetro fares, and Project Connect housing.
- **Repeat controls:** Austin FC passed the material-change gate at 63 but received a Freshness Veto.
- **Caveat:** Reporting published after the live send is not a production omission. Later full-history review corrected several items initially described as new.

### 2026-09-16

- **V2 corrections:** The East Sixth overdose cluster scored 93 and was the period's clearest production miss. V2 also elevated a second crash death.
- **Under the Radar:** Independent search found data-center water reporting and an AISD meeting.
- **Lesson:** Same-day occurrence is not itself material change, and Under the Radar must be independently discovered rather than backfilled.

### 2026-09-17

- **Production retained:** Overdoses, UT majors, delta-8, and sewage.
- **V2 additions:** AHA voucher-policy proposals and Seabrook Square II supportive housing.
- **Under the Radar:** AHA was independently found and promoted to Top Stories; the water framework remained Under the Radar.
- **Repeat controls:** AISD clarification was materially new but received a Freshness Veto. No Discovery Promotion was used.
- **Verdict:** V2 better on discovery, subject to verification.

### 2026-09-18

- **Production retained:** Voter-suspense notices, Taylor data-center investigation, connected homicides, and Elm Ridge.
- **V2 changes:** Moved the water framework to Under the Radar, treated Rosewood as weekend utility, and again added AHA voucher proposals and Seabrook.
- **Friday wrap-up:** AISD petitions and the Central Health budget were valid, but the section was thin. Friday-wrap-up redesign remains outside the V2 story-selection test.
- **Verdict:** Mixed, leaning V2.

### 2026-09-19

- **Production Top Stories:** AISD ratings appeal; downtown Narcan distribution; Hutto ends Flock-camera use; Rosewood art-space opening; COTALAND opening announcement.
- **Official V2 shared Top Stories:** AISD ratings appeal; downtown Narcan distribution; AHA voucher-policy proposals; Seabrook Square II; Hutto ends Flock-camera use.
- **Next two shared candidates:** Cajjun Eats murder arrest; COTALAND opening announcement.
- **Material-update audit:** AISD appeal, Narcan deployment, and Hutto's final vote are genuine material changes. All were available before the live send and retained by V2.
- **Repeat control:** Rosewood was covered on 2026-09-18 as an opening scheduled for Saturday. “Opens today” adds no new fact and is a non-material repeat.
- **Shadow-history limitation:** AHA and Seabrook appeared in the 2026-09-17 and 2026-09-18 V2 slates. They have no verified new development on 2026-09-19. Under a counterfactual V2-live history, both would be rejected as repeats even though the current canonical prompt treats them as uncovered because production omitted them.
- **Under the Radar:** No qualifying new item. The lane remained empty.
- **Verdict:** Mixed, leaning V2. V2 improves repeat discipline, but its apparent discovery advantage is inflated unless shadow-history continuity is measured.

## Open issues before promotion

| Issue | Evidence | Required resolution |
|---|---|---|
| Shadow-history continuity | AHA and Seabrook recurred across three shadow comparisons without a new development | Decide whether promotion testing should simulate V2's own prior selections in addition to checking production history |
| Source verification | AHA was based on a board packet and proposed changes, not an adoption vote | Keep proposal/adoption language explicit and require accessible support for selected claims |
| Under the Radar consistency | Strong independent discoveries sometimes become Top Stories; other days legitimately produce no item | Preserve independent search, single placement, and permission to leave the section empty |
| Friday wrap-up maturity | 2026-09-18 wrap-up was valid but thin | Keep outside current V2 promotion decision unless separately specified and tested |
| Promotion threshold | Six runs favor V2, but the sample is still short | Complete daily manual runs through 2026-09-26, then assess errors and regressions as well as win count |

## Promotion-review checklist

At the end of the observation window, review:

- Verdict distribution and any production wins.
- Distinct consequential misses corrected, without double-counting recurring discoveries.
- Consequential production choices wrongly dropped by V2.
- False material-change classifications.
- Freshness Veto and Selection Balance decisions.
- Under the Radar quality and empty-lane discipline.
- Source failures or claims that exceeded their sources.
- Performance under both production history and counterfactual V2 shadow history.

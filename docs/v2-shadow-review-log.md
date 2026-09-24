# ADB V2 Shadow Review Evidence Log

**Status:** Active development evidence  
**Canonical scoring contract:** [`docs/v2-shadow-review-prompt.md`](./v2-shadow-review-prompt.md)  
**Current specification:** `ADB-V2-SHADOW-0.3`  
**Weight fingerprint:** `20-20-15-15-10-10-10`  
**Observation window:** 2026-09-14 through 2026-09-26  
**Decision point:** Review promotion readiness after the 2026-09-26 run  
**Testing pause:** No shadow runs were recorded 2026-09-20 through 2026-09-22 while compute capacity was unavailable; missing days are not evidence for or against V2.

This is the durable comparison record for manual, read-only V2 shadow reviews. Runs through 2026-09-19 used `ADB-V2-SHADOW-0.2`; remaining runs use `ADB-V2-SHADOW-0.3`, which adds counterfactual V2-history continuity and proposal/adoption verification without changing the fixed score weights, eligibility floor, or override definitions. It is deliberately small: one scorecard, one daily record per run, and one open-issues list. It does not replace the canonical prompt and does not authorize production changes.

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
| 2026-09-23 | 18 | V2 better | Retained the ICE and data-center leads; added the Travis County budget, Camp Mystic criminal investigation, prison-AC ruling, and Bloom at Lamar Square proposal | Production delivery remained queued; the Austin Current article exposed no exact publication time, so that omission carries a timing caveat | Bloom at Lamar Square proposal selected |
| 2026-09-24 | 20 | V2 better | Surfaced the statewide voter-registration backlog before the live send and prevented yesterday's V2 selections from repeating without new developments | Two strong current-day discoveries published after the 8:37 a.m. CDT send and therefore cannot count as production omissions | Texas youth-prison lockdown records retained |

### Current reading

- Completed comparable runs: **8**
- V2 better: **6**
- Mixed, leaning V2: **2**
- Production better: **0**
- Distinct consequential production misses corrected by V2 include the measles exposure, AISD takeover dispute, Central Health budget/tax decision, mail-ballot ruling, East Sixth overdose cluster, AHA voucher proposals, Seabrook Square II, the Texas prison-air-conditioning ruling, the Camp Mystic criminal-investigation warrants, and the Bloom at Lamar Square fee-waiver proposal, and the statewide voter-registration processing backlog. The Travis County budget is also a likely correction, subject to publication-time verification.
- Evidence currently supports the working conclusion that V2 is outperforming production. Repeat-memory and proposal/adoption verification controls were strengthened in `0.3`; the remaining runs must test whether those controls work as intended.
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

### 2026-09-22 methodology update

Before the remaining observation runs, the canonical shadow specification advanced to `ADB-V2-SHADOW-0.3`.

The change does **not** alter the 100-point weights, 60-point floor, Freshness Veto, Discovery Promotion, or Selection Balance definitions. It resolves three test-method issues identified by the first six runs:

- prior V2 Top Story and Under the Radar selections now form a counterfactual shared repeat history;
- recurring unresolved discoveries can no longer be counted repeatedly as fresh V2 wins;
- proposals, board packets, recommendations, and pending actions must be labeled distinctly from adopted/final outcomes;
- legacy event-section language is aligned with the current Austin Ahead product.

This makes the remaining shadow runs a stricter promotion test while preserving the historical `0.2` results for comparison.


### 2026-09-23

- **Run status:** First run under `ADB-V2-SHADOW-0.3`. The validated production slate was available, but all outbound messages still showed `Queued`; the comparison is against that queued slate rather than confirmed delivery.
- **Production Top Stories:** ICE shooting victim's partial paralysis and hospital return; statewide data-center permit pause; Cedar Park Flock-camera debate; Mendocino Farms South Lamar opening.
- **V2 shared Top Stories:** ICE medical/custody update and local investigation; Travis County's proposed $2.3B budget; expanded statewide data-center permit pause; Camp Mystic criminal-investigation warrants; federal prison-air-conditioning ruling.
- **V2 corrections:** Replaced the unverified Cedar Park agenda framing and low-consequence restaurant opening with consequential civic, court, and public-safety reporting available before the scheduled send. The Austin Current budget story was dated September 22 but exposed no exact publication time, so it is recorded with a timing caveat.
- **Material-update audit:** ICE was a genuine material update and was retained. V2 also classified the data-center action as material because the new order expanded the earlier grid-connection pause to state-issued permits; production marked it `FALSE`. The Lake Austin meetings were calendar timing only, not a material update, and remained Austin Ahead utility.
- **Under the Radar:** Independent official-agenda search found a pending ordinance to waive or reimburse up to $541,314 in right-of-way fees for 100 deeply affordable units at Bloom at Lamar Square. It was selected as Under the Radar and explicitly labeled pending, not approved.
- **Counterfactual repeat control:** AHA voucher proposals and Seabrook Square II were rejected as unresolved shadow-history repeats. No recurring discovery was counted as a new V2 win.
- **Personalization:** Claude Opus 5.5 cleared the floor and remained More for You. Mendocino Farms, Palo Alto Networks, Wind Runners, and the comedy listing did not clear the shared scoring floor or belonged in event utility rather than ranked personalized news. No Discovery Promotion or Freshness Veto was used.
- **Verdict:** V2 better. The improvement is material despite the delivery-status and Austin Current timing caveats.

### 2026-09-24

- **Run timing:** Production was accepted by Resend at 8:37:11 a.m. CDT. Publication-time checks used the source's original timestamp and Central Time where available; later syndication timestamps were not substituted for original publication times.
- **Production Top Stories:** Austin's independent investigation and new video in the ICE shooting; Texas prison-air-conditioning ruling; Camp Mystic criminal investigation; Rivian rear-camera recall; Austin Opera performance center.
- **V2 shared Top Stories:** Statewide voter-registration application backlog; Austin Transit Partnership's cheaper office decision; identification of Jason Landry's remains; Austin Opera performance center; Athena's rehabilitated owlet release. The ATP and Landry stories were published after production's send and are not recorded as production omissions.
- **V2 correction:** The Associated Press voter-registration backlog report was published at 6:37 p.m. ET on September 23—5:37 p.m. CDT, about 15 hours before the live send. It described a state systems error that withheld applications from counties for nearly a year, possible primary-election disenfranchisement, and an October processing deadline. This was the consequential pre-send production omission.
- **Production strengths retained:** Austin Opera remained an eligible shared story. The Texas youth-prison lockdown investigation remained the qualifying Under the Radar item.
- **Repeat control:** ICE's local investigation, the prison-AC ruling, and Camp Mystic warrants were new to today's production slate but were already selected by V2 on September 23. No post-September-23 substantive development was verified, so they were rejected from today's counterfactual V2 slate as non-material repeats. The ICE investigation/video remains a valid `Material Update = TRUE` relative to production history but `FALSE` relative to V2 shadow history.
- **Section changes:** Rivian's recall cleared the floor at 60 but moved from a shared Top Story to More for You because Austin relevance was limited and the generic profile marks Consumer Technology High. Big Queer Weekend remained Austin Ahead event utility rather than a material-update story.
- **Under the Radar:** The independent search retained the Texas Newsroom's records-based youth-prison lockdown investigation. It was not a rejected headline used as filler; its internal-records provenance, high public-interest value, and low likely visibility support the placement.
- **Overrides and balance:** No Freshness Veto or Discovery Promotion was used. Non-material repeats failed before scoring; event arrival did not create material change. Selection Balance did not alter any base score.
- **Verdict:** V2 better. The verified pre-send voter-registration omission is consequential, and `0.3` correctly prevented yesterday's shadow slate from becoming today's reader experience. Post-send ATP and Landry reporting improved the current-day V2 slate but did not count against production.

## Open issues before promotion

| Issue | Evidence | Required resolution |
|---|---|---|
| Shadow-history continuity | AHA and Seabrook recurred across three shadow comparisons without a new development | **Resolved for remaining runs:** `0.3` uses counterfactual V2 history while preserving production history for comparison |
| Source verification | AHA was based on a board packet and proposed changes, not an adoption vote | **Resolved as a specification control:** `0.3` requires explicit proposal/adoption status and supporting evidence; continue auditing execution |
| Under the Radar consistency | Strong independent discoveries sometimes become Top Stories; other days legitimately produce no item | Preserve independent search, single placement, and permission to leave the section empty |
| Friday wrap-up maturity | 2026-09-18 wrap-up was valid but thin | Keep outside current V2 promotion decision unless separately specified and tested |
| Promotion threshold | Eight comparable runs favor V2 overall, but the sample is still short | Complete daily manual runs through 2026-09-26, then assess errors and regressions as well as win count |

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

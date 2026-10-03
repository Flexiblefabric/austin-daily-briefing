# ADB V2 Shadow Review Evidence Log

**Status:** Evidence collection complete — promotion review pending  
**Canonical scoring contract:** [`docs/v2-shadow-review-prompt.md`](./v2-shadow-review-prompt.md)  
**Current specification:** `ADB-V2-SHADOW-0.3`  
**Weight fingerprint:** `20-20-15-15-10-10-10`  
**Observation window:** Planned window 2026-09-14 through 2026-09-26; supplemental stress tests through 2026-10-03  
**Decision point:** Final evidence run completed 2026-10-03; formal promotion review is next  
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
| 2026-09-25 | 21 | Mixed, leaning V2 | Retained four production leads and the independent braille-center discovery; replaced a V2-history repeat with the pre-send Manor police-vehicle fatality | The fatal crash was published only about 40 minutes before the live send; Friday wrap-up remains outside the V2 selection specification | Billman Braille Center retained |
| 2026-09-27 | 18 | Mixed / no clear winner | Retained four strong production leads, rejected a Manor crash repeat in counterfactual V2 history, and correctly left Under the Radar empty | No clearly superior fifth shared lead emerged; the 2:37 p.m. late send changes timing fairness but produced no consequential production-only discovery | Empty; no qualifying new item found |
| 2026-09-28 | 19 | V2 better | Retained four strong production leads, replaced the low-consequence musician feature with the Paige Ellis ballot-access decision, and found a current SAFE Alliance funding recommendation through the independent agenda search | The Ellis article exposes no exact publication time, so it is not counted as a verified pre-queue production omission; the production message remained queued at review time | Human Rights Commission recommendation on multi-year SAFE Alliance funding selected and labeled pending |
| 2026-09-29 | 20 | Mixed, leaning V2 | Retained four production leads, moved the lower-consequence COTALAND stoppages to More for You, elevated the official FY2027 budget/tax-impact update, and found two substantive county agenda actions | The budget was already in V2 history; the new value comes from the September 25 official proposal and tax-impact details, while today's adoption vote was still pending at review time | Proposed felony mental-health diversion court and Northeast District Plan boundary/report actions selected and labeled pending |
| 2026-09-30 | 22 | V2 better | Retained four strong production leads, replaced the regional ballot roundup with Travis County’s completed $2.3B budget adoption, and enforced shadow-history repeat controls | Only seven candidates cleared both the source gate and their section-specific selection rules; Under the Radar was correctly left empty | Empty; no qualifying new item found |
| 2026-10-01 | 24 | V2 better | Retained the Capitol-threat, flood, and ICE leads; replaced a counterfactual county-budget repeat and a routine committee preview with the pre-send Zilker management transfer and Dell Medical School clinical-trials partnership; moved AI police-report testing into shared Under the Radar | A high-scoring DWI-enforcement investigation was omitted by Selection Balance/currentness, creating a possible false-demotion risk | AI-assisted police-report testing selected |
| 2026-10-02 | 26 | Mixed, leaning V2 | Replaced an ACL calendar-only repeat and a counterfactual Zilker repeat with the pre-generation TEA/Alpha AI investigation and new voter-registration accountability findings; promoted the DWI-enforcement investigation after yesterday's possible false demotion | The strongest new ICE accountability article appeared six minutes after production generation, and production appropriately covered Zilker for its real reader history | APD multiple-indecent-assault suspect alert selected |
| 2026-10-03 | 20 | V2 better | Retained the floodgates, Taylor data-center, and Travis County DA leads; replaced two counterfactual V2 repeats with pre-generation emergency-abortion-rights reporting and a pending $10M home-repair expansion found through the independent agenda search | The ICE-hearing and Dell Medical stories were valid for production’s real reader history, so their V2 exclusion reflects counterfactual memory rather than production error; both housing actions remain pending | Elm Ridge’s proposed $33M acquisition-and-rehabilitation bond selected; home-repair expansion promoted from discovery to Top Stories |

### Current reading

- Completed comparable runs: **16** *(nine during the planned window plus seven post-window stress tests)*
- V2 better: **10**
- Mixed, leaning V2: **5**
- Mixed / no clear winner: **1**
- Production better: **0**
- Distinct consequential production misses corrected by V2 include the measles exposure, AISD takeover dispute, Central Health budget/tax decision, mail-ballot ruling, East Sixth overdose cluster, AHA voucher proposals, Seabrook Square II, the Texas prison-air-conditioning ruling, the Camp Mystic criminal-investigation warrants, and the Bloom at Lamar Square fee-waiver proposal, and the statewide voter-registration processing backlog. The Manor police-vehicle fatality is a timing-caveated correction because the story appeared only about 40 minutes before production send. The September 29 run confirmed a material official-budget update through the September 25 proposal and tax-impact documents; the same-day adoption vote was still pending. On September 30, V2 correctly treated the completed $2.3 billion county budget adoption as a new material phase and a consequential pre-send production omission. On October 1, V2 added the Zilker Botanical Garden management transfer and Dell Medical School's national clinical-trials partnership, both published before production generation. On October 2, the pre-generation TEA/Alpha investigation and new voter-registration accountability findings were the main V2 corrections; the DWI-enforcement investigation was a placement correction because production surfaced it only for some personalized profiles rather than as shared coverage. On October 3, V2 added the pre-generation emergency-abortion-rights report and a pending $10 million home-repair expansion found in the October 8 AHFC agenda; the latter moved from discovery into Top Stories because its citywide scope was too broad for Under the Radar. The proposed felony mental-health diversion court and Northeast District Plan boundary/report actions were additional pre-send agenda discoveries, but were not repeated on September 30 without verified outcomes.
- Evidence currently supports the working conclusion that V2 is outperforming production. Repeat-memory and proposal/adoption verification controls were strengthened in `0.3`; the remaining runs must test whether those controls work as intended.
- The planned observation window ended **2026-09-26**. No September 26 run is recorded. The September 27 and September 28 runs are supplementary stress tests and should not silently substitute for the missing date in the promotion review.

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


### 2026-09-25

- **Run timing:** Production was accepted by Resend at 8:37:23 a.m. CDT. Source publication times were normalized to Central Time. A Manor police-vehicle fatality published at 7:57 a.m. CDT was available before send, but only by about 40 minutes.
- **Production Top Stories:** Oak Hill Parkway completion; cancellation of the 2026 Lake Austin drawdown; Austin Transit Partnership's cheaper office decision; removal of UT women’s, gender and sexuality studies courses from the core curriculum; local opioid-call data and a cychlorphine warning.
- **V2 shared Top Stories:** Local opioid-call increase and cychlorphine warning; UT core-curriculum change; Oak Hill Parkway completion; Lake Austin drawdown cancellation; fatal Manor police-vehicle crash. The crash displaced ATP because ATP was already selected by V2 on September 24 and had no verified new development.
- **V2 next tier:** Circle C's roughly 1,000-unit apartment proposal advancing through related Council actions; Manor ISD's proposed $400 million bond; Shane James's insanity-defense filing.
- **Material-update audit:** The overdose warning, UT curriculum change, Oak Hill completion, and Lake Austin cancellation were genuine material changes and retained. ATP was validly new to production history but was a non-material repeat in counterfactual V2 history. Big Queer Weekend occurring today was event timing, not material change.
- **Under the Radar:** The independent search retained KUT's Billman Braille Center feature. Its disability-access, prison-labor, and reentry implications and low likely community visibility independently qualified it; it was not backfilled from rejected Top Stories.
- **Personalization and events:** Microsoft's game-ad patent did not clear the shared floor because it is an application rather than a deployed product and has little Austin relevance. Rachel Scanlon, the Funniest Person in Austin final, and Big Queer Weekend remain event utility rather than ranked personalized news. No Freshness Veto or Discovery Promotion was used.
- **Friday wrap-up:** Production's ICE investigation, data-center permit pause, and prison-air-conditioning ruling are a valid but narrow retrospective. The wrap-up was not scored and did not affect the daily verdict because it is not yet specified in V2.
- **Verdict:** Mixed, leaning V2. Production produced a strong slate and retained four of V2's five leads plus the same qualifying Under the Radar item. V2's improvement is the reader-history correction and the Manor fatality, but that omission carries an unusually short lead-time caveat.


### 2026-09-27 — supplementary late-send stress test

- **Run timing:** Production was accepted by Resend at 2:37:12 p.m. CDT, roughly six hours later than recent 8:37 a.m. sends. Timing was evaluated against both the usual morning window and the actual delivery cutoff; only stories available by the actual cutoff could count as production omissions.
- **Production Top Stories:** Austin-area voter-registration backlog; District 1 candidate Misael Ramos's protest-related arrest and release; Webb Middle School's closure-petition decision window; Wells Branch deaths reclassified as a double homicide with a capital-murder arrest; Manor police-vehicle pedestrian fatality.
- **V2 shared slate:** Voter-registration backlog; Webb petition window; Ramos arrest and release; Wells Branch double-homicide reclassification. V2 did not force a fifth shared lead when the remaining candidates were repeats, section-specific utility, or materially weaker.
- **Timing result:** The 9:54 a.m. cold-front forecast was published after the usual morning send but before today's actual send. Production captured it in the dedicated Weather section. No consequential Sunday report published between the usual and actual cutoffs was omitted from production.
- **Repeat control:** The Manor crash was valid new coverage for production history but was already selected by V2 on September 25 and had no verified material development. It was rejected from the counterfactual V2 slate. The localized county counts and processing urgency made the voter-registration story a material update to V2's September 24 statewide selection.
- **Material changes retained:** Webb families received a concrete short petition window and additional process details; the Wells Branch case changed from an apparent murder-suicide to a double-homicide investigation with an arrest; COTALAND's previously announced opening was completed.
- **Personalization:** COTALAND remained an eligible More for You item after the actual opening. The national Reuters/Ipsos AI poll did not clear the 60-point editorial floor despite matching a High preference. Banger's Oktoberfest remained same-day event utility rather than a material news update.
- **Under the Radar:** Independent official, agenda, specialist, and community searches produced no qualifying new item. The lane remained empty rather than being backfilled.
- **Overrides and balance:** No Freshness Veto or Discovery Promotion was used. Selection Balance omitted the East Austin individual-homicide candidate from the shared slate because two stronger public-safety/court developments were already present and its wider reader consequence was limited.
- **Verdict:** Mixed / no clear winner. Production delivered four strong fresh leads, a valid production-history catch-up story, and an accurate late-morning weather update. V2 produced a cleaner counterfactual reader experience by suppressing the Manor repeat and applying the personalization floor, but it found no consequential omission or clearly superior fifth shared lead.

### 2026-09-28 — supplementary queued-slate stress test

- **Run timing:** The production message was generated and queued at 8:06 a.m. CDT. Delivery was not confirmed at review time, so the comparison is against the completed queued slate rather than a confirmed send.
- **Production Top Stories:** Return demonstration at the North Austin ICE shooting site; UT Austin protest-discipline ruling; new City small-business financing tools; Pascal Kerong’A's advance-ticket experiment; Camp Mystic's proposed property sale and dissolution.
- **V2 shared Top Stories:** Camp Mystic bankruptcy proposal; City small-business financing tools; UT Austin protest-discipline ruling; Paige Ellis's failed ballot petition; North Austin ICE-site return demonstration.
- **V2 change:** Four production leads were retained. The musician feature remained below the 60-point floor and was replaced by the ballot-access decision. The Austin Current article was dated September 28 but exposed no exact publication time, so it is not recorded as a verified pre-queue omission.
- **Material-update audit:** Camp Mystic was a genuine new bankruptcy phase after V2's September 23 criminal-investigation coverage. The ICE return demonstration was published after the September 27 shadow cutoff and added a new organized response at the shooting site. A new voter-registration operations report contained real local data but received a Freshness Veto after consecutive V2 coverage because the incremental reader value was insufficient.
- **Under the Radar:** Independent official-agenda search found a Human Rights Commission item asking the City to support multi-year SAFE Alliance funding and coordinated state advocacy. V2 selected it as Under the Radar and explicitly labeled it a pending recommendation. Production's six-day-old World War II oral-history feature did not clear the floor and appeared to fill the lane rather than report a current overlooked decision.
- **Personalization and events:** None of production's generic-profile More for You items cleared the 60-point editorial floor. Jane Don’t remained Austin Ahead event utility; the national AI-wearables, Witcher remaster, and Walmart pricing stories lacked enough Austin relevance or consequence. No Discovery Promotion was used.
- **Overrides and balance:** The voter-registration story received the run's only Freshness Veto. Selection Balance did not alter the final slate.
- **Verdict:** V2 better. The advantage comes from stronger floor discipline and a materially better independent Under the Radar discovery, not from a verified consequential pre-queue production omission.


### 2026-09-29 — delivered-slate stress test

- **Run timing:** Production was accepted by Resend at 8:37:16 a.m. CDT. The review used that cutoff for omission claims and separately labeled same-day event timing. Later flood-watch reporting did not count against production.
- **Production Top Stories:** State emergency mobilization for the heavy-rain threat; CapMetro's approved systemwide fare increase; free supper for children at eight IDEA campuses; two opening-weekend COTALAND safety stoppages; Sandy Creek residents' request for stronger flood sirens.
- **V2 shared Top Stories:** Heavy-rain/state-mobilization warning; CapMetro fare approval; Travis County's official FY2027 proposed-budget and tax-impact update; Sandy Creek flood-warning request; IDEA child-supper expansion.
- **V2 section change:** COTALAND remained eligible after a genuine operational update but moved from shared Top Stories to More for You because the automated stops caused no injuries, the ride returned to service, and broader public consequence was limited. The generic profile's Gaming interest supports an adjacent-interest placement.
- **Material-update audit:** Weather materially escalated through the state response and stronger rainfall/flood forecast. CapMetro's board approval materially advanced earlier fare proposals. COTALAND's two safety-triggered stoppages were material after V2's September 27 opening coverage. Travis County's September 25 official proposed-budget release and tax-impact statement added concrete new information after V2's September 23 budget story; today's pending vote was event timing, not an adopted outcome.
- **Under the Radar:** Independent official-agenda review found two qualifying pending actions: formal establishment of a felony mental-health diversion court, and approval of the Northeast District Plan boundary and existing-conditions report. Both were available before production's send, independently consequential, and explicitly labeled pending.
- **Personalization and events:** Reuters' report that OpenAI shelved GPT-6.1 Astra cleared the floor at 60 for the profile's High AI interest. The Austin foodie ranking remained below the editorial floor despite a High Food preference. Joe Rogan, the reading-club meeting, and other calendar items remained Austin Ahead utility. No Discovery Promotion or Freshness Veto was used.
- **Repeat control:** The county budget was not counted as a fresh unresolved discovery; only the official release and tax-impact details passed the material-change gate. The commission response to the September 20 shooting was reviewed but not selected because the agenda supplied too little detail to justify another reader-facing item after consecutive ICE coverage.
- **Verdict:** Mixed, leaning V2. Production's slate was strong and V2 retained all five items somewhere. V2 improved consequence and civic discovery by elevating the official budget update and adding two legitimate Under the Radar actions, but the budget remains a recent V2 topic and the adoption outcome was not yet verified.



### 2026-09-30 — adoption-outcome and empty-lane test

- **Run timing:** Production was created at 8:04 a.m. CDT and accepted by Resend at 8:37:14 a.m. CDT. The review used acceptance as the omission cutoff and distinguished pre-send reporting from later same-day developments.
- **Production Top Stories:** Formal Flood Watch and low-water-crossing preparation; federal assault charge against Wilber Garcés Pérez after the ICE shooting; Save Our Springs records lawsuit over Tesla data-center utility demand; AISD enrollment-driven budget gap; Central Texas school bond and tax-rate ballot measures.
- **V2 shared Top Stories:** Travis County's approved $2.3 billion FY2027 budget; Flood Watch and crossing preparation; the new federal charge in the ICE case; AISD's enrollment-driven budget gap; the Tesla data-center records lawsuit.
- **V2 change:** Four production leads were retained. The eleven-district ballot roundup remained eligible at 81 but was displaced from the five shared slots by the completed county budget adoption, which converted the prior day's pending/proposed V2 item into a verified decision with major funding consequences.
- **Material-update audit:** The county budget passed the material-change gate because approval and final allocations replaced yesterday's proposal status. The Flood Watch passed because a formal watch and concrete local preparations materially escalated the prior forecast. The ICE charge passed because a federal criminal complaint and court process created a new legal phase. All three retained high reader value; no Freshness Veto was appropriate.
- **Under the Radar:** Independent official-agenda and community-source review found no qualifying new item. The proposed felony mental-health diversion court and Northeast District Plan actions were selected by V2 on September 29; no adoption outcome was verified before today's cutoff, so both were rejected as unresolved shadow-history repeats. Calendar-only meetings and a job fair remained Austin Ahead utility rather than Under the Radar.
- **Personalization and events:** Reuters' OpenAI “dots” agents report cleared the More for You floor at 64 for the profile's High AI interest. Eater Austin's restaurant heatmap cleared at 61 for the High Food interest. Apple's CEO-overhaul report scored 56 and remained below the floor despite the High Consumer Tech preference. Same-day events remained Austin Ahead utility. No Discovery Promotion was used.
- **Overrides and balance:** No Selection Balance adjustment or Discovery Promotion was used. Freshness Vetoes applied to the unresolved county agenda repeats and the unchanged COTALAND stoppage story from September 29.
- **Verdict:** V2 better. Production's slate was strong, but the completed $2.3 billion county budget—with major allocations for mental-health diversion, disaster reserves, indigent defense, housing, and regional rail study—was more consequential than the regional ballot roundup and was fully available before delivery. V2 also demonstrated the intended empty-lane discipline in Under the Radar.


### 2026-10-01 — counterfactual-repeat and placement test

- **Run timing:** Production was created at 7:56 a.m. CDT and accepted by Resend at 8:37:17 a.m. CDT. The review used production creation as the content-availability cutoff and acceptance as the delivery cutoff. KUT's 8:09 a.m. update that authorities saw no ongoing Capitol threat arrived after production generation, so its absence from the live copy is not counted as an error.
- **Production Top Stories:** Flood Watch and heavy rain; the alleged Texas Capitol attack plot; Travis County's adopted $2.3 billion budget; the Garcés Pérez bond/custody ruling; and Mobility Committee briefings on air taxis, East 51st Street, and transit-oriented development.
- **V2 shared Top Stories:** The alleged Capitol attack plot; Flood Watch and active flooding; the Garcés Pérez bond/custody ruling; the City takeover of Zilker Botanical Garden management; and Dell Medical School's national clinical-trials partnership.
- **V2 change:** Three production leads were retained. The county budget was appropriate for production's real audience because production had not selected it on September 30, but it failed V2's counterfactual material-change gate after V2 selected the completed adoption yesterday. The Mobility Committee preview remained eligible but was better suited to Austin Ahead because the agenda consisted mainly of briefings. V2 elevated two consequential items published before production generation: the Zilker management transfer and Dell Medical School's role in a national clinical-trials initiative.
- **Material-update audit:** Flood conditions materially advanced from forecast/preparation to an active watch and observed flooding. The Garcés Pérez ruling materially advanced the case from charge to a completed bond and custody decision. The Zilker item materially advanced production's September 30 closure notice by revealing that the City would assume full management after the conservancy ceased operations. The county budget did not materially advance within counterfactual V2 history after September 30's completed adoption. Event timing alone did not make the Mobility Committee briefing a material update. No Freshness Veto was used.
- **Under the Radar:** Independent local-accountability review selected Central Texas agencies' use of AI-assisted police-report drafting. The overlooked fact was not merely that AI tools exist, but that Hays County tested one while commissioners rejected a proposed $4.5 million, ten-year expansion and local prosecutors raised accuracy and hallucination concerns. It was placed here rather than in Top Stories because its immediate scope is regional and narrower, and it was not treated as a rejected Top candidate.
- **Personalization and events:** Reuters reporting on the FTC's industry-wide inquiry into frontier-AI risk practices and Anthropic's unusually detailed IPO risk pitch cleared the More for You floor for the profile's High AI interest. The Wonder Food Hall item remained below the floor. The comedy slate and the Mobility Committee meeting were Austin Ahead utility, not ranked stories. No Discovery Promotion was used.
- **Overrides and balance:** No Freshness Veto or Discovery Promotion was used. Selection Balance omitted the high-scoring KUT investigation into Austin's long decline in DWI arrests and enforcement staffing because the slate already contained several public-safety and justice stories and the investigation was two days old. This may be a false demotion and should be watched; the story's systemic public-interest value remains high.
- **Verdict:** V2 better. Production's slate was strong and correctly served live readers with the county-budget adoption. V2 nevertheless improved the shared slate with two consequential pre-generation omissions, used counterfactual memory correctly, and turned AI police-report testing into a legitimate independent Under the Radar selection. The DWI investigation is the day's principal V2 regression risk.


### 2026-10-02 — event-timing, counterfactual-repeat, and Friday-wrap test

- **Run timing:** Production was created at 7:57 a.m. CDT and accepted by Resend at 8:37:10 a.m. CDT. The review was conducted at 8:44 a.m. CDT. KUT's detailed ICE-hearing takeaways were published at 8:03 a.m., after generation but before delivery, so the stronger framing can improve the shadow slate but is not counted as a production omission.
- **Production Top Stories:** Austin–Travis County EOC activation and continuing Flood Watch; ACL Fest proceeding despite rain and soggy grounds; Garcés Pérez's surgery; the City takeover of Zilker Botanical Garden management; and the District 1 candidate forum.
- **V2 shared Top Stories:** EOC activation and active flood risk; newly reported ICE license-plate checks and body-camera gaps combined with the surgery update; new accountability findings showing state agencies had months of warnings before the voter-registration backlog; the TEA/Alpha AI-school investigation; and the investigation into Austin's long decline in DWI enforcement staffing.
- **V2 change:** Flood coverage was retained, and the ICE topic was materially reframed. The ACL item failed the repeat/material-change gate because the festival merely arrived on its announced date without a verified cancellation, delay, or changed safety plan. Zilker remained a valid production material update for real readers but failed counterfactual V2 repeat control because V2 selected the management transfer on October 1. The District 1 forum remained strong at 79 but was displaced by higher-consequence accountability reporting.
- **Material-update audit:** Flood coverage passed through the Level 3 EOC activation, observed I-35 flooding, Hamilton Pool closure, and extended readiness. Garcés Pérez's surgery was a genuine medical update; the post-generation KUT article also added material testimony about random plate checks, body-camera gaps, and an investigator who had not interviewed the shooting agent. The voter-registration story materially advanced September coverage with records showing months of warnings and repeated portal failures. The Flock story materially advanced earlier surveillance coverage through the company's 90-day payment pause for some Texas agencies. Youth-prison advocacy materially advanced the September lockdown reporting through calls to halt two new facilities. Production's ACL TRUE label was classified as calendar timing rather than material change. Production's Zilker TRUE label was valid in production history but FALSE in counterfactual V2 history because no fact changed after the October 1 shadow selection.
- **Under the Radar:** Independent official-source review selected APD's request for public help identifying a suspect tied to at least two indecent assaults at separate Dollar Tree locations. The overlooked facts were the repeated approach pattern and the actionable identification request. It was placed in Under the Radar because the immediate scope was narrower than the shared leads, not because it was a rejected Top Story. The City page exposes a date but no exact publication time, so it is not counted as a verified pre-generation omission.
- **Personalization and events:** The Flock payment-extension investigation cleared the floor for More for You through the profile's High AI/technology interests after shared placement was displaced by stronger Austin-specific items. Legacy Business Month cleared the floor through High Food and adjacent local-business interests. The AI-accessibility feature scored below 60 because it was several days old and offered limited immediate Austin consequence; Xbox release listings also remained below the floor. No Discovery Promotion was used.
- **Overrides and balance:** No Freshness Veto or Discovery Promotion was used. The DWI investigation was not suppressed by broad public-safety balance; its systemic staffing and enforcement findings were treated as distinct from the ICE case and flood response. The District 3 forum was omitted by balance because one of two same-day, same-format council forum packages was enough; District 1 was the stronger of the pair because it is an open seat with six candidates.
- **Friday wrap-up:** Production included CapMetro's fare increase, AISD's enrollment-driven budget gap, and Travis County's adopted budget. Those are representative weekly developments. The current V2 selection specification does not score the wrap-up, so the section is recorded but does not affect the verdict.
- **Verdict:** Mixed, leaning V2. V2 improved consequence and accountability with two pre-generation investigations and corrected yesterday's likely DWI false demotion. Production nevertheless made defensible choices for its real history, particularly Zilker, and V2's strongest ICE framing benefited from reporting published after generation. The comparison therefore favors V2 without treating every slate difference as a production miss.

### 2026-10-03 — final evidence run and counterfactual-memory test

- **Run timing:** Production was created at 7:57 a.m. CDT and accepted by Resend at 8:37:13 a.m. CDT. The review used production creation as the strict omission cutoff. Reuters' AI-safeguards report was published at 5:05 a.m. CDT; KUT's October 2 local reports and the City/AHFC agendas were also available before generation.
- **Production Top Stories:** Highland Lakes floodgate operations; ICE license-plate checks and body-camera gaps; the proposed Taylor data-center annexation agreement; state scrutiny of Travis County DA José Garza; and Dell Medical School's clinical-trials partnership.
- **V2 shared Top Stories:** The Texas House hearing focused on the Travis County DA; the pending $10 million expansion of Austin's bond-funded home-repair program; emergency-abortion-rights education and physician training with Central Texas relevance; the proposed Taylor data-center annexation agreement; and the completed Highland Lakes floodgate operation plus the end of the Flood Watch.
- **V2 change:** Production's floodgate, Taylor, and DA leads were retained. The ICE-hearing details were excluded only because V2 selected them on October 2, and Dell Medical was excluded because V2 selected it on October 1; neither exclusion is treated as a production mistake. V2 added two consequential pre-generation items: KUT's emergency-care rights report and the AHFC agenda's proposed $10 million home-repair expansion.
- **Material-update audit:** The flood topic materially advanced through a completed dam-operation phase and the end of the Flood Watch. ACL's first day also produced a real 15-minute delay and muddy-site update, but its limited incremental reader value left it below the 60-point floor. Production's ICE TRUE label was valid against production history; it was FALSE in counterfactual V2 history because the same hearing findings were selected on October 2.
- **Under the Radar:** Independent official-agenda review found two substantive housing actions. The home-repair expansion was elevated to Top Stories because its proposed citywide funding increase and broad beneficiary class were too consequential for the narrower lane. Under the Radar selected the pending authorization of up to $33 million in bonds to acquire and rehabilitate Elm Ridge Apartments. Both were explicitly labeled pending; neither was recycled from a rejected headline.
- **Personalization and events:** Reuters' report on the White House's voluntary, unenforced AI-safety accord cleared the More for You floor at 60 for the profile's High AI interest. Production's Meta Muse commentary, Dave's Hot Chicken plan, and weekend streaming roundup remained below the editorial floor. Production's three Austin Ahead entries remained useful event utility but were not promoted into the ranked news slate. No Discovery Promotion was used.
- **Overrides and balance:** No Freshness Veto, Discovery Promotion, or Selection Balance adjustment was used. The youth-prison reform story remained eligible but was displaced by five stronger Austin-area leads; the I-35 bridge strike and ACL operational update had ended and fell below the floor.
- **Verdict:** V2 better. It preserved production's strongest fresh local items, used counterfactual history correctly, surfaced a consequential health-information omission, and converted the independent agenda search into one broad Top Story plus one legitimate Under the Radar item. The production slate was nevertheless strong for its real history, and the two counterfactual-repeat exclusions must not be scored as production failures.
- **Evidence closeout:** This is the final shadow run requested for the observation program. The durable record now contains 16 comparable runs: 10 V2 better, five Mixed leaning V2, one Mixed/no clear winner, and zero Production better. Promotion still requires a separate formal review of the observed regressions and operating controls.

## Open issues before promotion

| Issue | Evidence | Required resolution |
|---|---|---|
| Shadow-history continuity | AHA and Seabrook recurred across three shadow comparisons without a new development | **Resolved for remaining runs:** `0.3` uses counterfactual V2 history while preserving production history for comparison |
| Source verification | AHA was based on a board packet and proposed changes, not an adoption vote | **Resolved as a specification control:** `0.3` requires explicit proposal/adoption status and supporting evidence; continue auditing execution |
| Under the Radar consistency | Strong independent discoveries sometimes become Top Stories; other days legitimately produce no item | Preserve independent search, single placement, and permission to leave the section empty |
| Friday wrap-up maturity | 2026-09-18 wrap-up was valid but thin | Keep outside current V2 promotion decision unless separately specified and tested |
| Promotion threshold | Nine planned-window runs favor V2 overall; the September 27 supplemental run found no clear winner | Conduct the promotion review using errors and regressions as well as win count, and explicitly account for the missing September 26 run |

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

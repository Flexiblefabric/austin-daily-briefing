# ADB weekly health scorecard — lightweight pilot

**Status:** Proposed operating practice; not a production automation, live dashboard, or claim of completed verification  
**Initiated:** 2026-10-10 (America/Chicago)  
**Cadence:** One Friday review, ideally 10–15 minutes using existing evidence  
**Pilot:** Four weekly reviews, then keep, simplify, or retire  
**Purpose:** Make ADB cheaper to operate while testing whether the publication is **fast, consistent, and grounded**. ADB is a quasi-public, long-term experiment; reader growth and monetization are not success requirements.

## Operating rules

1. Use existing production queue/history and fixed Operations Status rows, editorial selection notes, incident records, and one rendered edition. No new production writes, duplicate monitoring job, tracking pixel, subscriber-data export, analytics provider, or additional scheduled task is required.
2. Separate **Observed**, **Reported**, **Not checked**, and **Unknown**. Never translate a green scheduler run, queue status, or Resend provider acceptance into verified inbox delivery. Do not infer missing data or conceal failed reconciliation.
3. Limit the weekly scorecard to five measures, three short notes, and at most one decision. Link to existing incidents/runbooks; do not recreate an evidence repository here.
4. Prefer trends to arbitrary targets during the first four observations. The stated 09:00 CT reader-delivery objective is a benchmark to test, not an assertion of an existing service-level guarantee. The 08:00 CT morning generation schedule remains unchanged.
5. Reader usefulness can be tested privately. Soliciting friends or making ADB more public is optional, never a prerequisite.

## Five measures

| Measure | Weekly observation | Evidence / definition | Caveat |
| --- | --- | --- | --- |
| **Fast — availability** | Number of daily edition dates with all eligible editions provider-accepted by **09:00 CT** / scheduled edition dates | Production Outbound Messages sent status, matching provider IDs and acceptance timestamp; report known count, missed dates, and unknowns | Provider acceptance is not inbox placement. Separately flag a late generator or hourly dispatcher miss |
| **Consistent — delivery integrity** | Dates with matching expected queue, provider identifiers, and per-profile Briefing History / evaluated dates; unresolved discrepancies | Existing fixed Operations Status **Daily Resend Delivery**, queue/history reconciliation, incident record | A queue marked Sent with missing history is **not fully reconciled** even if Resend accepted it |
| **Grounded — editorial review** | Three sampled published shared stories per week: source support / procedural status / precise material update / Why It Matters claims; record count with substantive defects | Published story and links, V2 structured selection notes and publication history; sample across days, including a repeat or UTR when present | Passing score arithmetic is not factual verification. Record an exception as Unknown when source evidence cannot be reconstructed |
| **Reader fit — actual experience** | One complete edition read from the reader's perspective: approximate minutes, fast/consistent/grounded ratings (1–5), and one friction observation | Operator's own phone/desktop reading and source-opening experience; optionally one trusted reader's voluntary feedback | Qualitative, not a representative audience survey. Note newsletter length/scroll burden and visual consistency |
| **Operating cost — maintenance** | Approximate hours spent troubleshooting/operating versus editorial experimentation/reading in the week; number of interventions | Operator estimate in 15- or 30-minute increments; distinguish routine checks from urgent fixes | Directional only. Avoid timesheets or pretending to measure exact compute/vendor costs |

### Weekly entry (copy this section only)

**Week ending:** YYYY-MM-DD CT  
**Evidence status:** Observed / Reported / Incomplete (link to existing production reports)  
**Fast:** __ / __ on time by 09:00 CT; unknown __; late generation/dispatch notes: __  
**Consistent:** __ / __ days fully reconciled; unresolved queue/history anomalies: __  
**Grounded:** __ / 3 published stories reviewed; substantive defects __; evidence gaps __  
**Reader fit:** __ minutes; fast __/5, consistent __/5, grounded __/5; one friction point: __  
**Operating cost:** Approx. __ h technical operations/debugging; __ h editorial experimentation; __ manual interventions

**One thing that improved for the reader:** __  
**One recurring cause of work or error:** __  
**Open verification / incident reference:** __  
**Single decision for next week:** Continue / stabilize / run one bounded experiment (describe): __

## Four-week pilot boundaries

- **Stabilization first:** Resolve actual production incidents before expanding scope. Reuse OPS-8/OPS-12, V2-10, FORM-7/FORM-9 work; do not create parallel fixes.
- **Experimental capacity:** No more than one *new* editorial/product experiment in active implementation at a time. Maintain a separate parking lot for ideas; preserve flexibility to explore in the Whiteboard without committing to production work.
- **Short experiment record:** What are we curious about? Which quality pillar might improve? What observation would change our mind? What is the reversible stopping point? Record these four answers before implementation; no comprehensive upfront design required.
- **Publishing restraint:** Do not activate new reader-facing sections during the pilot. Friday synthesis can continue existing validation/integration preparation, but promotion remains a separate decision after full-edition burden and actual delivery checks. Native management remains in controlled DEV until its end-to-end flow is verified.
- **Review after four weeks:** Keep measures that influenced a decision; delete measures that only generated reporting work. Ask whether ADB could run unattended for four weeks, but do not claim that it already can.

## Initial incident for first review — October 10, 2026

Read-only production Operations Status and Operations History at the October 10 09:30 CT watchdog pass reported **13/13 DAILY_BRIEFING_V1 queue rows Sent with distinct Resend provider IDs**, but only **148/170 expected Briefing History rows** present and Sent. One queue delivery lacked matching history provider evidence and another was partially reconciled. Daily Resend Delivery was marked Failed and an alert was recorded. This is a **queue/history reconciliation incident**, not proven failed Resend provider acceptance or inbox nondelivery. Investigate queue/history write and dispatcher behavior; no automatic resend, replay, or history repair based on this scorecard. Reference roadmap **STAB-1**.

## Ownership and boundaries

The scorecard is an editorial/operational **review artifact**, not an authoritative runtime-status table. `PROJECT_STATE.json` remains authoritative for technical registry state; `docs/ROADMAP.md` tracks action status; production Sheets retain original monitoring evidence. Never record subscriber identifiers, addresses, message IDs, provider IDs, raw content, or verification tokens in scorecard entries. Do not automate this pilot until its manual reporting cost and usefulness have been assessed.

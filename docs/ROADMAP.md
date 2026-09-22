# Austin Daily Briefing Roadmap

**Status:** Active project backlog  
**Last reconciled:** 2026-09-22  
**Scope:** Cross-project work that is pending, blocked, deferred, or recently completed  
**Technical state authority:** [`PROJECT_STATE.json`](../PROJECT_STATE.json)

This file is the durable project-level backlog for Austin Daily Briefing. Component specifications and runbooks define how work is performed; this roadmap records whether that work is still pending and what it depends on.

Use these states:

- **Ready** — can be worked now without another product decision.
- **Active** — work is underway.
- **Blocked** — waiting on a known dependency.
- **Review** — implementation is complete enough to require human review or an explicit promotion decision.
- **Deferred** — deliberately outside the current work sequence.
- **Complete** — finished; retained here only when recent completion helps explain current state.

## Current priorities

| ID | Workstream | Task | State | Dependency / next step |
| --- | --- | --- | --- | --- |
| OPS-1 | Completion monitoring | Close out the first 24-hour signup-to-Welcome observation in repository evidence | Complete | Durable retrospective result recorded; original ephemeral scheduler transcript not claimed |
| OPS-2 | Completion monitoring | Mark the one-time completion-observation prompt/task lifecycle complete or retired | Complete | Prompt retired; completed task ID recorded in technical registry |
| OPS-3 | Completion monitoring | Define reusable read-only signup-to-Welcome reconciler state: high-water mark, overlap window, retention, recovery | Complete | Initial implementation uses safer stateless full-scan; future incremental-state rules documented; reusable manual prompt added |
| OPS-4 | Completion monitoring | Exercise the documented DEV completion test vectors | Ready | Reusable production full-scan baseline passed 2026-09-22; controlled DEV failure/replay fixtures still required |
| OPS-5 | Completion monitoring | Stage the first completion incident class after clean DEV validation | Blocked | OPS-3 and OPS-4 |
| OPS-6 | Task reconciliation | Reconcile registered active ChatGPT tasks against live scheduler metadata | Complete | 2026-09-22 baseline matches all three registered active ADB tasks |
| OPS-7 | Task reconciliation | Define scheduler latency/unavailable-metadata handling and reusable reconciliation report | Complete | Runbook defines health/Unknown behavior, existing component tolerances, and next-run metadata limits |
| OPS-8 | Task reconciliation | Verify installed Apps Script welcome/daily dispatcher triggers and define trigger-health evidence | Blocked | Requires Apps Script runtime/trigger visibility; queue history alone is insufficient |
| OPS-9 | Task reconciliation | Test missing/disabled/mismatched task and trigger scenarios without disrupting production | Blocked | OPS-7 and a safe controlled test method |
| OPS-10 | Monitoring rollout | Integrate approved completion/task reconciliation into existing 09:30 watchdog | Blocked | OPS-4, OPS-7, OPS-8, controlled promotion review |
| OPS-11 | Monitoring rollout | Observe first two promoted production cycles and one failure/recovery path | Blocked | OPS-10 |
| V2-1 | V2 selection engine | Resume shadow runs through the planned 2026-09-26 decision point | Blocked | Compute availability; next testing resumes when credits return |
| V2-2 | V2 selection engine | Add counterfactual V2 shadow-history continuity to evaluation | Complete | Added in `ADB-V2-SHADOW-0.3`; remaining runs use V2's own prior shared selections for repeat control |
| V2-3 | V2 selection engine | Tighten proposal/adoption and source-verification language | Complete | `0.3` requires explicit procedural status; scoring model unchanged |
| V2-4 | V2 selection engine | Align legacy event-section terminology with current Austin Ahead naming | Complete | Canonical shadow prompt now uses Austin Ahead |
| V2-5 | V2 selection engine | Reconcile registry V2 specification ID with canonical shadow specification | Complete | Registry now tracks `ADB-V2-SHADOW-0.3` |
| V2-6 | V2 selection engine | Complete shadow evidence log without double-counting recurring discoveries | Blocked | V2-1 |
| V2-7 | V2 selection engine | Conduct formal promotion-readiness review | Blocked | Complete observation window through 2026-09-26 |
| V2-8 | V2 selection engine | Build controlled production-promotion plan if review supports promotion | Blocked | V2-7 and explicit promotion approval |
| WEB-1 | Website | Correct Open Graph/Twitter image references to the active `social-preview.png` asset | Complete | Home, How ADB Works, and What's New now point to the current PNG card |
| WEB-2 | Website | Close out website-redesign implementation documentation after successful PR #23 deployment | Complete | Implementation record now reflects production promotion and successful Pages deployment |
| WEB-3 | Website | Promote website design specification status from draft to approved/implemented | Complete | Canonical design spec status reconciled |
| WEB-4 | Website | Record a concise post-fix live-site verification | Review | After WEB-1 deployment |
| FRI-1 | Friday edition | Define the purpose and anatomy of the improved Friday weekly recap | Ready | Keep separate from V2 promotion |
| FRI-2 | Austin Weekend Explorer | Define Weekend Explorer as the richer Friday utility layer and its relationship to Austin Ahead | Ready | Product-design work |
| FRI-3 | Austin Weekend Explorer | Define discovery sources, selection rules, section anatomy, and length limits | Blocked | FRI-2 |
| FRI-4 | Austin Weekend Explorer | Decide restrained imagery rules for Friday Explorer | Deferred | After Explorer editorial structure is approved |
| HOW-1 | How ADB Works | Replace V2-in-development language with the promoted selection model | Blocked | V2 promotion |
| COMMS-1 | Product communication | Maintain reader-facing What’s New entries for meaningful releases | Active | Operating practice; no standing daily quota |
| COMMS-2 | Product communication | Consolidate newsletter notice / website update / Welcome change / dedicated-email decision rules | Complete | `docs/reader-change-communications.md` added |
| DOC-1 | Documentation | Maintain this roadmap as the canonical cross-project backlog | Active | Reconcile after material project changes |
| DOC-2 | Repository hygiene | Review stale merged/development branches and document deletion/retention policy | Deferred | Low operational value; do not delete branches automatically |

## Recently completed

- Newsletter identity and Welcome redesign promoted and closed out.
- Optional newsletter **What’s New** component promoted.
- Public website redesign merged in PR #23 and GitHub Pages deployment succeeded.
- Public **How ADB Works** and **What’s New** pages launched.
- Repository README replaced with current project-level orientation.
- Canonical Editorial System, Design System, Newsletter Component Specification, and Source-Link Standard established.
- Documentation registry, generated status/architecture/operations docs, changelog, and immutable snapshots established.
- V2 shadow evidence log formalized through the 2026-09-19 run.

## Deliberately deferred ideas

These are not active requirements and should not be treated as overdue work:

- public article or issue archive;
- CMS migration;
- subscriber login/account portal;
- analytics implementation;
- general website photography or illustration;
- self-hosted/remote web fonts;
- standalone Austin Weekend Explorer product;
- original-reporting newsroom functionality.

## Maintenance rule

When a whiteboard decision creates, changes, blocks, or completes a cross-project task, update this file in the same development cycle when practical. Do not duplicate detailed implementation steps here when a component runbook already owns them; link to that runbook and keep this file focused on project status.

# Austin Daily Briefing — Documentation

This is the entry point for ADB's internal documentation. **Canonical production specifications and scheduled-task prompts retain their established paths.** Supporting evidence, implementation histories, and migration records are grouped by workstream.

## Start here

- [Project status](PROJECT_STATUS.md) · [Architecture](ARCHITECTURE.md) · [Operations](OPERATIONS.md)
- [Roadmap](ROADMAP.md) · [Changelog](CHANGELOG.md) · [Release checklist](release-checklist.md)
- [Editorial system](editorial-system.md) · [V2 selection specification](v2-selection-spec.md)
- [Newsletter component specification](newsletter-component-spec.md) · [Design system](design-system.md) · [Source-link standard](source-link-standard.md)
- [Automation prompt registry](automation-prompts/README.md)

## Supporting workstreams

- [Editorial evaluation and V2 evidence](editorial/evidence/) — reviews, shadow runs, calibrations
- [Subscriber experience](subscriber/) — signup, customization, management, confirmation, migration history
- [Delivery and rendering](delivery/) — newsletter transport, layout QA, rendering implementation
- [Operations and reliability](operations/) — completion monitoring, incident analysis, operational evaluation
- [Security and privacy](security/) — security reviews and data handling assessments
- [Website](website/) — website design and redesign history
- [Release candidates](release-candidates/) — historical candidate prompts
- [Registry snapshots](snapshots/) — **immutable; do not edit or relocate**

## Path and maintenance policy

1. Keep live automation prompt files in `automation-prompts/` and all required production specification paths stable unless a separately tested migration explicitly updates every deployed consumer.
2. Treat `PROJECT_STATE.json` as the source of truth for registered documentation paths. Use `python scripts/docs_sync.py audit` after any move; generated `ARCHITECTURE.md`, `OPERATIONS.md`, and `PROJECT_STATUS.md` are not hand-edited.
3. File new workstream design, QA, migration and incident reports in the appropriate subfolder, not the `docs/` root. Prefer a new subfolder only when a workstream has enough documents to justify it.
4. Preserve historical experiment results; do not reclassify them as currently approved procedures. Do not alter immutable `snapshots/`.
5. Before moving a document, update repository links, registry references, scripts/tests, and any scheduled task that consumes its exact path.

**Current exception:** Friday synthesis and editorial-publisher work in open pull requests remains at its existing paths until those branches can be reconciled safely.

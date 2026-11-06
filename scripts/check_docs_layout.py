#!/usr/bin/env python3
"""Enforce the ADB docs/ layout using tracked repository files.

A fixed allowlist preserves existing root-level contracts and legacy files.
New documentation belongs in a workstream subfolder with a README index.
An intentional new canonical root file requires an explicit policy change.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path
from typing import Iterable

REPOSITORY_ROOT = Path(__file__).resolve().parents[1]

# Frozen to the approved docs/ root after the 2026-11-06 reorganization.
# Do not auto-generate this from git: additions must be consciously approved.
APPROVED_ROOT_FILES = frozenset({
    "ARCHITECTURE.md",
    "CHANGELOG.md",
    "OPERATIONS.md",
    "PROJECT_STATUS.md",
    "README.md",
    "ROADMAP.md",
    "daily-newsletter-rendering-contract.md",
    "data-retention.md",
    "design-system.md",
    "domain-health-check.md",
    "editorial-system.md",
    "end-to-end-completion-spec.md",
    "friday-synthesis-evidence-log.md",
    "friday-synthesis-evidence.schema.json",
    "friday-synthesis-spec.md",
    "friday-synthesis-validation.md",
    "native-signup-completion-monitoring.md",
    "native-signup-production-processing.md",
    "newsletter-component-spec.md",
    "production-change-compatibility-checklist.md",
    "release-checklist.md",
    "repository-branch-hygiene.md",
    "selection-notes-example.json",
    "selection-notes.md",
    "source-link-standard.md",
    "subscriber-data-security-baseline.md",
    "task-reconciliation.md",
    "v2-promotion-2026-10-03.md",
    "v2-selection-spec.md",
})

# These established folders have their own governance/immutable-history rules.
# All other top-level docs/ folders must have an index at their root.
INDEX_EXEMPT_FOLDERS = frozenset({"release-candidates", "snapshots"})


def validate_layout(tracked_paths: Iterable[str]) -> list[str]:
    """Return actionable violations for paths relative to the repository root."""
    docs = {p for p in tracked_paths if p.startswith("docs/")}
    root_files: set[str] = set()
    top_level_folders: set[str] = set()

    for path in docs:
        parts = path.split("/")
        if len(parts) == 2:
            root_files.add(parts[1])
        elif len(parts) >= 3:
            top_level_folders.add(parts[1])

    violations = []
    for filename in sorted(root_files - APPROVED_ROOT_FILES):
        violations.append(
            f"docs/{filename}: unapproved top-level file; put supporting "
            "documentation under docs/<workstream>/ instead. For a genuinely "
            "canonical root document, explicitly update APPROVED_ROOT_FILES "
            "and explain the exception in the pull request."
        )

    if "README.md" not in root_files:
        violations.append("docs/README.md: required navigation index is missing")

    for folder in sorted(top_level_folders - INDEX_EXEMPT_FOLDERS):
        readme = f"docs/{folder}/README.md"
        if readme not in docs:
            violations.append(
                f"{readme}: required for each top-level documentation "
                "workstream (add a short navigation index)."
            )

    return violations


def tracked_repo_paths() -> list[str]:
    result = subprocess.run(
        ["git", "ls-files", "--cached", "-z", "--", "docs/"],
        cwd=REPOSITORY_ROOT,
        capture_output=True,
        check=True,
    )
    return [p.decode("utf-8") for p in result.stdout.split(b"\0") if p]


def main() -> int:
    try:
        paths = tracked_repo_paths()
    except (OSError, subprocess.CalledProcessError) as exc:
        print(f"Could not inspect tracked documentation paths: {exc}", file=sys.stderr)
        return 2

    violations = validate_layout(paths)
    if violations:
        print(f"Documentation layout FAILED ({len(violations)} issue(s)):")
        for issue in violations:
            print(f"  - {issue}")
        print("See docs/README.md for the directory and exception policy.")
        return 1

    print("Documentation layout PASSED: approved root files and indexed workstreams.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

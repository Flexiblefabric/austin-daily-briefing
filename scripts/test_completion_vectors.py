#!/usr/bin/env python3
"""Controlled synthetic DEV exercise for ADB-COMPLETION-0.1 test vectors.

This is a pure classification harness. It performs no network calls, spreadsheet
writes, message sends, dispatcher invocations, or subscriber/profile mutations.
"""

from __future__ import annotations

from copy import deepcopy
from dataclasses import dataclass
from typing import Optional

SPEC_ID = "ADB-COMPLETION-0.1"
RECON_ID = "ADB-COMPLETION-RECON-0.1"


@dataclass(frozen=True)
class Evidence:
    readable: bool = True
    valid_response: bool = True
    source_age_hours: float = 0.0
    ledger_present: bool = True
    documented_disposition: Optional[str] = None  # duplicate | invalid
    critical_processor_failure: bool = False
    identity_consistent: bool = True
    signup_actions_present: bool = True
    welcome_count: int = 1
    welcome_status: Optional[str] = "Sent"  # Queued | Sent | Failed | None
    queue_age_hours: float = 0.0
    provider_id_count: int = 1
    duplicate_ledger_mapping: bool = False
    replay_unchanged: bool = False


@dataclass(frozen=True)
class Result:
    classification: str
    audit_only_defect: bool = False
    incident: bool = False
    reason: str = ""


def classify(e: Evidence) -> Result:
    if not e.readable:
        return Result(
            "Unknown — evidence unavailable",
            incident=True,
            reason="required evidence unreadable",
        )

    if e.critical_processor_failure:
        return Result(
            "Unhealthy — explicit processing or integrity failure",
            incident=True,
            reason="critical processor failure",
        )

    if e.duplicate_ledger_mapping:
        return Result(
            "Unhealthy — explicit processing or integrity failure",
            incident=True,
            reason="duplicate ledger mapping",
        )

    if e.documented_disposition == "duplicate":
        return Result(
            "Closed — documented disposition",
            reason="duplicate/existing subscriber disposition",
        )

    if e.documented_disposition == "invalid" or not e.valid_response:
        return Result(
            "Closed — documented disposition",
            reason="invalid or consent absent",
        )

    if e.ledger_present and not e.identity_consistent:
        return Result(
            "Unhealthy — explicit processing or integrity failure",
            incident=True,
            reason="subscriber/profile identity contradiction",
        )

    if e.welcome_count > 1:
        return Result(
            "Unhealthy — explicit processing or integrity failure",
            incident=True,
            reason="duplicate deterministic welcome",
        )

    if e.welcome_status == "Failed":
        return Result(
            "Unhealthy — explicit processing or integrity failure",
            incident=True,
            reason="welcome failed",
        )

    if e.welcome_status == "Sent" and e.provider_id_count != 1:
        return Result(
            "Unhealthy — explicit processing or integrity failure",
            incident=True,
            reason="Sent without exactly one provider ID",
        )

    if (
        e.welcome_status == "Sent"
        and e.provider_id_count == 1
        and e.ledger_present
        and e.identity_consistent
    ):
        return Result(
            "Complete",
            audit_only_defect=not e.signup_actions_present,
            reason=(
                "delivery complete"
                if e.signup_actions_present
                else "delivery complete; Signup Actions audit row missing"
            ),
        )

    if e.welcome_status == "Queued":
        if e.queue_age_hours <= 2.0:
            return Result(
                "Pending — delivery window",
                reason="welcome queued within two-hour window",
            )
        return Result(
            "Unhealthy — delivery overdue",
            incident=True,
            reason="welcome queued more than two hours",
        )

    if not e.ledger_present or e.welcome_status is None:
        if e.source_age_hours < 8.0:
            return Result(
                "Pending — intake window",
                reason="valid response still within eight-hour intake window",
            )
        return Result(
            "Unhealthy — intake incomplete",
            incident=True,
            reason="valid response exceeded eight-hour intake window",
        )

    return Result(
        "Unhealthy — explicit processing or integrity failure",
        incident=True,
        reason="unreconciled contradictory state",
    )


VECTORS = [
    (
        "New response, no ledger yet",
        Evidence(
            source_age_hours=2,
            ledger_present=False,
            welcome_count=0,
            welcome_status=None,
            provider_id_count=0,
        ),
        "Pending — intake window",
        False,
    ),
    (
        "Delayed intake",
        Evidence(
            source_age_hours=8 + 1 / 60,
            ledger_present=False,
            welcome_count=0,
            welcome_status=None,
            provider_id_count=0,
        ),
        "Unhealthy — intake incomplete",
        False,
    ),
    (
        "Queued normally",
        Evidence(queue_age_hours=0.75, welcome_status="Queued", provider_id_count=0),
        "Pending — delivery window",
        False,
    ),
    (
        "Delivery overdue",
        Evidence(
            queue_age_hours=2 + 1 / 60,
            welcome_status="Queued",
            provider_id_count=0,
        ),
        "Unhealthy — delivery overdue",
        False,
    ),
    ("Completed", Evidence(), "Complete", False),
    (
        "Processor error",
        Evidence(critical_processor_failure=True),
        "Unhealthy — explicit processing or integrity failure",
        False,
    ),
    (
        "Partial identity write",
        Evidence(
            identity_consistent=False,
            welcome_status=None,
            welcome_count=0,
            provider_id_count=0,
        ),
        "Unhealthy — explicit processing or integrity failure",
        False,
    ),
    (
        "Duplicate source submission",
        Evidence(
            documented_disposition="duplicate",
            welcome_status=None,
            welcome_count=0,
            provider_id_count=0,
        ),
        "Closed — documented disposition",
        False,
    ),
    (
        "Invalid consent",
        Evidence(
            valid_response=False,
            documented_disposition="invalid",
            welcome_status=None,
            welcome_count=0,
            provider_id_count=0,
        ),
        "Closed — documented disposition",
        False,
    ),
    (
        "Missing audit row only",
        Evidence(signup_actions_present=False),
        "Complete",
        True,
    ),
    (
        "Failed welcome",
        Evidence(welcome_status="Failed", provider_id_count=0),
        "Unhealthy — explicit processing or integrity failure",
        False,
    ),
    (
        "Sent without provider evidence",
        Evidence(welcome_status="Sent", provider_id_count=0),
        "Unhealthy — explicit processing or integrity failure",
        False,
    ),
    (
        "Duplicate deterministic welcome",
        Evidence(welcome_count=2, welcome_status="Sent", provider_id_count=1),
        "Unhealthy — explicit processing or integrity failure",
        False,
    ),
    (
        "Unreadable required range",
        Evidence(readable=False),
        "Unknown — evidence unavailable",
        False,
    ),
    (
        "Clean replay",
        Evidence(replay_unchanged=True),
        "Complete",
        False,
    ),
]


def main() -> int:
    failures = []
    before = deepcopy(VECTORS)

    print(f"{SPEC_ID} / {RECON_ID} synthetic DEV vector exercise")
    print("vector\texpected\tactual\taudit-only\tresult")

    for name, evidence, expected, expected_audit in VECTORS:
        actual = classify(evidence)
        passed = (
            actual.classification == expected
            and actual.audit_only_defect == expected_audit
        )
        if not passed:
            failures.append((name, expected, expected_audit, actual))

        print(
            f"{name}\t{expected}\t{actual.classification}\t"
            f"{actual.audit_only_defect}\t{'PASS' if passed else 'FAIL'}"
        )

    mutation_ok = before == VECTORS
    print(f"fixture mutation guard\t{'PASS' if mutation_ok else 'FAIL'}")
    if not mutation_ok:
        failures.append(("fixture mutation guard", "unchanged", False, "changed"))

    print(
        f"summary\t{len(VECTORS) - len(failures)}/{len(VECTORS)} vectors passed; "
        f"mutation guard={'PASS' if mutation_ok else 'FAIL'}"
    )
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""Controlled alert-policy exercise for OPS-5.

Staged incident class: Unhealthy — intake incomplete.

Pure logic only: no network calls, email sends, spreadsheet writes, dispatcher
invocations, subscriber/profile changes, or production mutations.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import FrozenSet


COMPONENT = "Signup Completion"
STAGED_CLASSIFICATION = "Unhealthy — intake incomplete"


@dataclass(frozen=True)
class AlertDecision:
    send_alert: bool
    incident_key: str | None
    reason: str
    recovery_record_only: bool = False


def incident_key(component: str, central_date: date) -> str:
    return f"{component}|{central_date.isoformat()}"


def decide_alert(
    *,
    classification: str,
    central_date: date,
    prior_alert_keys: FrozenSet[str] = frozenset(),
    was_unhealthy: bool = False,
) -> AlertDecision:
    """Apply the staged one-class alert policy.

    Only the staged intake-incomplete classification is alert-enabled. Other
    completion classifications remain report-only during OPS-5.
    """
    key = incident_key(COMPONENT, central_date)

    if classification == "Complete" and was_unhealthy:
        return AlertDecision(
            send_alert=False,
            incident_key=None,
            reason="recovery is recorded silently",
            recovery_record_only=True,
        )

    if classification != STAGED_CLASSIFICATION:
        return AlertDecision(
            send_alert=False,
            incident_key=None,
            reason="classification is not alert-enabled in OPS-5 stage 1",
        )

    if key in prior_alert_keys:
        return AlertDecision(
            send_alert=False,
            incident_key=key,
            reason="same component/date already alerted",
        )

    return AlertDecision(
        send_alert=True,
        incident_key=key,
        reason="first staged intake-incomplete incident for component/date",
    )


def build_controlled_alert(
    *,
    oldest_age: str,
    affected_count: int,
    operations_status_url: str,
) -> tuple[str, str]:
    """Return privacy-safe controlled subject/body for transport review."""
    subject = (
        "[CONTROLLED TEST] ADB alert — Signup Completion — intake incomplete"
    )
    body = "\n".join(
        [
            "Austin Daily Briefing completion monitoring detected a controlled incident.",
            "",
            "Component: Signup Completion",
            "Stage: Intake reconciliation",
            "State: Unhealthy — intake incomplete",
            "Threshold: valid signup older than 8 hours without a reconciled ledger result or eligible queue/disposition",
            f"Oldest unresolved age: {oldest_age}",
            f"Affected journeys: {affected_count}",
            "",
            "Action: Review Operations Status and the production intake ledger. Monitoring must not resend, repair, or modify subscriber records.",
            f"Operations Status: {operations_status_url}",
            "",
            "CONTROLLED TEST: synthetic evidence only; no production subscriber data was used.",
        ]
    )
    return subject, body


def main() -> int:
    d1 = date(2026, 9, 23)
    d2 = date(2026, 9, 24)
    cases = [
        (
            "healthy pending does not alert",
            decide_alert(
                classification="Pending — intake window",
                central_date=d1,
            ),
            False,
            False,
        ),
        (
            "first intake-incomplete incident alerts",
            decide_alert(
                classification=STAGED_CLASSIFICATION,
                central_date=d1,
            ),
            True,
            False,
        ),
        (
            "same-day replay is deduplicated",
            decide_alert(
                classification=STAGED_CLASSIFICATION,
                central_date=d1,
                prior_alert_keys=frozenset({incident_key(COMPONENT, d1)}),
            ),
            False,
            False,
        ),
        (
            "next-day unresolved incident may alert once",
            decide_alert(
                classification=STAGED_CLASSIFICATION,
                central_date=d2,
                prior_alert_keys=frozenset({incident_key(COMPONENT, d1)}),
                was_unhealthy=True,
            ),
            True,
            False,
        ),
        (
            "recovery is silent",
            decide_alert(
                classification="Complete",
                central_date=d1,
                prior_alert_keys=frozenset({incident_key(COMPONENT, d1)}),
                was_unhealthy=True,
            ),
            False,
            True,
        ),
        (
            "other unhealthy class remains report-only",
            decide_alert(
                classification="Unhealthy — delivery overdue",
                central_date=d1,
            ),
            False,
            False,
        ),
        (
            "unknown remains report-only during first staged class",
            decide_alert(
                classification="Unknown — evidence unavailable",
                central_date=d1,
            ),
            False,
            False,
        ),
    ]

    failures: list[str] = []
    for name, actual, expected_send, expected_recovery in cases:
        ok = (
            actual.send_alert == expected_send
            and actual.recovery_record_only == expected_recovery
        )
        print(f"{name}: {'PASS' if ok else 'FAIL'} — {actual.reason}")
        if not ok:
            failures.append(name)

    subject, body = build_controlled_alert(
        oldest_age="8h 1m",
        affected_count=1,
        operations_status_url="https://docs.google.com/spreadsheets/d/PRODUCTION_INTAKE_ID/edit#gid=OPERATIONS_STATUS",
    )

    forbidden_fragments = [
        "@",
        "GOOGLE:SIGNUP:",
        "P00",
        "resend_",
        "WELCOME-GOOGLE:",
        "token=",
    ]
    privacy_ok = all(fragment not in body for fragment in forbidden_fragments)
    prefix_ok = subject.startswith("[CONTROLLED TEST]")
    repair_boundary_ok = "must not resend, repair, or modify" in body

    print(f"controlled subject prefix: {'PASS' if prefix_ok else 'FAIL'}")
    print(f"privacy guard: {'PASS' if privacy_ok else 'FAIL'}")
    print(f"repair-boundary language: {'PASS' if repair_boundary_ok else 'FAIL'}")

    if not prefix_ok:
        failures.append("controlled subject prefix")
    if not privacy_ok:
        failures.append("privacy guard")
    if not repair_boundary_ok:
        failures.append("repair-boundary language")

    print(f"summary: {10 - len(failures)}/10 checks passed")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())

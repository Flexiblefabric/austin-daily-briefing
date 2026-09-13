#!/usr/bin/env python3
"""Austin Daily Briefing internal documentation registry utility.

Commands:
  status  summarize PROJECT_STATE.json
  audit   validate registry structure and repository references
  preview print the generated internal project-status document
  update  audit first, then update only docs/PROJECT_STATUS.md
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path
from typing import Any, Iterable

SUPPORTED_SCHEMA_MAJOR = 1
ROOT = Path(__file__).resolve().parents[1]
REGISTRY_PATH = ROOT / "PROJECT_STATE.json"


class RegistryError(RuntimeError):
    pass


def load_registry() -> dict[str, Any]:
    if not REGISTRY_PATH.exists():
        raise RegistryError(f"Registry not found: {REGISTRY_PATH}")
    try:
        data = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise RegistryError(f"Invalid JSON in {REGISTRY_PATH}: {exc}") from exc
    if not isinstance(data, dict):
        raise RegistryError("Registry root must be a JSON object.")
    return data


def schema_major(registry: dict[str, Any]) -> int:
    raw = registry.get("schema_version")
    if not isinstance(raw, str) or not raw.strip():
        raise RegistryError("schema_version must be a non-empty string.")
    try:
        return int(raw.split(".", 1)[0])
    except ValueError as exc:
        raise RegistryError(f"Invalid schema_version: {raw!r}") from exc


def ensure_supported_schema(registry: dict[str, Any]) -> None:
    major = schema_major(registry)
    if major != SUPPORTED_SCHEMA_MAJOR:
        raise RegistryError(
            f"Unsupported PROJECT_STATE schema {registry.get('schema_version')}. "
            f"docs_sync supports major version {SUPPORTED_SCHEMA_MAJOR}.x."
        )


def nested_get(data: dict[str, Any], path: Iterable[str]) -> Any:
    current: Any = data
    for key in path:
        if not isinstance(current, dict) or key not in current:
            return None
        current = current[key]
    return current


def local_git_status() -> str:
    try:
        result = subprocess.run(
            ["git", "status", "--short"],
            cwd=ROOT,
            check=False,
            capture_output=True,
            text=True,
            timeout=5,
        )
    except (OSError, subprocess.TimeoutExpired):
        return "unavailable"
    if result.returncode != 0:
        return "unavailable"
    return "clean" if not result.stdout.strip() else "modified"


def status(registry: dict[str, Any]) -> int:
    project = registry.get("project", {})
    services = registry.get("services", {})
    automation = registry.get("automation", {})
    prod = nested_get(registry, ("environments", "production")) or {}
    dev = nested_get(registry, ("environments", "development")) or {}

    print("Austin Daily Briefing — Project State")
    print("=" * 38)
    print(f"Schema:          {registry.get('schema_version')}")
    print(f"Registry:        {registry.get('registry_version', 'not set')}")
    print(f"Last reviewed:   {registry.get('last_reviewed', 'not set')}")
    print(f"Repository:      {project.get('repository', 'not set')}")
    print(f"Public site:     {project.get('public_site', 'not set')}")
    print(f"Production:      {prod.get('status', 'unknown')}")
    print(f"Development:     {dev.get('status', 'unknown')}")
    print(f"Git worktree:    {local_git_status()}")
    print("\nServices")
    for name, config in services.items():
        if isinstance(config, dict):
            provider = config.get("provider") or config.get("platform") or ""
            suffix = f" — {provider}" if provider else ""
            print(f"- {name}: {config.get('status', 'unknown')}{suffix}")
    print("\nAutomation")
    for name, config in automation.items():
        if isinstance(config, dict):
            print(f"- {name}: {config.get('status', 'unknown')} — {config.get('cadence', 'cadence not recorded')}")
    return 0


def audit(registry: dict[str, Any], *, quiet: bool = False) -> int:
    errors: list[str] = []
    warnings: list[str] = []
    ok: list[str] = []

    required_top = {
        "schema_version", "registry_version", "last_reviewed", "project",
        "environments", "services", "automation", "runtime_properties",
        "documentation", "governance",
    }
    missing = sorted(required_top - registry.keys())
    if missing:
        errors.append("Missing top-level fields: " + ", ".join(missing))
    else:
        ok.append("Required top-level registry fields are present")

    project = registry.get("project", {})
    if project.get("repository") != "Flexiblefabric/austin-daily-briefing":
        warnings.append("project.repository differs from the expected repository name")
    else:
        ok.append("Repository identity matches")

    if nested_get(registry, ("governance", "registry_is_authoritative")) is not True:
        errors.append("governance.registry_is_authoritative must be true")
    else:
        ok.append("Registry is marked authoritative")

    documentation = registry.get("documentation", {})
    doc_paths: list[tuple[str, str]] = []
    if isinstance(documentation, dict):
        for key, value in documentation.items():
            if key in {"scope", "generated_status"}:
                continue
            if isinstance(value, str) and ("/" in value or value.endswith((".json", ".md", ".py"))):
                doc_paths.append((f"documentation.{key}", value))

    for service_name, service in registry.get("services", {}).items():
        if isinstance(service, dict):
            for key in ("source_path", "workflow_path"):
                value = service.get(key)
                if isinstance(value, str):
                    doc_paths.append((f"services.{service_name}.{key}", value))

    for automation_name, automation in registry.get("automation", {}).items():
        if isinstance(automation, dict):
            value = automation.get("source_path")
            if isinstance(value, str):
                doc_paths.append((f"automation.{automation_name}.source_path", value))

    missing_paths = [
        f"{label} -> {rel}" for label, rel in sorted(set(doc_paths))
        if not (ROOT / rel).exists()
    ]
    if missing_paths:
        errors.extend(f"Referenced repository path does not exist: {item}" for item in missing_paths)
    else:
        ok.append("All current repository path references exist")

    properties = registry.get("runtime_properties")
    if not isinstance(properties, list):
        errors.append("runtime_properties must be an array")
    else:
        names: list[str] = []
        for index, item in enumerate(properties):
            if not isinstance(item, dict):
                errors.append(f"runtime_properties[{index}] must be an object")
                continue
            name = item.get("name")
            if not isinstance(name, str) or not name:
                errors.append(f"runtime_properties[{index}] is missing a valid name")
                continue
            names.append(name)
            forbidden = set(item) & {"value", "secret", "token", "key_value"}
            if forbidden:
                errors.append(
                    f"runtime property {name} contains forbidden value-bearing field(s): "
                    + ", ".join(sorted(forbidden))
                )
        if len(names) != len(set(names)):
            errors.append("runtime_properties contains duplicate property names")
        elif names:
            ok.append("Runtime properties contain names/metadata only and are unique")

    changelog = documentation.get("changelog") if isinstance(documentation, dict) else None
    if isinstance(changelog, str) and (ROOT / changelog).exists():
        text = (ROOT / changelog).read_text(encoding="utf-8")
        if "## 2026-09-13" not in text:
            warnings.append("Changelog does not contain an entry for the registry's current production cutover date")
        else:
            ok.append("Current production cutover is represented in the changelog")

    if not quiet:
        print("ADB Documentation Audit")
        print("=" * 23)
        for item in ok:
            print(f"OK   {item}")
        for item in warnings:
            print(f"WARN {item}")
        for item in errors:
            print(f"FAIL {item}")
        print()
        if errors:
            print(f"Result: FAILED ({len(errors)} error(s), {len(warnings)} warning(s))")
        else:
            print(f"Result: PASSED ({len(warnings)} warning(s))")
    return 1 if errors else 0


def render_project_status(registry: dict[str, Any]) -> str:
    project = registry["project"]
    prod = registry["environments"]["production"]
    services = registry["services"]
    automation = registry["automation"]
    lines = [
        "# Austin Daily Briefing — Internal Project Status",
        "",
        "> Generated from `PROJECT_STATE.json`. Do not edit this generated document directly.",
        "",
        f"- Schema version: `{registry['schema_version']}`",
        f"- Registry version: `{registry['registry_version']}`",
        f"- Last reviewed: `{registry['last_reviewed']}`",
        f"- Production status: **{prod.get('status', 'unknown')}**",
        f"- Public site: {project.get('public_site', '')}",
        "",
        "## Production data",
        "",
        f"- Subscriber database: {prod['subscriber_database']['title']} (`{prod['subscriber_database']['file_id']}`)",
        f"- Intake database: {prod['intake_database']['title']} (`{prod['intake_database']['file_id']}`)",
        "",
        "## Services",
        "",
    ]
    for name, config in services.items():
        provider = config.get("provider") or config.get("platform") or "not recorded"
        lines.append(f"- **{name}** — {config.get('status', 'unknown')} — {provider}")
    lines.extend(["", "## Automation", ""])
    for name, config in automation.items():
        lines.append(f"- **{name}** — {config.get('status', 'unknown')} — {config.get('cadence', 'cadence not recorded')}")
    lines.extend(["", "## Runtime configuration names", ""])
    for item in registry.get("runtime_properties", []):
        lines.append(f"- `{item['name']}` — {item.get('purpose', '')}")
    lines.extend([
        "",
        "Secret and private configuration values are intentionally excluded from the registry and generated documentation.",
        "",
    ])
    return "\n".join(lines)


def generated_status_target(registry: dict[str, Any]) -> Path:
    configured = nested_get(registry, ("documentation", "generated_status"))
    if not isinstance(configured, str) or not configured:
        raise RegistryError("documentation.generated_status is not configured.")
    if configured != "docs/PROJECT_STATUS.md":
        raise RegistryError(
            "Guarded update refuses unexpected generated_status target: " + configured
        )
    target = (ROOT / configured).resolve()
    docs_root = (ROOT / "docs").resolve()
    if docs_root not in target.parents:
        raise RegistryError("Generated status target must remain inside docs/.")
    return target


def preview(registry: dict[str, Any]) -> int:
    target = generated_status_target(registry)
    generated = render_project_status(registry)
    print(f"Preview target: {target.relative_to(ROOT)}")
    print("No files will be modified.\n")
    if target.exists() and target.read_text(encoding="utf-8") == generated:
        print("No change: generated content matches the current file.")
        return 0
    print(generated)
    return 0


def update(registry: dict[str, Any]) -> int:
    if audit(registry, quiet=True) != 0:
        raise RegistryError("Audit failed; generated documentation was not modified.")
    target = generated_status_target(registry)
    generated = render_project_status(registry)
    if target.exists() and target.read_text(encoding="utf-8") == generated:
        print(f"No change: {target.relative_to(ROOT)} is current.")
        return 0
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(generated, encoding="utf-8")
    print(f"Updated {target.relative_to(ROOT)} from PROJECT_STATE.json.")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=("status", "audit", "preview", "update"))
    return parser


def main() -> int:
    args = build_parser().parse_args()
    try:
        registry = load_registry()
        ensure_supported_schema(registry)
        if args.command == "status":
            return status(registry)
        if args.command == "audit":
            return audit(registry)
        if args.command == "preview":
            return preview(registry)
        if args.command == "update":
            return update(registry)
        raise RegistryError(f"Unsupported command: {args.command}")
    except RegistryError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())

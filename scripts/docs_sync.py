#!/usr/bin/env python3
"""Austin Daily Briefing internal documentation registry utility.

Commands:
  status    summarize PROJECT_STATE.json
  audit     validate registry structure and repository references
  preview   print the generated internal documentation
  update    audit first, then update generated internal documentation
  snapshot  write an immutable point-in-time copy of the authoritative registry
"""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Iterable
from zoneinfo import ZoneInfo

SUPPORTED_SCHEMA_MAJOR = 1
ROOT = Path(__file__).resolve().parents[1]
REGISTRY_PATH = ROOT / "PROJECT_STATE.json"
ALLOWED_GENERATED_TARGETS = {
    "generated_status": "docs/PROJECT_STATUS.md",
    "generated_architecture": "docs/ARCHITECTURE.md",
    "generated_operations": "docs/OPERATIONS.md",
}


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
            ["git", "status", "--short"], cwd=ROOT, check=False,
            capture_output=True, text=True, timeout=5,
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


def generated_targets(registry: dict[str, Any]) -> dict[str, Path]:
    documentation = registry.get("documentation", {})
    if not isinstance(documentation, dict):
        raise RegistryError("documentation must be an object.")
    targets: dict[str, Path] = {}
    docs_root = (ROOT / "docs").resolve()
    for key, expected in ALLOWED_GENERATED_TARGETS.items():
        configured = documentation.get(key)
        if configured != expected:
            raise RegistryError(f"Guarded update refuses unexpected {key} target: {configured!r}")
        target = (ROOT / configured).resolve()
        if docs_root not in target.parents:
            raise RegistryError(f"Generated target must remain inside docs/: {configured}")
        targets[key] = target
    return targets


def snapshots_dir(registry: dict[str, Any]) -> Path:
    configured = nested_get(registry, ("documentation", "snapshots_dir"))
    if configured != "docs/snapshots":
        raise RegistryError(f"Guarded snapshot refuses unexpected snapshots_dir: {configured!r}")
    target = (ROOT / configured).resolve()
    docs_root = (ROOT / "docs").resolve()
    if target.parent != docs_root:
        raise RegistryError("Snapshots directory must be docs/snapshots.")
    return target


def canonical_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def audit_snapshots(registry: dict[str, Any], errors: list[str], ok: list[str]) -> None:
    directory = snapshots_dir(registry)
    if not directory.exists():
        ok.append("Snapshot directory has not been created yet")
        return
    count = 0
    for path in sorted(directory.glob("*.json")):
        count += 1
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            errors.append(f"Invalid snapshot JSON {path.relative_to(ROOT)}: {exc}")
            continue
        state = payload.get("state") if isinstance(payload, dict) else None
        meta = payload.get("snapshot") if isinstance(payload, dict) else None
        if not isinstance(state, dict) or not isinstance(meta, dict):
            errors.append(f"Snapshot missing snapshot/state objects: {path.relative_to(ROOT)}")
            continue
        expected_hash = hashlib.sha256(canonical_json(state).encode("utf-8")).hexdigest()
        if meta.get("state_sha256") != expected_hash:
            errors.append(f"Snapshot integrity hash mismatch: {path.relative_to(ROOT)}")
    if count:
        ok.append(f"Validated {count} committed snapshot file(s)")


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
    if nested_get(registry, ("governance", "snapshots_are_immutable")) is not True:
        errors.append("governance.snapshots_are_immutable must be true")
    else:
        ok.append("Snapshots are marked immutable")

    documentation = registry.get("documentation", {})
    doc_paths: list[tuple[str, str]] = []
    if isinstance(documentation, dict):
        generated_keys = set(ALLOWED_GENERATED_TARGETS) | {"scope", "snapshots_dir"}
        for key, value in documentation.items():
            if key in generated_keys:
                continue
            if isinstance(value, str) and ("/" in value or value.endswith((".json", ".md", ".py"))):
                doc_paths.append((f"documentation.{key}", value))
    try:
        generated_targets(registry)
        snapshots_dir(registry)
        ok.append("Generated documentation and snapshot targets are guarded")
    except RegistryError as exc:
        errors.append(str(exc))
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
    audit_snapshots(registry, errors, ok)

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
        "# Austin Daily Briefing — Internal Project Status", "",
        "> Generated from `PROJECT_STATE.json`. Do not edit this generated document directly.", "",
        f"- Schema version: `{registry['schema_version']}`",
        f"- Registry version: `{registry['registry_version']}`",
        f"- Last reviewed: `{registry['last_reviewed']}`",
        f"- Production status: **{prod.get('status', 'unknown')}**",
        f"- Public site: {project.get('public_site', '')}", "",
        "## Production data", "",
        f"- Subscriber database: {prod['subscriber_database']['title']} (`{prod['subscriber_database']['file_id']}`)",
        f"- Intake database: {prod['intake_database']['title']} (`{prod['intake_database']['file_id']}`)",
        "", "## Services", "",
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
    lines.extend(["", "Secret and private configuration values are intentionally excluded from the registry and generated documentation.", ""])
    return "\n".join(lines)


def render_architecture(registry: dict[str, Any]) -> str:
    services = registry["services"]
    prod = registry["environments"]["production"]
    dev = registry["environments"]["development"]
    lines = [
        "# Austin Daily Briefing — Architecture", "",
        "> Generated from `PROJECT_STATE.json`. Do not edit this generated document directly.", "",
        "## System overview", "",
        "Austin Daily Briefing uses Google Sheets and Google Apps Script as its operational control plane, Resend for outbound email delivery, Cloudflare Email Routing for replies, and GitHub Pages for the public website.", "",
        "## Environments", "",
        f"- **Production** — {prod.get('status', 'unknown')} — Drive folder `{prod.get('drive_folder_id', '')}`",
        f"- **Development** — {dev.get('status', 'unknown')} — Drive folder `{dev.get('drive_folder_id', '')}`", "",
        "## Production data stores", "",
        f"- Subscriber database: {prod['subscriber_database']['title']} (`{prod['subscriber_database']['file_id']}`)",
        f"- Intake database: {prod['intake_database']['title']} (`{prod['intake_database']['file_id']}`)", "",
        "## Services and boundaries", "",
    ]
    for name, config in services.items():
        provider = config.get("provider") or config.get("platform") or "not recorded"
        source = config.get("source_path") or config.get("workflow_path")
        detail = f"; source `{source}`" if source else ""
        lines.append(f"- **{name}** — {config.get('status', 'unknown')} — {provider}{detail}")
    lines.extend([
        "", "## Delivery path", "",
        "1. Subscriber and preference state is maintained in the production Google Sheets control plane.",
        "2. Editorial generation creates delivery records for eligible profiles.",
        "3. Google Apps Script dispatchers deliver queued messages through Resend.",
        "4. Replies sent to `briefing@austindailybriefing.com` are routed by Cloudflare Email Routing to the externally configured monitored destination.",
        "5. The public website is deployed from `site/` to GitHub Pages at `austindailybriefing.com`.",
        "", "## Documentation control", "",
        "`PROJECT_STATE.json` is authoritative for technical project state. Generated status, architecture, and operations documents are derived from that registry. `CHANGELOG.md` remains human-authored.", "",
    ])
    return "\n".join(lines)


def render_operations(registry: dict[str, Any]) -> str:
    automation = registry["automation"]
    props = registry.get("runtime_properties", [])
    governance = registry.get("governance", {})
    lines = [
        "# Austin Daily Briefing — Operations", "",
        "> Generated from `PROJECT_STATE.json`. Do not edit this generated document directly.", "",
        "## Routine automation", "",
    ]
    for name, config in automation.items():
        fn = config.get("function")
        extra = f" — `{fn}`" if fn else ""
        lines.append(f"- **{name}** — {config.get('status', 'unknown')} — {config.get('cadence', 'cadence not recorded')}{extra}")
    lines.extend(["", "## Runtime configuration", ""])
    for item in props:
        lines.append(f"- `{item['name']}` — {item.get('sensitivity', 'config')} — {item.get('purpose', '')}")
    lines.extend([
        "",
        "No runtime property values belong in this repository. Secret and private configuration values remain in their external runtime stores.",
        "", "## Documentation maintenance", "",
        "- `python scripts/docs_sync.py status` — display authoritative state.",
        "- `python scripts/docs_sync.py audit` — validate registry, references, and snapshot integrity.",
        "- `python scripts/docs_sync.py preview` — preview all generated internal documentation.",
        "- `python scripts/docs_sync.py update` — audit and regenerate the generated internal documentation set.",
        "- `python scripts/docs_sync.py snapshot --reason \"...\"` — create an immutable point-in-time registry capture before or after a material production change.",
        "", "## Change-control rules", "",
    ])
    for item in governance.get("changelog_required_for", []):
        lines.append(f"- Changelog entry required: {item}.")
    lines.extend(["", "The same material-change classes require a registry snapshot. Existing snapshots must never be edited or deleted.", ""])
    return "\n".join(lines)


def render_documents(registry: dict[str, Any]) -> dict[str, str]:
    return {
        "generated_status": render_project_status(registry),
        "generated_architecture": render_architecture(registry),
        "generated_operations": render_operations(registry),
    }


def preview(registry: dict[str, Any]) -> int:
    targets = generated_targets(registry)
    rendered = render_documents(registry)
    for key in ALLOWED_GENERATED_TARGETS:
        target = targets[key]
        print(f"\n=== Preview target: {target.relative_to(ROOT)} ===")
        if target.exists() and target.read_text(encoding="utf-8") == rendered[key]:
            print("No change: generated content matches the current file.")
        else:
            print(rendered[key])
    print("\nNo files were modified.")
    return 0


def update(registry: dict[str, Any]) -> int:
    if audit(registry, quiet=True) != 0:
        raise RegistryError("Audit failed; generated documentation was not modified.")
    targets = generated_targets(registry)
    rendered = render_documents(registry)
    changed = 0
    for key in ALLOWED_GENERATED_TARGETS:
        target = targets[key]
        content = rendered[key]
        if target.exists() and target.read_text(encoding="utf-8") == content:
            print(f"No change: {target.relative_to(ROOT)} is current.")
            continue
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content, encoding="utf-8")
        print(f"Updated {target.relative_to(ROOT)} from PROJECT_STATE.json.")
        changed += 1
    print(f"Generated documentation changes: {changed}")
    return 0


def snapshot(registry: dict[str, Any], reason: str | None) -> int:
    if audit(registry, quiet=True) != 0:
        raise RegistryError("Audit failed; snapshot was not created.")
    directory = snapshots_dir(registry)
    directory.mkdir(parents=True, exist_ok=True)
    timezone_name = nested_get(registry, ("project", "operating_timezone")) or "UTC"
    now = datetime.now(ZoneInfo(timezone_name))
    stamp = now.strftime("%Y-%m-%dT%H%M%S%z")
    registry_version = str(registry.get("registry_version", "unknown"))
    safe_version = "".join(ch if ch.isalnum() or ch in ".-_" else "-" for ch in registry_version)
    filename = f"{stamp}__registry-{safe_version}.json"
    target = directory / filename
    if target.exists():
        raise RegistryError(f"Snapshot already exists and will not be overwritten: {target.relative_to(ROOT)}")
    state_hash = hashlib.sha256(canonical_json(registry).encode("utf-8")).hexdigest()
    payload = {
        "snapshot": {
            "snapshot_version": "1.0",
            "created_at": now.isoformat(),
            "operating_timezone": timezone_name,
            "registry_version": registry_version,
            "schema_version": registry.get("schema_version"),
            "reason": reason or "manual",
            "source": "PROJECT_STATE.json",
            "state_sha256": state_hash,
            "immutable": True,
        },
        "state": registry,
    }
    target.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Created immutable snapshot: {target.relative_to(ROOT)}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    for name in ("status", "audit", "preview", "update"):
        sub.add_parser(name)
    snap = sub.add_parser("snapshot")
    snap.add_argument("--reason", default=None, help="Why this point-in-time snapshot is being created")
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
        if args.command == "snapshot":
            return snapshot(registry, args.reason)
        raise RegistryError(f"Unsupported command: {args.command}")
    except RegistryError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())

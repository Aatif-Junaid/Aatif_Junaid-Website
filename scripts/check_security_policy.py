#!/usr/bin/env python3
"""Fail when repository security controls drift from the documented baseline."""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REQUIRED = (
    ".github/workflows/security-scan.yml",
    ".githooks/pre-commit",
    "AGENTS.md",
    "CLAUDE.md",
    "docs/security/README.md",
    "docs/security/audit-monitoring.md",
    "scripts/security_scan.ps1",
)
SENSITIVE_NAMES = {
    ".env",
    ".netrc",
    ".npmrc",
    ".pypirc",
    "credentials",
    "secrets",
}
SENSITIVE_SUFFIXES = {
    ".age",
    ".jks",
    ".kdbx",
    ".key",
    ".p12",
    ".pem",
    ".pfx",
    ".ppk",
    ".tfstate",
}
REMOTE_ACTION = re.compile(r"^\s*uses:\s*([^./\s][^\s]*)@([^\s#]+)", re.MULTILINE)
FULL_SHA = re.compile(r"^[0-9a-f]{40}$")


def tracked_files() -> list[str]:
    result = subprocess.run(
        ["git", "ls-files", "--cached", "--others", "--exclude-standard"],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return [line for line in result.stdout.splitlines() if line]


def main() -> int:
    failures: list[str] = []

    for relative in REQUIRED:
        if not (ROOT / relative).is_file():
            failures.append(f"missing security control: {relative}")

    for relative in tracked_files():
        path = Path(relative)
        lowered_parts = {part.lower() for part in path.parts}
        if path.name.lower() in SENSITIVE_NAMES or path.suffix.lower() in SENSITIVE_SUFFIXES:
            failures.append(f"credential-bearing file type is tracked: {relative}")
        if lowered_parts & {".aws", ".azure", ".kube", ".ssh", ".terraform"}:
            failures.append(f"credential or infrastructure state directory is tracked: {relative}")

    workflow_dir = ROOT / ".github" / "workflows"
    for workflow in sorted(workflow_dir.glob("*.y*ml")):
        body = workflow.read_text(encoding="utf-8")
        if "pull_request_target:" in body:
            failures.append(f"{workflow.name}: pull_request_target is prohibited")
        if re.search(r"^permissions:\s*write-all\s*$", body, re.MULTILINE):
            failures.append(f"{workflow.name}: write-all permissions are prohibited")
        if not re.search(r"^permissions:\s*(?:\{\}|read-all|$)", body, re.MULTILINE):
            failures.append(f"{workflow.name}: top-level permissions must be explicit")
        for action, reference in REMOTE_ACTION.findall(body):
            if not FULL_SHA.fullmatch(reference):
                failures.append(f"{workflow.name}: {action} is not pinned to a full commit SHA")

    if failures:
        print("\nSecurity policy checks failed:")
        for failure in failures:
            print(f"  FAIL  {failure}")
        return 1

    print("\nSecurity policy checks passed: streamlined controls, tracked files, and workflows.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

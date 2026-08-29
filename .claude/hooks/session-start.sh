#!/bin/bash
# SessionStart hook: install PowerShell 7 so `pwsh -File scripts/check.ps1`
# works in Claude Code on the web. The container is ephemeral, so this runs
# on each remote session start. Idempotent and non-interactive.
set -euo pipefail

# Remote (web) sessions only. Locally, developers install pwsh themselves.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Already present (e.g. resume/clear on a warm container): nothing to do.
if command -v pwsh >/dev/null 2>&1; then
  echo "pwsh already installed: $(pwsh --version)"
  exit 0
fi

# Only Debian/Ubuntu x86_64 is supported by this hook's install path.
if [ "$(uname -m)" != "x86_64" ] || ! command -v dpkg >/dev/null 2>&1; then
  echo "session-start: unsupported platform for pwsh auto-install; skipping" >&2
  exit 0
fi

SUDO=""
if [ "$(id -u)" -ne 0 ]; then
  SUDO="sudo"
fi

# github.com is blocked by the web egress policy, but packages.microsoft.com
# is reachable, so pull the official Ubuntu 24.04 .deb from there.
PS_VERSION="7.6.5"
DEB="powershell_${PS_VERSION}-1.deb_amd64.deb"
URL="https://packages.microsoft.com/ubuntu/24.04/prod/pool/main/p/powershell/${DEB}"
PS_SHA256="dd683d29a5c95ed43e426f4fe1679469d8b89e78ea955455f6238a0b0e6f1a24"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "session-start: downloading PowerShell ${PS_VERSION}..."
curl -fsSL --retry 3 --retry-delay 2 --max-time 300 -o "$TMP/$DEB" "$URL"
echo "${PS_SHA256}  $TMP/$DEB" | sha256sum --check --status || {
  echo "session-start: PowerShell package checksum mismatch" >&2
  exit 1
}

echo "session-start: installing PowerShell..."
# Base image already carries pwsh's runtime deps; fall back to apt if not.
$SUDO dpkg -i "$TMP/$DEB" || $SUDO apt-get install -f -y

pwsh --version

#!/bin/bash
# SessionStart hook: install PowerShell 7 so `pwsh -File scripts/check.ps1`
# works in Claude Code on the web. The container is ephemeral, so this runs
# on each remote session start. Idempotent and non-interactive.
set -uo pipefail

# Remote (web) sessions only. Locally, developers install pwsh themselves.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Already present (e.g. resume/clear on a warm container): skip reinstall,
# but keep going into the later stages below.
if command -v pwsh >/dev/null 2>&1; then
  echo "pwsh already installed: $(pwsh --version)"
else

  # Only Debian/Ubuntu x86_64 is supported by this hook's install path.
  if [ "$(uname -m)" != "x86_64" ] || ! command -v dpkg >/dev/null 2>&1; then
    echo "session-start: unsupported platform for pwsh auto-install; skipping" >&2
  else
    SUDO=""
    if [ "$(id -u)" -ne 0 ]; then
      SUDO="sudo"
    fi

    # github.com is blocked by the web egress policy, but packages.microsoft.com
    # is reachable, so pull the official Ubuntu 24.04 .deb from there.
    PS_VERSION="7.6.5"
    DEB="powershell_${PS_VERSION}-1.deb_amd64.deb"
    URL="https://packages.microsoft.com/ubuntu/24.04/prod/pool/main/p/powershell/${DEB}"
    TMP="$(mktemp -d)"

    echo "session-start: downloading PowerShell ${PS_VERSION}..."
    if curl -fsSL --retry 3 --retry-delay 2 --max-time 300 -o "$TMP/$DEB" "$URL"; then
      echo "session-start: installing PowerShell..."
      # Base image already carries pwsh's runtime deps; fall back to apt if not.
      $SUDO dpkg -i "$TMP/$DEB" 2>&1 || $SUDO apt-get install -f -y
      command -v pwsh >/dev/null 2>&1 && pwsh --version
    else
      echo "session-start: pwsh download failed; skipping" >&2
    fi
    rm -rf "$TMP"
  fi
fi

# --- TruffleHog -------------------------------------------------------------
# Needed for scripts/security_scan.ps1's pre-push secret scan.
if command -v trufflehog >/dev/null 2>&1; then
  echo "session-start: trufflehog already installed"
elif ! command -v go >/dev/null 2>&1; then
  echo "session-start: go toolchain not found; skipping trufflehog install" >&2
else
  # `go install` refuses this module directly: its go.mod carries `replace`
  # directives, which Go only honors for the main module. Work around it by
  # downloading the module source through the Go module proxy (reachable
  # here, unlike GitHub releases, TruffleHog's normal distribution channel)
  # and building it as a standalone main module instead.
  TH_VERSION="v3.97.1"
  TH_TMP="$(mktemp -d)"

  echo "session-start: fetching TruffleHog ${TH_VERSION} via Go module proxy..."
  ZIP_PATH="$(GOFLAGS=-mod=mod go mod download -x -json "github.com/trufflesecurity/trufflehog/v3@${TH_VERSION}" 2>/dev/null \
    | sed -n 's/.*"Zip": "\(.*\)",\{0,1\}$/\1/p')"

  if [ -z "$ZIP_PATH" ] || [ ! -f "$ZIP_PATH" ]; then
    echo "session-start: trufflehog module download failed; skipping" >&2
  else
    python3 - "$ZIP_PATH" "$TH_TMP" "$TH_VERSION" <<'PY'
import sys, zipfile, os
zip_path, dest, version = sys.argv[1], sys.argv[2], sys.argv[3]
prefix = f"github.com/trufflesecurity/trufflehog/v3@{version}/"
z = zipfile.ZipFile(zip_path)
for m in z.namelist():
    if not m.startswith(prefix):
        continue
    rel = m[len(prefix):]
    if not rel:
        continue
    p = os.path.join(dest, rel)
    if m.endswith("/"):
        os.makedirs(p, exist_ok=True)
        continue
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with z.open(m) as src, open(p, "wb") as out:
        out.write(src.read())
PY

    if [ ! -f "$TH_TMP/main.go" ]; then
      echo "session-start: trufflehog source extraction failed; skipping" >&2
    else
      echo "session-start: building trufflehog (this takes a couple of minutes)..."
      BIN_DIR="/usr/local/bin"
      if [ ! -w "$BIN_DIR" ] && [ "$(id -u)" -ne 0 ]; then
        BIN_DIR="$HOME/.local/bin"
        mkdir -p "$BIN_DIR"
      fi
      if (cd "$TH_TMP" && GOFLAGS=-mod=mod CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o "$BIN_DIR/trufflehog" .); then
        echo "session-start: trufflehog installed to $BIN_DIR/trufflehog"
      else
        echo "session-start: trufflehog build failed; skipping" >&2
      fi
    fi
  fi
  rm -rf "$TH_TMP"
fi

# --- Claude Code plugins ------------------------------------------------
# Review/lint/security plugins used on this repo. Both marketplace add and
# plugin install are already idempotent no-ops when already present.
if ! command -v claude >/dev/null 2>&1; then
  echo "session-start: claude CLI not found; skipping plugin install" >&2
else
  for m in \
    "composio-community/awesome-claude-plugins" \
    "0xmariowu/AgentLint" \
    "Onome-AJ/security-sweep-plugin"
  do
    claude plugin marketplace add "$m" >/dev/null 2>&1 \
      || echo "session-start: failed to add marketplace $m" >&2
  done

  for p in \
    "pr-review@awesome-claude-plugins" \
    "code-review@awesome-claude-plugins" \
    "security-guidance@awesome-claude-plugins" \
    "changelog-generator@awesome-claude-plugins" \
    "agent-lint@agent-lint" \
    "security-sweep@security-sweep-marketplace"
  do
    claude plugin install "$p" >/dev/null 2>&1 \
      || echo "session-start: failed to install plugin $p" >&2
  done
  echo "session-start: plugin provisioning complete"
fi

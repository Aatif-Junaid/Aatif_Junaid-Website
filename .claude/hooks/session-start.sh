#!/bin/sh
# Session-start hook for Claude remote sessions.
# Runs only when CLAUDE_CODE_REMOTE=true (ephemeral containers).
# Installs TruffleHog (used by pre-commit) and registers the Chrome DevTools MCP.
# Third-party Claude plugin installation has been removed: those marketplace
# sources are unaffiliated GitHub accounts with no version pins or checksums,
# which creates a supply-chain risk on every session. Only tools with a clear,
# verifiable purpose are provisioned here.

set -eu

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# --- TruffleHog -------------------------------------------------------------
# Needed for scripts/security_scan.ps1 pre-commit secret scan.
if command -v trufflehog > /dev/null 2>&1; then
  echo "session-start: trufflehog already installed"
elif ! command -v go > /dev/null 2>&1; then
  echo "session-start: go toolchain not found; skipping trufflehog install" >&2
else
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

# --- Chrome DevTools MCP ---------------------------------------------------
# For QA of this site (console errors, network, Lighthouse). Only registered
# when Playwright Chromium is present and the MCP server is not already set.
if ! command -v claude > /dev/null 2>&1; then
  echo "session-start: claude CLI not found; skipping MCP registration" >&2
elif claude mcp get chrome-devtools > /dev/null 2>&1; then
  echo "session-start: chrome-devtools MCP already registered"
elif [ -x /opt/pw-browsers/chromium ]; then
  MCP_VERSION="1.8.0"
  claude mcp add chrome-devtools --scope user -- \
    npx -y "chrome-devtools-mcp@${MCP_VERSION}" \
    --executablePath=/opt/pw-browsers/chromium \
    --headless \
    --chromeArg=--no-sandbox \
    --chromeArg=--disable-setuid-sandbox \
    > /dev/null 2>&1 \
    && echo "session-start: chrome-devtools MCP registered" \
    || echo "session-start: failed to add chrome-devtools MCP server" >&2
else
  echo "session-start: /opt/pw-browsers/chromium not found; skipping chrome-devtools MCP" >&2
fi

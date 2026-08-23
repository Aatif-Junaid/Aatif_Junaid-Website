#!/usr/bin/env python3
"""Static checks for aatifmulla.me. Standard library only, no dependencies.

Run locally:   python scripts/check_site.py
Exit code 0 = all checks pass, 1 = at least one failure.
Guards the regressions this site has actually hit: stale cache-busters,
broken internal refs, em dashes in copy, missing noopener, secret leaks.
Public financial metrics are allowed when verified and intentionally surfaced.
"""
import json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = ["index.html", "case-studies.html", "field-program.html", "404.html"]
REQUIRED_SCRIPTS = {
    "index.html": {"assets/js/site.js"},
    "case-studies.html": {"assets/js/site.js", "assets/js/case-studies.js"},
    "field-program.html": {"assets/js/site.js"},
    "404.html": {"assets/js/site.js"},
}
failures, notes = [], []

def fail(msg): failures.append(msg)
def ok(msg): notes.append(msg)

def read(p):
    with open(os.path.join(ROOT, p), encoding="utf-8") as f:
        return f.read()

pages = {p: read(p) for p in PAGES if os.path.exists(os.path.join(ROOT, p))}
for p in PAGES:
    if p not in pages: fail(f"{p}: missing")

# 1. Structure ---------------------------------------------------------------
for p, s in pages.items():
    for tag in ["html","head","body","main","header","footer","section","ul","ol","li",
                "div","p","a","h1","h2","h3","article","aside","figure","nav","noscript"]:
        o = len(re.findall(r"<" + tag + r"[\s>]", s)); c = len(re.findall(r"</" + tag + r">", s))
        if o != c: fail(f"{p}: <{tag}> unbalanced (open={o} close={c})")
    if len(re.findall(r"<h1\b", s)) != 1: fail(f"{p}: expected exactly one <h1>")
    if not s.lstrip().lower().startswith("<!doctype html>"): fail(f"{p}: missing doctype")
    required = [('lang="', "lang"), ("charset=", "charset"),
                ("viewport", "viewport"), ("<title>", "title")]
    if p != "404.html":                    # a noindex error page must not self-canonicalise
        required.append(('rel="canonical"', "canonical"))
    for needle, label in required:
        if needle not in s: fail(f"{p}: missing {label}")
    ids = re.findall(r'\bid="([^"]+)"', s)
    dupes = {i for i in ids if ids.count(i) > 1}
    if dupes: fail(f"{p}: duplicate ids {sorted(dupes)}")
    bad = {a for a in re.findall(r'href="#([^"]+)"', s) if a and a not in ids}
    if bad: fail(f"{p}: anchors with no target {sorted(bad)}")
ok(f"structure checked on {len(pages)} pages")

# 2. Internal references resolve ---------------------------------------------
for p, s in pages.items():
    for u in set(re.findall(r'(?:src|href)="([^"]+)"', s)):
        if u.startswith(("http", "mailto:", "tel:", "#", "data:", "//")) or u == "/":
            continue
        target = u.split("?")[0].split("#")[0].lstrip("/")
        if target in ("", "index.html"):   # "/" and "/#anchor" are the homepage
            continue
        if not os.path.isfile(os.path.join(ROOT, target)):
            fail(f"{p}: reference not found -> {u}")
ok("internal references resolve")

# 3. Shared script ownership --------------------------------------------------
for p, required_scripts in REQUIRED_SCRIPTS.items():
    if p not in pages:
        continue
    referenced = {
        u.split("?")[0].lstrip("/")
        for u in re.findall(r'<script[^>]+src=["\']([^"\']+)["\']', pages[p])
    }
    missing = required_scripts - referenced
    if missing:
        fail(f"{p}: missing required scripts {sorted(missing)}")
ok("shared and page-specific scripts are referenced")

# 4. External link safety -----------------------------------------------------
for p, s in pages.items():
    for a in re.findall(r"<a\b[^>]*>", s):
        if 'target="_blank"' in a and "noopener" not in a:
            fail(f"{p}: target=_blank without rel=noopener -> {a[:80]}")
ok("external links use noopener")

# 5. Cache-buster consistency -------------------------------------------------
css_versions = set()
for s in pages.values():
    css_versions.update(re.findall(r"assets/css/site\.css\?v=(\d+)", s))
if len(css_versions) != 1:
    fail(f"site.css cache-buster missing or inconsistent: {sorted(css_versions)}")
else:
    ok(f"site.css cache-buster consistent (v={next(iter(css_versions))})")

script_versions = {}
for s in pages.values():
    for name, version in re.findall(r"assets/js/([a-z-]+\.js)\?v=(\d+)", s):
        script_versions.setdefault(name, set()).add(version)
for name, versions in script_versions.items():
    if len(versions) != 1:
        fail(f"{name} cache-buster differs across pages: {sorted(versions)}")
if script_versions:
    ok("JavaScript cache-busters are consistent")

resume_versions = set()
for s in pages.values():
    resume_versions.update(re.findall(r"resume\.pdf\?v=([^\"']+)", s))
if len(resume_versions) > 1:
    fail(f"resume.pdf cache-buster differs across pages: {sorted(resume_versions)}")
elif resume_versions:
    ok(f"resume.pdf cache-buster consistent (v={next(iter(resume_versions))})")

# 6. House copy rules ---------------------------------------------------------
for p, s in pages.items():
    text = re.sub(r"<(script|style)\b[^>]*>.*?</\1>", " ", s, flags=re.S | re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    if "\u2014" in text: fail(f"{p}: em dash found in copy (house rule: none)")
    for w in ["delve","unlock","unleash","elevate","transform","tapestry",
              "beacon","game-chang","superpower","skyrocket","synergy"]:
        if w in text.lower(): fail(f"{p}: buzzword '{w}' in copy")
ok("copy rules pass (no em dashes, no buzzwords)")

# 7. JSON-LD validity ---------------------------------------------------------
datetime_pattern = re.compile(
    r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$"
)

def check_structured_dates(value, page):
    if isinstance(value, dict):
        for key, child in value.items():
            if key in {"dateCreated", "datePublished", "dateModified"}:
                if not isinstance(child, str) or not datetime_pattern.fullmatch(child):
                    fail(f"{page}: {key} must be an ISO 8601 datetime with timezone")
            else:
                check_structured_dates(child, page)
    elif isinstance(value, list):
        for child in value:
            check_structured_dates(child, page)

for p, s in pages.items():
    for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', s, re.S):
        try:
            data = json.loads(block)
            check_structured_dates(data, p)
        except Exception as e: fail(f"{p}: invalid JSON-LD ({e})")
ok("JSON-LD parses and structured dates use ISO 8601 datetimes")

# 8. Secret hygiene -----------------------------------------------------------
SECRETS = [
    (r"(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}", "GitHub token"),
    (r"github_pat_[A-Za-z0-9_]{20,}", "GitHub fine-grained PAT"),
    (r"AKIA[0-9A-Z]{16}", "AWS access key"),
    (r"-----BEGIN [A-Z ]*PRIVATE KEY-----", "private key"),
    (r"sk-[A-Za-z0-9]{32,}", "OpenAI-style key"),
    (r"xox[baprs]-[A-Za-z0-9-]{10,}", "Slack token"),
]
for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d not in {".git", "node_modules", ".claude", "Fable5"}]
    for fn in filenames:
        if not fn.endswith((".html", ".css", ".js", ".json", ".md", ".xml", ".yml", ".yaml", ".txt")):
            continue
        fp = os.path.join(dirpath, fn)
        try: body = open(fp, encoding="utf-8", errors="ignore").read()
        except OSError: continue
        for pat, label in SECRETS:
            if re.search(pat, body):
                fail(f"{os.path.relpath(fp, ROOT)}: possible {label} committed")
ok("no high-confidence secrets detected")

# 9. Repository documentation links ------------------------------------------
markdown_link = re.compile(r"\[[^\]]+\]\(([^)]+)\)")
for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d != ".git"]
    for fn in filenames:
        if not fn.endswith(".md"):
            continue
        path = os.path.join(dirpath, fn)
        for line_number, line in enumerate(open(path, encoding="utf-8"), 1):
            for raw_target in markdown_link.findall(line):
                target = raw_target.split("#", 1)[0]
                if not target or target.startswith(("http://", "https://", "mailto:")):
                    continue
                resolved = os.path.normpath(os.path.join(dirpath, target))
                if not os.path.exists(resolved):
                    fail(f"{os.path.relpath(path, ROOT)}:{line_number}: broken link -> {raw_target}")
ok("repository Markdown links resolve")

# 10. Tracked-state hygiene ---------------------------------------------------
tracked = subprocess.run(
    ["git", "ls-files", "--cached", "--others", "--exclude-standard"],
    cwd=ROOT,
    check=True,
    capture_output=True,
    text=True,
).stdout.splitlines()
for relative in tracked:
    if not os.path.isfile(os.path.join(ROOT, relative)):
        continue
    parts = set(relative.replace("\\", "/").split("/"))
    if parts & {".DS_Store", ".idea", ".pytest_cache", ".venv", ".vscode", "__pycache__", "node_modules"}:
        fail(f"local or generated path is tracked: {relative}")
    if relative.endswith((".log", ".pyc", ".tmp")):
        fail(f"generated file is tracked: {relative}")
ok("tracked files exclude generated and local state")

# 11. Deploy-critical files ---------------------------------------------------
for f in [
    "CNAME",
    "sitemap.xml",
    "resume.pdf",
    "og-image.jpg",
    "assets/css/site.css",
    "assets/js/site.js",
    "assets/js/case-studies.js",
]:
    if not os.path.isfile(os.path.join(ROOT, f)): fail(f"missing deploy-critical file: {f}")
cname = read("CNAME").strip() if os.path.isfile(os.path.join(ROOT, "CNAME")) else ""
if cname != "aatifmulla.me": fail(f"CNAME changed: {cname!r} (expected 'aatifmulla.me')")
ok("deploy-critical files present, CNAME intact")

# Report ----------------------------------------------------------------------
for n in notes: print(f"  PASS  {n}")
if failures:
    print()
    for f_ in failures: print(f"  FAIL  {f_}")
    print(f"\n{len(failures)} check(s) failed.")
    sys.exit(1)
print(f"\nAll {len(notes)} check groups passed.")

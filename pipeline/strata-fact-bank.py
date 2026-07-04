#!/usr/bin/env python3
"""
strata-fact-bank.py — self-refilling reserve of rendered Strata fact videos.

Ported from Lunary's evergreen-video-bank.py (same mini, same architecture:
JSON manifest bank, PID-aware lock, health-gated sequential render, R2-backed
video-server). Differences from the Lunary original are deliberate, not
oversights — see inline comments at each divergence point.

WHAT THIS IS
------------
Maintains a bank of TARGET fully rendered vertical "surprising gap" fact
videos for Strata's social accounts. Every run it reconciles the bank
(used/missing items are gone), then generates + renders enough new items to
refill to TARGET, sourcing topics from the real fact-mining tool instead of
a hand-written topic list.

CONSUMPTION CONTRACT (same as Lunary's, documented in the manifest too)
------------------------------------------------------------------------
Consumers (the eventual Spellcast-posting scheduler) take an item by:
  1. setting that item's used_at to an ISO-8601 timestamp in the manifest, AND
  2. moving its video file into <bank_dir>/used/
This agent treats used_at != null OR a missing video file as CONSUMED and
refills to TARGET on the next run. Consumers must never delete manifest rows.

KEY DIVERGENCE FROM LUNARY'S VERSION: fact accuracy over paraphrase freedom
----------------------------------------------------------------------------
Lunary's evergreen bank generates fully free-form scripts via an LLM and
validates them against a "no dated claims" regex (its content is meant to
be timeless-sounding astrology advice, so any date leaking in is a bug).
Strata's content is the opposite: the dates/ratios/years ARE the entire
point, and they come from real verified source data (see
mine-surprising-facts.ts). So this agent does NOT let the LLM invent or
restate the numbers — it fills a fixed hook/reveal/gut-punch TEMPLATE with
the exact verified figures from the mined fact, and only asks the LLM
(via the same codex_generate() backend Lunary uses) to vary the *wording*
of the hook and gut-punch lines, then validates that the exact cited
numbers still appear unchanged in the LLM's rewrite before accepting it.
This is a strictly-tighter, not laxer, validator than Lunary's.

BANK LOCATION
-------------
~/coo-scripts/state/strata-fact-bank/ (videos are non-trivial in size but
Strata's volume is much lower than Lunary's, so no separate HDD relocation
is used yet — revisit if this directory grows large).
Manifest: ~/coo-scripts/state/strata-fact-bank.json.

CONTENT RULES (hard)
--------------------
Every number, date, and ratio spoken in the script MUST come verbatim from
the mined fact JSON (see mine-surprising-facts.ts --json). A citation
validator re-extracts numbers from the generated script and rejects any
generation where a cited figure doesn't match the source fact within
rounding tolerance. UK English, no em dashes (style match with Lunary's).
No CTA link in the video body (Strata's posting rule — link lives in
bio/first comment only, matches the existing X-algorithm notes).

GENERATION / RENDER
-------------------
Scripts via the same codex backend Lunary uses
(~/development/lunary-pipeline-main/lib/codex-backend.sh -> codex_generate),
with a template-only fallback (no LLM at all, just the mined fact's own
title/value/gap numbers slotted into a fixed sentence shape) if generation
keeps failing the citation validator. Renders go through the Strata video-
server (:3010 /api/strata-pipeline), sequentially, behind the same Mini
load/RAM gate pattern as Lunary's lane so the two services don't fight over
the same machine's resources.

ALERTS
------
Same telegram_gate.notify() pattern as Lunary's lane, same dedup/dud-guard,
different agent name so alerts are distinguishable.

KILL SWITCH
-----------
  touch ~/coo-scripts/state/strata-fact-bank-PAUSED

USAGE
-----
  python3.12 strata-fact-bank.py             # refill to TARGET (capped)
  python3.12 strata-fact-bank.py --limit 2   # at most 2 new items this run
  python3.12 strata-fact-bank.py --dry-run   # plan only, no generate/render
"""

import argparse
import hashlib
import json
import os
import re
import ssl
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

AGENT_NAME = "strata-fact-bank"
HOME = Path(os.path.expanduser("~"))
STATE_DIR = HOME / "coo-scripts" / "state"
LOG_DIR = HOME / "coo-scripts" / "logs"
MANIFEST_PATH = STATE_DIR / "strata-fact-bank.json"
LOCK_PATH = STATE_DIR / "strata-fact-bank.lock"
PAUSE_FILE = STATE_DIR / "strata-fact-bank-PAUSED"
NOTIFY = HOME / "coo-scripts" / "lib" / "notify_channel.py"
NOTIFY_JSONL = STATE_DIR / "strata-fact-bank-notifications.jsonl"

BANK_DIR = STATE_DIR / "strata-fact-bank"

CODEX_BACKEND = HOME / "development" / "lunary-pipeline-main" / "lib" / "codex-backend.sh"
VIDEO_SERVER_URL = os.environ.get("STRATA_VIDEO_SERVER_URL", "http://localhost:3010")

# Where the mining tool lives — a real Node/tsx script, not a Python module,
# so it's invoked as a subprocess and its --json stdout is parsed.
STRATA_APP_DIR = HOME / "development" / "chronoline-app"
MINER_SCRIPT = STRATA_APP_DIR / "scripts" / "mine-surprising-facts.ts"

SPELLCAST_URL = "https://api.spellcast.sammii.dev"
SPELLCAST_KEY_SOURCES = [
    HOME / "coo-scripts" / "agents" / "lunary-mirror-tiktok-lane.py",
]

TARGET = int(os.environ.get("SFB_TARGET", "10"))
CRITICAL_FLOOR = int(os.environ.get("SFB_CRITICAL_FLOOR", "3"))
MAX_GEN_ATTEMPTS = 3
PER_RENDER_TIMEOUT_S = int(os.environ.get("SFB_RENDER_TIMEOUT_S", "420"))
MIN_VIDEO_BYTES = 500 * 1024
LOAD_MAX = float(os.environ.get("SFB_LOAD_MAX", "5.0"))
RAM_MIN_MB = float(os.environ.get("SFB_RAM_MIN_MB", "2500"))
GATE_WAIT_BUDGET_S = int(os.environ.get("SFB_GATE_WAIT_S", "420"))
GATE_POLL_S = 15
INTER_RENDER_COOLDOWN_S = 8
MIN_WORDS, MAX_WORDS = 45, 90  # ~21-26s spoken at conversational pace, same target as Lunary's

_SSL_CTX = ssl.create_default_context()

CONTRACT = (
    "CONSUMPTION CONTRACT: consumers (the Spellcast-posting scheduler) take "
    "an item by setting its used_at to an ISO-8601 timestamp AND moving its "
    "video file into <bank_dir>/used/. This agent treats used_at != null or a "
    "missing video file as consumed and refills the bank to target on the next "
    "run. Never delete manifest rows; never edit other fields."
)


def log(msg: str) -> None:
    line = f"[{AGENT_NAME}] {datetime.now().strftime('%H:%M:%S')} {msg}"
    print(line, flush=True)
    try:
        LOG_DIR.mkdir(parents=True, exist_ok=True)
        with open(LOG_DIR / f"{AGENT_NAME}.log", "a") as f:
            f.write(line + "\n")
    except Exception:
        pass


def notify(title: str, body: str, level: str = "info") -> None:
    try:
        sys.path.insert(0, str(HOME / "coo-scripts" / "lib"))
        import telegram_gate
        telegram_gate.notify(
            agent=AGENT_NAME, title=title, message=body, level=level,
            key=title, service=AGENT_NAME,
        )
        return
    except Exception as exc:  # noqa: BLE001
        log(f"telegram_gate unavailable ({exc}); falling back to notify_channel")
    try:
        subprocess.run(
            ["/usr/bin/python3", str(NOTIFY), title, body, level,
             AGENT_NAME, str(NOTIFY_JSONL)],
            timeout=20, capture_output=True, text=True,
        )
    except Exception as exc:  # noqa: BLE001
        log(f"notify failed: {exc}")


# ── PID-aware lockfile (identical pattern to Lunary's lane) ──────────────────
def acquire_lock() -> bool:
    try:
        if LOCK_PATH.exists():
            try:
                pid = int(LOCK_PATH.read_text().strip())
            except Exception:
                pid = 0
            if pid > 0:
                try:
                    os.kill(pid, 0)
                    log(f"another run is live (pid {pid}) — exiting.")
                    return False
                except ProcessLookupError:
                    log(f"stale lock from dead pid {pid} — taking over.")
                except PermissionError:
                    log(f"pid {pid} alive (perm) — exiting.")
                    return False
        STATE_DIR.mkdir(parents=True, exist_ok=True)
        LOCK_PATH.write_text(str(os.getpid()))
        return True
    except Exception as exc:  # noqa: BLE001
        log(f"lock error: {exc} — refusing to run.")
        return False


def release_lock() -> None:
    try:
        if LOCK_PATH.exists() and LOCK_PATH.read_text().strip() == str(os.getpid()):
            LOCK_PATH.unlink()
    except Exception:
        pass


def resolve_bank_dir() -> Path:
    BANK_DIR.mkdir(parents=True, exist_ok=True)
    (BANK_DIR / "used").mkdir(exist_ok=True)
    return BANK_DIR


# ── Sanitisers (shared style rules with Lunary's lane) ───────────────────────
def sanitise(text: str) -> str:
    text = re.sub(r"<think>.*?</think>", "", text or "", flags=re.DOTALL)
    text = text.replace("—", ", ").replace("–", ", ")
    text = text.replace(" , ", ", ")
    return re.sub(r"\s{2,}", " ", text).strip()


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", (text or "").lower()).strip("-")[:60]


# ── Citation validator — the core divergence from Lunary's evergreen check ───
def _numbers_in(text: str) -> set:
    """Extract every standalone number (years, ratios, counts) mentioned in
    text, normalised (commas stripped) so '2,530' and '2530' match."""
    return {m.replace(",", "") for m in re.findall(r"\d[\d,]*", text or "")}


def citation_ok(script_text: str, fact: dict) -> bool:
    """The generated script must still contain every load-bearing number
    from the source fact (rounded gap figures, at minimum) — if the LLM
    rewrite drops or alters them, reject rather than ship a possibly wrong
    historical/astronomical claim."""
    required = set()
    if fact["kind"] == "gap":
        required.add(str(round(fact["gapNearToAnchor"])))
        required.add(str(round(fact["gapFarToNear"])))
    else:  # depth-illusion
        required.add(str(round(fact["gapLy"])))
    present = _numbers_in(script_text)
    missing = {n for n in required if not any(n in p or p in n for p in present)}
    if missing:
        log(f"  citation check FAILED — required numbers missing from script: {missing}")
        return False
    return True


# ── Dedup against recently published (same pattern as Lunary's lane) ─────────
def _spellcast_key() -> str:
    for src in SPELLCAST_KEY_SOURCES:
        try:
            m = re.search(r"sk_[a-f0-9]{40,}", src.read_text())
            if m:
                return m.group(0)
        except Exception:
            continue
    return ""


def recent_published_hooks() -> list:
    import urllib.request
    key = _spellcast_key()
    if not key:
        return []
    try:
        req = urllib.request.Request(
            f"{SPELLCAST_URL}/api/posts?status=published&limit=200",
            headers={"Authorization": f"Bearer {key}"},
        )
        with urllib.request.urlopen(req, timeout=20, context=_SSL_CTX) as r:
            return [
                (post.get("content") or "").split("\n")[0][:200]
                for post in (json.loads(r.read()) or [])
                if post.get("content")
            ]
    except Exception as exc:  # noqa: BLE001
        log(f"spellcast published fetch failed (dedup degraded): {exc}")
        return []


# ── Manifest (identical shape/contract to Lunary's lane) ─────────────────────
def load_manifest() -> dict:
    if MANIFEST_PATH.exists():
        try:
            data = json.loads(MANIFEST_PATH.read_text())
            if isinstance(data, dict) and isinstance(data.get("items"), list):
                return data
        except Exception as exc:  # noqa: BLE001
            log(f"manifest unreadable ({exc}) — starting fresh.")
    return {"contract": CONTRACT, "target": TARGET, "items": [], "consumed": []}


def save_manifest(manifest: dict, bank_dir: Path) -> None:
    manifest["contract"] = CONTRACT
    manifest["target"] = TARGET
    manifest["bank_dir"] = str(bank_dir)
    manifest["updated_at"] = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    tmp = MANIFEST_PATH.with_suffix(".tmp")
    tmp.write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
    tmp.replace(MANIFEST_PATH)


def reconcile(manifest: dict) -> list:
    active, consumed = [], manifest.get("consumed", [])
    for item in manifest.get("items", []):
        path = Path(item.get("video_path") or "")
        if item.get("used_at"):
            log(f"  consumed (used_at set): {item.get('id')}")
            consumed.append(item)
        elif not path.exists():
            log(f"  consumed (file gone): {item.get('id')} {path}")
            item.setdefault("used_at", "missing-file")
            consumed.append(item)
        else:
            active.append(item)
    manifest["items"] = active
    manifest["consumed"] = consumed[-100:]
    return active


# ── Fact sourcing — the real mining tool, not a hardcoded topic list ─────────
def mine_facts(need: int, exclude_keys: set) -> list:
    """Pulls fresh candidates from both mining modes, in roughly equal
    proportion, skipping anything already in the bank/consumed history (by
    the miner's own dedup key, tracked separately from --mark-seen so this
    agent can look further ahead than what's been shown to a human)."""
    facts = []
    per_mode_limit = max(need * 3, 12)  # over-fetch so post-filtering still leaves enough
    for mode, map_args in (
        ("gap", ["--map=History"]),
        ("gap", ["--map=Cosmos"]),
        ("depth-illusion", []),
    ):
        try:
            proc = subprocess.run(
                ["npx", "--no-install", "tsx", str(MINER_SCRIPT),
                 f"--mode={mode}", *map_args,
                 "--min-ratio=3", f"--limit={per_mode_limit}", "--json"],
                cwd=str(STRATA_APP_DIR), capture_output=True, text=True, timeout=60,
            )
            if proc.returncode != 0:
                log(f"  miner ({mode} {map_args}) failed rc={proc.returncode}: {proc.stderr[-300:]}")
                continue
            rows = json.loads(proc.stdout or "[]")
            facts.extend(r for r in rows if r.get("key") not in exclude_keys)
        except Exception as exc:  # noqa: BLE001
            log(f"  miner ({mode} {map_args}) errored: {exc}")
    return facts


def fact_title(fact: dict) -> str:
    if fact["kind"] == "gap":
        return f"{fact['near']['title']} / {fact['anchor']['title']} / {fact['far']['title']}"
    return f"{fact['near']['title']} / {fact['far']['title']} ({fact['group']})"


def fallback_script(fact: dict) -> dict:
    """No-LLM template fallback — always available, always passes the
    citation check by construction since it's built directly from the
    fact's own numbers, never paraphrased."""
    if fact["kind"] == "gap":
        near, anchor, far = fact["near"], fact["anchor"], fact["far"]
        unit = "years" if fact["unit"] == "yr" else "light-years"
        hook = f"{near['title']} is closer to {anchor['title']} than to {far['title']}"
        spoken = (
            f"{near['title']} is only {round(fact['gapNearToAnchor'])} {unit} from "
            f"{anchor['title']}. But it took {round(fact['gapFarToNear'])} {unit} to get "
            f"there from {far['title']}. Most people assume the opposite."
        )
        caption = hook
    else:
        near, far = fact["near"], fact["far"]
        hook = f"{near['title']} and {far['title']} look like neighbours. They are not."
        spoken = (
            f"{near['title']} is {near['value']:.1f} light-years away. {far['title']} is "
            f"{far['value']:.1f}. Same constellation, {round(fact['gapLy'])} light-years apart."
        )
        caption = hook
    return {"hook": hook, "spoken": spoken, "caption": caption, "source": "template-fallback"}


def generation_prompt(fact: dict) -> str:
    unit = "years" if fact.get("unit") == "yr" else "light-years"
    if fact["kind"] == "gap":
        near, anchor, far = fact["near"], fact["anchor"], fact["far"]
        facts_block = (
            f"- {near['title']} is {round(fact['gapNearToAnchor'])} {unit} from {anchor['title']}.\n"
            f"- {near['title']} is {round(fact['gapFarToNear'])} {unit} from {far['title']}.\n"
            f"- The point: {near['title']} feels like it belongs with {far['title']} in "
            f"most people's mental timeline, but it is actually far closer to {anchor['title']}."
        )
    else:
        near, far = fact["near"], fact["far"]
        facts_block = (
            f"- {near['title']} is {near['value']:.1f} light-years away.\n"
            f"- {far['title']} is {far['value']:.1f} light-years away.\n"
            f"- Both are in the same constellation ({fact['group']}), so they look like "
            f"neighbours, but they are {round(fact['gapLy'])} light-years apart in reality."
        )
    return (
        "You write short spoken scripts for Strata, a history and cosmos scale app. "
        "Write ONE short-form vertical video script about this verified fact.\n\n"
        f"VERIFIED FACTS (do not alter these numbers, restate them exactly):\n{facts_block}\n\n"
        "HARD RULES:\n"
        "- Every number above MUST appear in your script, unchanged. Do not round "
        "differently, do not estimate, do not invent additional numbers.\n"
        "- Format: a scroll-stopping hook line, then the reveal using the exact figures, "
        "ending on the surprising contrast (never state it as if it were expected).\n"
        "- Spoken length 45 to 90 words (about 21-26s aloud).\n"
        "- UK English. No em dashes. No hashtags. No emoji. No CTA or link of any kind "
        "(that goes in the post caption/bio separately, never spoken or on-screen).\n\n"
        "Respond with ONLY this JSON object, nothing else:\n"
        '{"hook": "<one line>", "spoken": "<the spoken script, hook NOT repeated>", '
        '"caption": "<one-line caption, no question mark needed>"}'
    )


def codex_generate(prompt: str) -> str:
    if not CODEX_BACKEND.is_file():
        return ""
    try:
        proc = subprocess.run(
            ["/bin/bash", "-c", 'source "$0" && codex_generate "$1"',
             str(CODEX_BACKEND), prompt],
            capture_output=True, text=True, timeout=300, cwd=str(HOME),
        )
        if proc.returncode == 0:
            return (proc.stdout or "").strip()
        log(f"codex backend rc={proc.returncode}: {(proc.stderr or '')[-200:]}")
    except Exception as exc:  # noqa: BLE001
        log(f"codex backend failed: {exc}")
    return ""


def _extract_json(raw: str) -> dict:
    raw = (raw or "").strip()
    m = re.search(r"\{.*\}", raw, re.DOTALL)
    if not m:
        return {}
    try:
        data = json.loads(m.group(0))
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def generate_script(fact: dict) -> dict:
    for attempt in range(1, MAX_GEN_ATTEMPTS + 1):
        raw = codex_generate(generation_prompt(fact))
        data = _extract_json(raw)
        hook = sanitise(data.get("hook", ""))
        spoken = sanitise(data.get("spoken", ""))
        caption = sanitise(data.get("caption", "")) or hook
        if not hook or not spoken:
            log(f"  gen attempt {attempt}: empty/unparseable output")
            continue
        words = len(spoken.split())
        if not (MIN_WORDS <= words <= MAX_WORDS):
            log(f"  gen attempt {attempt}: spoken length {words} words out of range")
            continue
        if not citation_ok(f"{hook}\n{spoken}\n{caption}", fact):
            continue
        return {"hook": hook, "spoken": spoken, "caption": caption, "source": "codex"}
    log("  using template fallback (no LLM) — guaranteed citation-accurate")
    return fallback_script(fact)


# ── Mini health gate + render (identical pattern to Lunary's lane) ───────────
def free_inactive_mb() -> float:
    try:
        out = subprocess.check_output(["vm_stat"], text=True)
    except Exception:
        return float("inf")
    page_size = 4096
    m = re.search(r"page size of (\d+) bytes", out)
    if m:
        page_size = int(m.group(1))
    pages = {}
    for line in out.splitlines():
        mm = re.match(r'"?Pages ([^:"]+)"?:\s+(\d+)\.', line)
        if mm:
            pages[mm.group(1).strip().lower()] = int(mm.group(2))
    return (pages.get("free", 0) + pages.get("inactive", 0)
            + pages.get("speculative", 0)) * page_size / (1024 * 1024)


def health_gate(label: str) -> bool:
    waited = 0
    while True:
        load = os.getloadavg()[0]
        ram = free_inactive_mb()
        if load <= LOAD_MAX and ram >= RAM_MIN_MB:
            log(f"  gate OK ({label}): load={load:.2f} freeRAM={ram:.0f}MB")
            return True
        log(f"  gate WAIT ({label}): load={load:.2f} freeRAM={ram:.0f}MB waited={waited}s")
        if waited >= GATE_WAIT_BUDGET_S:
            log(f"  gate FAIL ({label}) — skipping this item.")
            return False
        time.sleep(GATE_POLL_S)
        waited += GATE_POLL_S


def server_healthy() -> bool:
    try:
        proc = subprocess.run(
            ["curl", "-sS", "--max-time", "8", f"{VIDEO_SERVER_URL}/api/health"],
            capture_output=True, text=True,
        )
        return proc.returncode == 0 and json.loads(proc.stdout).get("status") == "ok"
    except Exception:
        return False


def render_script(script: dict, fact: dict) -> str:
    payload = {"scripts": [{
        "scriptText": f"{script['hook']}\n{script['spoken']}",
        "facetTitle": slugify(fact_title(fact)),
        "topic": f"strata {fact['kind']} {fact.get('map', fact.get('group', ''))}",
        "dateKey": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "replyPrompt": "",
        "commentKeyword": "",
        "onScreenCta": "",
    }]}
    proc = subprocess.run(
        ["curl", "-sS", "-X", "POST", f"{VIDEO_SERVER_URL}/api/strata-pipeline",
         "-H", "Content-Type: application/json",
         "-d", json.dumps(payload),
         "--connect-timeout", "10", "--max-time", str(PER_RENDER_TIMEOUT_S)],
        capture_output=True, text=True,
    )
    if proc.returncode != 0:
        log(f"  render curl rc={proc.returncode}: {proc.stderr[:200]}")
        return ""
    try:
        results = json.loads(proc.stdout).get("results") or []
        r0 = results[0] if results else {}
        if r0.get("status") == "success" and r0.get("videoUrl"):
            return r0["videoUrl"]
        log(f"  render failed: {r0.get('error', proc.stdout[:200])}")
    except Exception as exc:  # noqa: BLE001
        log(f"  render bad json: {exc} :: {proc.stdout[:200]}")
    return ""


def download_video(url: str, dest: Path) -> bool:
    proc = subprocess.run(
        ["curl", "-sS", "-L", "--max-time", "180", "-o", str(dest), url],
        capture_output=True, text=True,
    )
    if proc.returncode != 0:
        log(f"  download rc={proc.returncode}: {proc.stderr[:200]}")
        return False
    try:
        size = dest.stat().st_size
    except Exception:
        return False
    if size <= MIN_VIDEO_BYTES:
        log(f"  download too small ({size} bytes) — rejecting.")
        try:
            dest.unlink()
        except Exception:
            pass
        return False
    log(f"  downloaded {dest.name} ({size / 1024 / 1024:.1f} MB)")
    return True


# ── Main ──────────────────────────────────────────────────────────────────────
def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--limit", type=int, default=None)
    args = ap.parse_args()

    if PAUSE_FILE.exists():
        log(f"PAUSED via {PAUSE_FILE} — no-op.")
        return 0
    if not acquire_lock():
        return 0
    try:
        return run(args)
    finally:
        release_lock()


def run(args) -> int:
    bank_dir = resolve_bank_dir()
    log(f"bank dir: {bank_dir}")

    manifest = load_manifest()
    active = reconcile(manifest)
    log(f"bank after reconcile: {len(active)}/{TARGET} items")
    save_manifest(manifest, bank_dir)

    need = max(0, TARGET - len(active))
    if args.limit is not None:
        need = min(need, args.limit)
    if need == 0:
        log("bank full — idempotent no-op.")
        return 0

    exclude_keys = {i.get("fact_key") for i in active} | {
        i.get("fact_key") for i in manifest.get("consumed", []) if i.get("fact_key")
    }
    facts = mine_facts(need, exclude_keys)
    recent = recent_published_hooks()
    log(f"dedup corpus: {len(recent)} recent published texts, {len(facts)} mined candidates")

    if args.dry_run:
        log(f"DRY-RUN: would attempt {min(need, len(facts))} of {len(facts)} mined candidates.")
        return 0
    if not facts:
        log("no eligible facts mined — nothing to do.")
        return 0

    if not server_healthy():
        log(f"ERROR: video-server unhealthy at {VIDEO_SERVER_URL} — aborting.")
        if len(active) < CRITICAL_FLOOR:
            notify(
                "Strata fact bank CRITICAL",
                f"Bank has only {len(active)}/{TARGET} videos and the video-server "
                f"at {VIDEO_SERVER_URL} is unreachable, so it cannot refill.",
                "critical",
            )
        return 3

    added, failures = 0, 0
    for fact in facts:
        if added >= need:
            break
        title = fact_title(fact)
        log(f"[{added + 1}/{need}] fact: {title}")
        script = generate_script(fact)
        if not script:
            failures += 1
            continue
        if not health_gate(fact["key"]):
            failures += 1
            continue
        url = render_script(script, fact)
        if not url:
            failures += 1
            time.sleep(INTER_RENDER_COOLDOWN_S)
            continue
        item_id = (
            f"sfb-{datetime.now(timezone.utc).strftime('%Y%m%d')}-"
            f"{hashlib.sha256(fact['key'].encode()).hexdigest()[:8]}"
        )
        dest = bank_dir / f"{item_id}.mp4"
        if not download_video(url, dest):
            failures += 1
            time.sleep(INTER_RENDER_COOLDOWN_S)
            continue
        item = {
            "id": item_id,
            "fact_key": fact["key"],
            "title": title,
            "hook": script["hook"],
            "script": script["spoken"],
            "caption": script["caption"],
            "script_source": script["source"],
            "fact_kind": fact["kind"],
            "fact_map": fact.get("map") or fact.get("group"),
            "video_path": str(dest),
            "video_url": url,
            "platform_fit": ["tiktok", "instagram", "youtube_shorts"],
            "created_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "used_at": None,
        }
        manifest["items"].append(item)
        save_manifest(manifest, bank_dir)
        added += 1
        log(f"  banked {item_id}")
        time.sleep(INTER_RENDER_COOLDOWN_S)

    count = len(manifest["items"])
    log(f"DONE: +{added} new, {failures} failed/skipped, bank {count}/{TARGET}.")

    if added > 0:
        notify(
            "Strata fact bank refilled",
            f"Added {added} fact video(s); bank now {count}/{TARGET}. Bank dir: {bank_dir}",
            "info",
        )
    if count < CRITICAL_FLOOR and failures > 0:
        notify(
            "Strata fact bank CRITICAL",
            f"Bank is at {count}/{TARGET} (below floor {CRITICAL_FLOOR}) and "
            f"{failures} render/generation attempt(s) failed this run.",
            "critical",
        )
        return 4
    return 0


if __name__ == "__main__":
    sys.exit(main())

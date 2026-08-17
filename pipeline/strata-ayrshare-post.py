#!/usr/bin/env python3.12
"""
Post a Strata short-form video (or text) to social platforms via Ayrshare.

Scoped to STRATA only — deliberately separate from Lunary's Spellcast lane so
nothing here can touch the Lunary posting pipeline.

Ayrshare posts to whatever social accounts are linked in the Ayrshare dashboard
under the API key below. TikTok first; Instagram / Threads can be added to
--platforms once you've linked them there.

AUTH: reads the Ayrshare API key from (first that exists):
    - env AYRSHARE_API_KEY
    - ~/development/lunary-shared.env   (line: AYRSHARE_API_KEY=...)
Never pass the key on the command line (it would leak into shell history).

USAGE
    # dry run — builds and prints the exact request, posts nothing
    strata-ayrshare-post.py --video-url https://cdn.../orion.mp4 \
        --caption "Two stars in Orion look side by side..." --platforms tiktok --dry-run

    # real post (video)
    strata-ayrshare-post.py --video-url https://cdn.../orion.mp4 \
        --caption-file caption.txt --platforms tiktok

    # multiple platforms once linked
    strata-ayrshare-post.py --video-url ... --caption "..." --platforms tiktok,instagram,threads

TIKTOK NOTE
    Ayrshare is an approved TikTok partner, but whether a post goes LIVE or lands
    as a DRAFT in the TikTok app's inbox depends on the account's posting
    permissions in the Ayrshare dashboard (privacy level / direct-post approval).
    The API response's per-platform status says which happened — this script
    prints it. Verify the first post actually appears (or appears as a draft) in
    the TikTok app before scheduling a volume of them.
"""
import argparse
import json
import os
import sys
import urllib.request
import urllib.error

AYRSHARE_POST_URL = "https://api.ayrshare.com/api/post"
SHARED_ENV = os.path.expanduser("~/development/lunary-shared.env")


def load_api_key() -> str:
    key = os.environ.get("AYRSHARE_API_KEY", "").strip()
    if key:
        return key
    if os.path.exists(SHARED_ENV):
        with open(SHARED_ENV) as f:
            for line in f:
                line = line.strip()
                if line.startswith("AYRSHARE_API_KEY="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    sys.exit(
        "ERROR: no Ayrshare API key. Add it to ~/development/lunary-shared.env as\n"
        "  AYRSHARE_API_KEY=<your key>\n"
        "or export AYRSHARE_API_KEY before running."
    )


def build_payload(caption: str, platforms: list[str], video_url: str | None) -> dict:
    payload: dict = {"post": caption, "platforms": platforms}
    if video_url:
        payload["mediaUrls"] = [video_url]
        # TikTok: title falls back to the post text; keep the video as-is.
        payload["isVideo"] = True
    return payload


def post(payload: dict, api_key: str) -> dict:
    body = json.dumps(payload).encode()
    req = urllib.request.Request(
        AYRSHARE_POST_URL,
        data=body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            return {"_httpError": e.code, **json.loads(raw)}
        except Exception:
            return {"_httpError": e.code, "_raw": raw}


def main() -> None:
    ap = argparse.ArgumentParser(description="Post a Strata video/text via Ayrshare")
    ap.add_argument("--video-url", help="Public URL of the rendered .mp4 (e.g. the pipeline's R2 videoUrl)")
    ap.add_argument("--caption", help="Caption text")
    ap.add_argument("--caption-file", help="Read caption from a file instead of --caption")
    ap.add_argument("--platforms", default="tiktok", help="Comma-separated: tiktok,instagram,threads,...")
    ap.add_argument("--dry-run", action="store_true", help="Print the request and exit; post nothing")
    args = ap.parse_args()

    if args.caption_file:
        with open(args.caption_file) as f:
            caption = f.read().strip()
    elif args.caption:
        caption = args.caption
    else:
        sys.exit("ERROR: provide --caption or --caption-file")

    platforms = [p.strip() for p in args.platforms.split(",") if p.strip()]
    if not platforms:
        sys.exit("ERROR: no platforms")

    payload = build_payload(caption, platforms, args.video_url)

    if args.dry_run:
        print("DRY RUN — would POST to Ayrshare:")
        print(json.dumps(payload, indent=2, ensure_ascii=False))
        return

    api_key = load_api_key()
    result = post(payload, api_key)

    print(json.dumps(result, indent=2, ensure_ascii=False))
    status = result.get("status")
    if status == "success" or (result.get("postIds") and not result.get("_httpError")):
        print("\nPOSTED. Per-platform result:")
        for p in result.get("postIds", []):
            print(f"  {p.get('platform')}: {p.get('status', 'ok')}  id={p.get('id', '?')}  url={p.get('postUrl', '')}")
        print("\nCheck the TikTok app to confirm it's live (or a draft in your inbox).")
    else:
        print("\nPOST DID NOT SUCCEED — see the JSON above for the error.", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

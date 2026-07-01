#!/usr/bin/env python3
"""Minimal App Store Connect API helper (draft-level operations for Strata).

Auth: builds an ES256 JWT from the fastlane API key JSON at
  ~/.appstoreconnect/fastlane_api_key.json  (key_id, issuer_id, key=PEM contents)

Usage:
  asc_api.py get   /v1/apps?filter[bundleId]=com.sammii.chronoline
  asc_api.py post  /v1/inAppPurchases '<json body>'
  asc_api.py patch /v1/... '<json body>'

Prints HTTP status + JSON. No writes unless you use post/patch/delete.
"""
import json, os, sys, time, urllib.request, urllib.error
import jwt  # PyJWT

KEY_JSON = os.path.expanduser(os.environ.get("ASC_KEY_JSON", "~/.appstoreconnect/fastlane_api_key.json"))
BASE = "https://api.appstoreconnect.apple.com"

def token():
    d = json.load(open(KEY_JSON))
    key_id = d["key_id"]; issuer = d["issuer_id"]; pem = d["key"]
    now = int(time.time())
    payload = {"iss": issuer, "iat": now, "exp": now + 20 * 60, "aud": "appstoreconnect-v1"}
    return jwt.encode(payload, pem, algorithm="ES256", headers={"kid": key_id, "typ": "JWT"})

def call(method, path, body=None):
    url = path if path.startswith("http") else BASE + path
    data = None
    headers = {"Authorization": "Bearer " + token(), "Content-Type": "application/json"}
    if body is not None:
        data = body.encode() if isinstance(body, str) else json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            raw = r.read().decode()
            return r.status, (json.loads(raw) if raw else {})
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try: parsed = json.loads(raw)
        except Exception: parsed = raw
        return e.code, parsed

if __name__ == "__main__":
    method = sys.argv[1].upper()
    path = sys.argv[2]
    body = sys.argv[3] if len(sys.argv) > 3 else None
    status, out = call(method, path, body)
    print("HTTP", status)
    print(json.dumps(out, indent=2))

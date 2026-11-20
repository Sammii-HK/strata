#!/usr/bin/env python3
"""Strata freemium (v1.1): create the pack in-app purchases, price them, and
set the app itself to Free, via the App Store Connect REST API.

Reads ~/.appstoreconnect/AuthKey_<KEY_ID>.p8 (same key as quickcut's
docs/asc-create-iaps.py). Idempotent: existing IAPs, localisations and price
schedules are detected and skipped, so it is safe to re-run.

What it does
  1. Finds the app by bundle id (app.lunary.strata).
  2. For each pack: create a NON_CONSUMABLE IAP if missing, add the en-GB
     localisation (display name + description) if missing, and set a price
     schedule with GBR as the base territory at the tier price, using Apple's
     price points (the equalised price in every other storefront follows).
  3. Sets the app's own price schedule to Free (price point 0) unless
     --keep-app-price is passed.

Usage
  python3 store/asc-strata-freemium.py            # everything
  python3 store/asc-strata-freemium.py --dry-run  # show, change nothing
  python3 store/asc-strata-freemium.py --keep-app-price

Prices are the decision of 17 Sep 2026: small packs 1.99, big packs 2.99,
Complete 9.99. The review screenshot for each IAP (required before
submission) still has to be uploaded in App Store Connect by hand.
"""
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

import jwt

BUNDLE_ID = "app.lunary.strata"
KEY_ID = os.environ.get("APP_STORE_CONNECT_API_KEY_ID", "GMGDL7Q7NA")
ISSUER = os.environ.get("APP_STORE_CONNECT_API_KEY_ISSUER_ID", "7c17ab57-29f9-4083-9839-ea15adf32cc5")
KEY_PATH = os.path.expanduser(f"~/.appstoreconnect/AuthKey_{KEY_ID}.p8")
API = "https://api.appstoreconnect.apple.com"
DRY = "--dry-run" in sys.argv
KEEP_APP_PRICE = "--keep-app-price" in sys.argv

# product id suffix, reference name, en-GB display name, description, GBP price
PACKS = [
    ("history", "History", "History", "All of human history on one zoomable map.", "2.99"),
    ("evolution", "Evolution Pack", "Evolution", "Four billion years of life, first cells to us.", "2.99"),
    ("mythologies", "Mythologies Pack", "Mythologies", "Gods, heroes and myths, placed in time.", "1.99"),
    ("balladry", "Balladry Pack", "Balladry", "Traditional ballads and motifs across the centuries.", "1.99"),
    ("bestiary", "Bestiary Pack", "Bestiary", "Legendary creatures and where they come from.", "1.99"),
    ("blazon", "Blazon Pack", "Blazon", "Heraldry, its terms and design history, in time.", "1.99"),
    ("geode", "Geode Pack", "Geode", "Minerals, gems and the deep time that made them.", "1.99"),
    ("complete", "Strata Complete", "Strata Complete", "Every pack, now and in future. One unlock, forever.", "9.99"),
]


def token() -> str:
    with open(KEY_PATH) as f:
        key = f.read()
    now = int(time.time())
    return jwt.encode({"iss": ISSUER, "iat": now, "exp": now + 1200, "aud": "appstoreconnect-v1"}, key, algorithm="ES256", headers={"alg": "ES256", "kid": KEY_ID, "typ": "JWT"})


TOK = None


def request(method: str, path: str, body=None) -> dict:
    global TOK
    TOK = TOK or token()
    data = json.dumps(body).encode() if body is not None else None
    hdrs = {"Authorization": f"Bearer {TOK}"}
    if data is not None:
        hdrs["Content-Type"] = "application/json"
    if DRY and method != "GET":
        print(f"  [dry-run] {method} {path} {json.dumps(body)[:160]}")
        return {"data": {"id": "dry"}}
    req = urllib.request.Request(API + path, data=data, headers=hdrs, method=method)
    try:
        resp = urllib.request.urlopen(req).read()
        return json.loads(resp) if resp else {}
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"{method} {path} -> {e.code}\n{e.read().decode()[:1200]}") from None


def get_all(path: str) -> list:
    out, url = [], path
    while url:
        r = request("GET", url)
        out.extend(r.get("data", []))
        nxt = r.get("links", {}).get("next")
        url = nxt.replace(API, "") if nxt else None
    return out


def find_app_id() -> str:
    q = urllib.parse.urlencode({"filter[bundleId]": BUNDLE_ID})
    apps = request("GET", f"/v1/apps?{q}").get("data", [])
    if not apps:
        raise SystemExit(f"No ASC app for {BUNDLE_ID}")
    return apps[0]["id"]


def find_iap(app_id: str, product_id: str):
    q = urllib.parse.urlencode({"filter[productId]": product_id, "limit": 200})
    for p in request("GET", f"/v1/apps/{app_id}/inAppPurchasesV2?{q}").get("data", []):
        if p["attributes"].get("productId") == product_id:
            return p["id"], p["attributes"].get("state")
    return None, None


def create_iap(app_id: str, product_id: str, ref_name: str) -> str:
    body = {"data": {"type": "inAppPurchases", "attributes": {"name": ref_name, "productId": product_id, "inAppPurchaseType": "NON_CONSUMABLE", "familySharable": False}, "relationships": {"app": {"data": {"type": "apps", "id": app_id}}}}}
    return request("POST", "/v2/inAppPurchases", body)["data"]["id"]


def ensure_localisation(iap_id: str, name: str, description: str) -> None:
    existing = request("GET", f"/v2/inAppPurchases/{iap_id}/inAppPurchaseLocalizations").get("data", [])
    if any(l["attributes"].get("locale") == "en-GB" for l in existing):
        print("    localisation en-GB exists")
        return
    body = {"data": {"type": "inAppPurchaseLocalizations", "attributes": {"locale": "en-GB", "name": name, "description": description}, "relationships": {"inAppPurchaseV2": {"data": {"type": "inAppPurchases", "id": iap_id}}}}}
    request("POST", "/v1/inAppPurchaseLocalizations", body)
    print("    localisation en-GB created")


def iap_price_point(iap_id: str, gbp: str) -> str:
    q = urllib.parse.urlencode({"filter[territory]": "GBR", "limit": 200})
    for pp in get_all(f"/v2/inAppPurchases/{iap_id}/pricePoints?{q}"):
        if pp["attributes"].get("customerPrice") == gbp:
            return pp["id"]
    raise RuntimeError(f"No GBR price point at {gbp} for {iap_id}")


def ensure_iap_price(iap_id: str, gbp: str) -> None:
    try:
        sched = request("GET", f"/v2/inAppPurchases/{iap_id}/iapPriceSchedule?include=manualPrices&limit[manualPrices]=50")
        for inc in sched.get("included", []):
            if inc["type"] == "inAppPurchasePrices" and inc["attributes"].get("startDate") is None:
                # price point id embeds the price; fetch it to compare
                pp_id = inc["relationships"]["inAppPurchasePricePoint"]["data"]["id"]
                pp = request("GET", f"/v2/inAppPurchasePricePoints/{pp_id}")
                if pp["data"]["attributes"].get("customerPrice") == gbp:
                    print(f"    price already {gbp}")
                    return
    except RuntimeError as e:
        if "404" not in str(e):
            raise
    pp_id = iap_price_point(iap_id, gbp)
    body = {
        "data": {
            "type": "inAppPurchasePriceSchedules",
            "relationships": {
                "inAppPurchase": {"data": {"type": "inAppPurchases", "id": iap_id}},
                "baseTerritory": {"data": {"type": "territories", "id": "GBR"}},
                "manualPrices": {"data": [{"type": "inAppPurchasePrices", "id": "${p1}"}]},
            },
        },
        "included": [{"type": "inAppPurchasePrices", "id": "${p1}", "attributes": {"startDate": None}, "relationships": {"inAppPurchasePricePoint": {"data": {"type": "inAppPurchasePricePoints", "id": pp_id}}}}],
    }
    request("POST", "/v1/inAppPurchasePriceSchedules", body)
    print(f"    price set to GBP {gbp} (GBR base, equalised elsewhere)")


def app_price_point_free(app_id: str) -> str:
    q = urllib.parse.urlencode({"filter[territory]": "GBR", "limit": 200})
    for pp in get_all(f"/v1/apps/{app_id}/appPricePoints?{q}"):
        if pp["attributes"].get("customerPrice") in ("0", "0.0", "0.00"):
            return pp["id"]
    raise RuntimeError("No free app price point found")


def ensure_app_free(app_id: str) -> None:
    try:
        cur = request("GET", f"/v1/apps/{app_id}/appPriceSchedule/manualPrices?include=appPricePoint&limit=50")
        for inc in cur.get("included", []):
            if inc["type"] == "appPricePoints" and inc["attributes"].get("customerPrice") in ("0", "0.0", "0.00"):
                print("  app already Free")
                return
        for inc in cur.get("included", []):
            if inc["type"] == "appPricePoints":
                print(f"  current app price GBP {inc['attributes'].get('customerPrice')}")
    except RuntimeError as e:
        if "404" not in str(e):
            raise
    pp_id = app_price_point_free(app_id)
    body = {
        "data": {
            "type": "appPriceSchedules",
            "relationships": {
                "app": {"data": {"type": "apps", "id": app_id}},
                "baseTerritory": {"data": {"type": "territories", "id": "GBR"}},
                "manualPrices": {"data": [{"type": "appPrices", "id": "${ap1}"}]},
            },
        },
        "included": [{"type": "appPrices", "id": "${ap1}", "attributes": {"startDate": None}, "relationships": {"appPricePoint": {"data": {"type": "appPricePoints", "id": pp_id}}}}],
    }
    request("POST", "/v1/appPriceSchedules", body)
    print("  app price set to Free")


def main() -> None:
    app_id = find_app_id()
    print(f"Auth ok. App {BUNDLE_ID} = {app_id}{' (dry run)' if DRY else ''}")
    for suffix, ref, name, desc, gbp in PACKS:
        pid = f"{BUNDLE_ID}.{suffix}"
        iap_id, state = find_iap(app_id, pid)
        if iap_id:
            print(f"  {pid}: exists ({state})")
        else:
            iap_id = create_iap(app_id, pid, ref)
            print(f"  {pid}: created {iap_id}")
        if DRY and iap_id == "dry":
            continue
        ensure_localisation(iap_id, name, desc)
        ensure_iap_price(iap_id, gbp)
    if KEEP_APP_PRICE:
        print("  app price left unchanged (--keep-app-price)")
    else:
        ensure_app_free(app_id)
    print("Done. Still manual in App Store Connect: one review screenshot per IAP, then submit the IAPs with the v1.1 build.")


if __name__ == "__main__":
    main()

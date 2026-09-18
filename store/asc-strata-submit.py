#!/usr/bin/env python3
"""Strata v1.1 submission helper (App Store Connect REST API).

Steps, each idempotent and runnable on its own:
  screenshots  upload one review screenshot per pack IAP (Apple requires it)
  build        attach the given build number to the 1.1.0 App Store version
  submit       create a review submission holding the version + every IAP and submit it

  python3 store/asc-strata-submit.py screenshots store/screenshots/raw/maps-menu.png
  python3 store/asc-strata-submit.py build 4
  python3 store/asc-strata-submit.py submit
"""
import hashlib
import os
import sys
import urllib.parse
import urllib.request

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "scripts"))
from asc_api import call  # noqa: E402

BUNDLE_ID = "app.lunary.strata"
VERSION = "1.1.0"
PACKS = ["history", "evolution", "mythologies", "balladry", "bestiary", "blazon", "geode", "complete"]


def ok(status, out, what):
    if status >= 300:
        raise SystemExit(f"{what} -> {status}\n{out}")
    return out


def app_id():
    q = urllib.parse.urlencode({"filter[bundleId]": BUNDLE_ID})
    return ok(*call("GET", f"/v1/apps?{q}"), "find app")["data"][0]["id"]


def iaps(app):
    out = ok(*call("GET", f"/v1/apps/{app}/inAppPurchasesV2?limit=200"), "list iaps")["data"]
    return {p["attributes"]["productId"]: (p["id"], p["attributes"].get("state")) for p in out}


def upload_screenshot(iap_id, path):
    st, cur = call("GET", f"/v2/inAppPurchases/{iap_id}/appStoreReviewScreenshot")
    if st == 200 and cur.get("data"):
        state = cur["data"]["attributes"].get("assetDeliveryState", {}).get("state")
        if state in ("COMPLETE", "UPLOAD_COMPLETE"):
            print("    review screenshot already present", state)
            return
        call("DELETE", f"/v1/inAppPurchaseAppStoreReviewScreenshots/{cur['data']['id']}")
    data = open(path, "rb").read()
    body = {"data": {"type": "inAppPurchaseAppStoreReviewScreenshots", "attributes": {"fileName": os.path.basename(path), "fileSize": len(data)}, "relationships": {"inAppPurchaseV2": {"data": {"type": "inAppPurchases", "id": iap_id}}}}}
    res = ok(*call("POST", "/v1/inAppPurchaseAppStoreReviewScreenshots", body), "reserve screenshot")["data"]
    for op in res["attributes"]["uploadOperations"]:
        chunk = data[op["offset"]:op["offset"] + op["length"]]
        req = urllib.request.Request(op["url"], data=chunk, method=op["method"], headers={h["name"]: h["value"] for h in op["requestHeaders"]})
        urllib.request.urlopen(req).read()
    patch = {"data": {"type": "inAppPurchaseAppStoreReviewScreenshots", "id": res["id"], "attributes": {"uploaded": True, "sourceFileChecksum": hashlib.md5(data).hexdigest()}}}
    ok(*call("PATCH", f"/v1/inAppPurchaseAppStoreReviewScreenshots/{res['id']}", patch), "commit screenshot")
    print("    review screenshot uploaded")


def version_id(app):
    q = urllib.parse.urlencode({"filter[versionString]": VERSION, "filter[platform]": "IOS"})
    vs = ok(*call("GET", f"/v1/apps/{app}/appStoreVersions?{q}"), "find version")["data"]
    if not vs:
        raise SystemExit(f"No App Store version {VERSION}; create it in ASC first")
    return vs[0]["id"], vs[0]["attributes"].get("appStoreState")


def attach_build(app, number):
    q = urllib.parse.urlencode({"filter[app]": app, "filter[version]": number, "filter[preReleaseVersion.version]": VERSION})
    builds = ok(*call("GET", f"/v1/builds?{q}"), "find build")["data"]
    if not builds:
        raise SystemExit(f"Build {VERSION} ({number}) not found or still processing")
    b = builds[0]
    print("  build", b["id"], b["attributes"].get("processingState"))
    vid, state = version_id(app)
    ok(*call("PATCH", f"/v1/appStoreVersions/{vid}/relationships/build", {"data": {"type": "builds", "id": b["id"]}}), "attach build")
    print(f"  attached to {VERSION} ({state})")


def submit(app):
    vid, state = version_id(app)
    subs = ok(*call("GET", f"/v1/reviewSubmissions?filter[app]={app}&filter[state]=READY_FOR_REVIEW,WAITING_FOR_REVIEW,IN_REVIEW,UNRESOLVED_ISSUES"), "list submissions")["data"]
    if subs:
        sub = subs[0]
        print("  existing submission", sub["id"], sub["attributes"]["state"])
    else:
        sub = ok(*call("POST", "/v1/reviewSubmissions", {"data": {"type": "reviewSubmissions", "attributes": {"platform": "IOS"}, "relationships": {"app": {"data": {"type": "apps", "id": app}}}}}), "create submission")["data"]
        print("  created submission", sub["id"])
    existing = {i["relationships"]["appStoreVersion"]["data"]["id"] if i["relationships"].get("appStoreVersion", {}).get("data") else i["relationships"].get("appStoreVersionExperiment", {}).get("data", {}).get("id") for i in ok(*call("GET", f"/v1/reviewSubmissions/{sub['id']}/items"), "items")["data"]}
    if vid not in existing:
        body = {"data": {"type": "reviewSubmissionItems", "relationships": {"reviewSubmission": {"data": {"type": "reviewSubmissions", "id": sub["id"]}}, "appStoreVersion": {"data": {"type": "appStoreVersions", "id": vid}}}}}
        st, out = call("POST", "/v1/reviewSubmissionItems", body)
        print(f"    version {vid}: {st}" + ("" if st < 300 else f" {str(out)[:2500]}"))
        if st >= 300:
            raise SystemExit("version not ready")
    # IAPs are not review submission items; each gets its own inAppPurchaseSubmission
    # and Apple reviews it alongside the version.
    for pid, (iid, st) in sorted(iaps(app).items()):
        if st == "READY_TO_SUBMIT":
            body = {"data": {"type": "inAppPurchaseSubmissions", "relationships": {"inAppPurchaseV2": {"data": {"type": "inAppPurchases", "id": iid}}}}}
            st2, out = call("POST", "/v1/inAppPurchaseSubmissions", body)
            print(f"    iap {pid}: {st2}" + ("" if st2 < 300 else f" {str(out)[:600]}"))
        else:
            print(f"    {pid}: {st} (not submitted)")
    if "--no-submit" in sys.argv:
        print("  left unsubmitted (--no-submit)")
        return
    ok(*call("PATCH", f"/v1/reviewSubmissions/{sub['id']}", {"data": {"type": "reviewSubmissions", "id": sub["id"], "attributes": {"submitted": True}}}), "submit")
    print("  SUBMITTED for review")


def main():
    step = sys.argv[1]
    app = app_id()
    print("app", app)
    if step == "screenshots":
        path = sys.argv[2]
        for pid, (iid, st) in sorted(iaps(app).items()):
            print(f"  {pid} ({st})")
            upload_screenshot(iid, path)
    elif step == "build":
        attach_build(app, sys.argv[2])
    elif step == "submit":
        submit(app)
    else:
        raise SystemExit(__doc__)


if __name__ == "__main__":
    main()

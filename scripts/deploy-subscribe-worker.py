#!/usr/bin/env python3
"""Deploy worker/subscribe.js as the `hits-subscribe` Cloudflare Worker.

Mirrors scripts/deploy-worker-assets.py: pure Cloudflare API, no wrangler.

What this sets up:
  - the Worker script itself (ES module)
  - a D1 binding named DB -> hits-subscribers
  - a plain-text var BREVO_LIST_ID
  - a route so the endpoint lives on the real domain, not workers.dev

What this deliberately does NOT set:
  - BREVO_API_KEY and TURNSTILE_SECRET. Those are secrets and are added by hand
    in the dashboard, so they never pass through this repo or a terminal history.
    Uploading the script without them is safe: the Worker checks for the key and
    still stores the signup in D1 if it is missing.

Re-running this is safe. It replaces the script and is idempotent on the route.
"""
import json
import os
import sys
import urllib.error
import urllib.request

ACCT = "308073169b8bc739df8300e75231444d"
ZONE = "973963f1a123a9e219f4d239c91c2e44"
SCRIPT = "hits-subscribe"
D1_NAME = "hits-subscribers"
D1_ID = "050637c9-a3dc-4607-938b-3ed7b51a64df"
ROUTE = "healthinthespirit.com/api/subscribe*"
CF = "https://api.cloudflare.com/client/v4"

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(HERE, "worker", "subscribe.js")
TOK = open(os.path.expanduser("~/.config/cloudflare/api_token")).read().strip()


def req(url, method="GET", body=None, headers=None, raw=False):
    h = {"Authorization": f"Bearer {TOK}"}
    if headers:
        h.update(headers)
    data = body
    if body is not None and not raw:
        h.setdefault("Content-Type", "application/json")
        data = json.dumps(body).encode()
    r = urllib.request.Request(url, data=data, headers=h, method=method)
    try:
        with urllib.request.urlopen(r) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return json.loads(e.read())


def main():
    script = open(SRC, encoding="utf-8").read()

    # Carry forward every binding this script does not manage itself. Uploading
    # a bindings list that omits one deletes it, so without this a redeploy
    # would silently strip the API key and the endpoint would stop syncing.
    #
    # Anything named BREVO_API_KEY or TURNSTILE_SECRET is promoted to
    # secret_text on the way through, so a value added as a plain variable in
    # the dashboard ends up encrypted rather than readable.
    MANAGED = {"DB", "BREVO_LIST_ID"}
    SENSITIVE = {"BREVO_API_KEY", "TURNSTILE_SECRET"}

    existing = req(f"{CF}/accounts/{ACCT}/workers/scripts/{SCRIPT}/settings")
    inherited = []
    if existing.get("success"):
        for b in existing["result"].get("bindings", []):
            name = b.get("name")
            if name in MANAGED:
                continue
            if b.get("type") == "secret_text":
                inherited.append({"type": "inherit", "name": name})
                print(f"preserving secret: {name}")
            elif b.get("type") == "plain_text" and name in SENSITIVE:
                # Re-upload the value as a secret so it stops being readable.
                inherited.append({"type": "secret_text", "name": name, "text": b.get("text", "")})
                print(f"promoting {name} from plain text to secret")
            elif b.get("type") == "plain_text":
                inherited.append({"type": "plain_text", "name": name, "text": b.get("text", "")})
                print(f"preserving variable: {name}")

    # An empty BREVO_LIST_ID env var must not blank an already-configured one.
    list_id = os.environ.get("BREVO_LIST_ID", "")
    if not list_id and existing.get("success"):
        list_id = next(
            (b.get("text", "") for b in existing["result"].get("bindings", [])
             if b.get("name") == "BREVO_LIST_ID"), "")

    bindings = [
        {"type": "d1", "name": "DB", "id": D1_ID},
        {"type": "plain_text", "name": "BREVO_LIST_ID", "text": list_id},
        *inherited,
    ]

    metadata = {
        "main_module": "subscribe.js",
        "compatibility_date": "2026-06-17",
        "bindings": bindings,
        "observability": {"enabled": True},
    }

    boundary = "----cfsubscribe9f2c"
    parts = []
    parts.append(
        f'--{boundary}\r\nContent-Disposition: form-data; name="metadata"\r\n'
        f'Content-Type: application/json\r\n\r\n{json.dumps(metadata)}\r\n'.encode()
    )
    parts.append(
        f'--{boundary}\r\nContent-Disposition: form-data; name="subscribe.js"; '
        f'filename="subscribe.js"\r\nContent-Type: application/javascript+module\r\n\r\n'.encode()
        + script.encode()
        + b"\r\n"
    )
    parts.append(f"--{boundary}--\r\n".encode())

    out = req(
        f"{CF}/accounts/{ACCT}/workers/scripts/{SCRIPT}",
        method="PUT",
        body=b"".join(parts),
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        raw=True,
    )
    if not out.get("success"):
        print("script upload failed:", out.get("errors"))
        return 1
    print(f"worker '{SCRIPT}' deployed")

    # Route. Adding an identical route twice returns an error we can ignore.
    routes = req(f"{CF}/zones/{ZONE}/workers/routes")
    if routes.get("success") and any(r["pattern"] == ROUTE for r in routes["result"]):
        print(f"route already present: {ROUTE}")
    else:
        r = req(
            f"{CF}/zones/{ZONE}/workers/routes",
            method="POST",
            body={"pattern": ROUTE, "script": SCRIPT},
        )
        if r.get("success"):
            print(f"route created: {ROUTE}")
        else:
            print("route error:", r.get("errors"))
            return 1

    print("\nStill to do by hand in the dashboard (secrets never live in this repo):")
    print("  BREVO_API_KEY     secret     the xkeysib- REST API key")
    print("  TURNSTILE_SECRET  secret     optional, only if Turnstile is turned on")
    return 0


if __name__ == "__main__":
    sys.exit(main())

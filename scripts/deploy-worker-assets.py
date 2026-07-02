#!/usr/bin/env python3
"""Deploy ./dist as static assets to the existing Cloudflare Worker.

Pure-API implementation of wrangler's assets deploy:
  1. assets-upload-session with a manifest of {path: {hash, size}}
  2. upload any buckets of files the API asks for (base64, multipart)
  3. PUT the worker script metadata with the completion JWT

Preserves the worker's existing runtime config (assets-only, Jun 17 compat
date, global_fetch_strictly_public, observability on).
"""
import base64
import hashlib
import json
import mimetypes
import os
import sys
import urllib.request

ACCT = "308073169b8bc739df8300e75231444d"
SCRIPT = "health-in-the-spirit"
DIST = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dist")
CF = "https://api.cloudflare.com/client/v4"
TOK = open(os.path.expanduser("~/.config/cloudflare/api_token")).read().strip()


def req(url, method="GET", body=None, headers=None, is_json=True):
    h = {"Authorization": f"Bearer {TOK}"}
    if headers:
        h.update(headers)
    if body is not None and is_json:
        body = json.dumps(body).encode()
        h["Content-Type"] = "application/json"
    r = urllib.request.Request(url, data=body, method=method, headers=h)
    try:
        with urllib.request.urlopen(r, timeout=60) as resp:
            return json.load(resp)
    except urllib.error.HTTPError as e:
        print("HTTP", e.code, e.read().decode()[:800])
        raise


def file_hash(data: bytes) -> str:
    # wrangler: sha256 hex of (contents base64 + extension), truncated to 32
    ext = ""
    return hashlib.sha256(data).hexdigest()[:32]


# --- 1. build manifest -------------------------------------------------
manifest = {}
contents = {}
for root, _dirs, files in os.walk(DIST):
    for f in files:
        p = os.path.join(root, f)
        rel = "/" + os.path.relpath(p, DIST)
        data = open(p, "rb").read()
        h = file_hash(data)
        manifest[rel] = {"hash": h, "size": len(data)}
        contents[h] = (rel, data)
print(f"manifest: {len(manifest)} files, "
      f"{sum(m['size'] for m in manifest.values())//1024} KB total")

# --- 2. upload session --------------------------------------------------
sess = req(f"{CF}/accounts/{ACCT}/workers/scripts/{SCRIPT}/assets-upload-session",
           "POST", {"manifest": manifest})
if not sess.get("success"):
    print("session errors:", sess.get("errors")); sys.exit(1)
res = sess["result"]
jwt = res.get("jwt")
buckets = res.get("buckets") or []
print(f"upload session ok; buckets to upload: {len(buckets)}")

completion_jwt = jwt
if buckets:
    boundary = "----cfassets7f3a9d"
    for i, bucket in enumerate(buckets, 1):
        parts = []
        for h in bucket:
            rel, data = contents[h]
            ctype = mimetypes.guess_type(rel)[0] or "application/octet-stream"
            b64 = base64.b64encode(data).decode()
            parts.append(
                f"--{boundary}\r\n"
                f'Content-Disposition: form-data; name="{h}"; filename="{h}"\r\n'
                f"Content-Type: {ctype}\r\n\r\n{b64}\r\n")
        body = ("".join(parts) + f"--{boundary}--\r\n").encode()
        up = req(f"{CF}/accounts/{ACCT}/workers/assets/upload?base64=true",
                 "POST", body,
                 headers={"Authorization": f"Bearer {jwt}",
                          "Content-Type": f"multipart/form-data; boundary={boundary}"},
                 is_json=False)
        if not up.get("success"):
            print("bucket errors:", up.get("errors")); sys.exit(1)
        if up["result"].get("jwt"):
            completion_jwt = up["result"]["jwt"]
        print(f"  bucket {i}/{len(buckets)} uploaded ({len(bucket)} files)")

# --- 3. deploy script metadata ------------------------------------------
metadata = {
    "assets": {
        "jwt": completion_jwt,
        "config": {"html_handling": "auto-trailing-slash",
                   "not_found_handling": "404-page"},
    },
    "compatibility_date": "2026-06-17",
    "compatibility_flags": ["global_fetch_strictly_public"],
    "observability": {"enabled": True},
}
boundary = "----cfmeta91b2c"
body = (f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="metadata"\r\n'
        f"Content-Type: application/json\r\n\r\n{json.dumps(metadata)}\r\n"
        f"--{boundary}--\r\n").encode()
dep = req(f"{CF}/accounts/{ACCT}/workers/scripts/{SCRIPT}",
          "PUT", body,
          headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
          is_json=False)
print("deploy success:", dep.get("success"),
      "| errors:", dep.get("errors"))

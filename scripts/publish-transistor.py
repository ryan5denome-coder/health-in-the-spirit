#!/usr/bin/env python3
"""Upload an episode to Transistor and publish it.

    python3 scripts/publish-transistor.py \\
        --audio  "03-Episode-Masters/Salt of the Earth.mp3" \\
        --title  "Salt of the Earth" \\
        --number 10 \\
        --notes  "04-Transcripts-and-Show-Notes/Salt of the Earth - Show Notes.md" \\
        --transcript "04-Transcripts-and-Show-Notes/Salt of the Earth - Transcript.md" \\
        --summary "One-paragraph blurb." \\
        [--publish]

Without --publish the episode is created as a draft and its id is printed, so
the result can be checked in the dashboard first. With --publish it goes live
immediately, which pushes to Apple and Spotify and cannot be cleanly undone.

Flow (per developers.transistor.fm):
  1. GET  /v1/episodes/authorize_upload?filename=...  -> upload_url, audio_url
  2. PUT  the file to upload_url with the returned content_type
  3. POST /v1/episodes                                 -> draft episode
  4. PATCH /v1/episodes/:id/publish  status=published  (only with --publish)

Show notes are markdown; Transistor wants HTML in `description`, so the small
converter below produces the same <div>/<strong>/<a>/<ul> shape the existing
episodes use. The transcript goes into `transcript_text` as plain text.

Key lives at ~/.config/transistor/api_key, never in this repo.
"""
import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

API = "https://api.transistor.fm/v1"
SHOW_ID = "80173"  # Health in the Spirit
KEY = open(os.path.expanduser("~/.config/transistor/api_key")).read().strip()


def call(method, path, params=None, data=None, headers=None):
    url = f"{API}{path}"
    if params:
        url += "?" + urllib.parse.urlencode(params, doseq=True)
    h = {"x-api-key": KEY, "Accept": "application/json"}
    if headers:
        h.update(headers)
    body = None
    if data is not None:
        body = urllib.parse.urlencode(data, doseq=True).encode()
        h.setdefault("Content-Type", "application/x-www-form-urlencoded")
    req = urllib.request.Request(url, data=body, headers=h, method=method)
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.status, json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as e:
        raw = e.read()
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, {"raw": raw[:500].decode(errors="replace")}


# ── markdown -> Transistor-style HTML ──────────────────────────────────────

def inline(s):
    s = s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    s = re.sub(r"\[([^\]]+)\]\((https?://[^)]+)\)", r'<a href="\2">\1</a>', s)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"(?<!\*)\*(?!\*)([^*]+?)\*(?!\*)", r"<em>\1</em>", s)
    return s


def md_to_html(md):
    out, para, bullets = [], [], []

    def flush_para():
        if para:
            out.append("<div>" + inline(" ".join(para)) + "</div>")
            para.clear()

    def flush_bullets():
        if bullets:
            out.append("<ul>" + "".join(f"<li>{inline(b)}</li>" for b in bullets) + "</ul>")
            bullets.clear()

    for line in md.splitlines():
        s = line.strip()
        if not s:
            flush_para(); flush_bullets(); continue
        if s == "---":
            flush_para(); flush_bullets(); continue
        if s.startswith("- "):
            flush_para(); bullets.append(s[2:]); continue
        flush_bullets()
        para.append(s)
    flush_para(); flush_bullets()
    return "".join(out)


def transcript_plain(md):
    """Strip the bold timestamp markup; keep [mm:ss] as plain text."""
    t = re.sub(r"\*\*\[(\d\d:\d\d)\]\*\*", r"[\1]", md)
    return re.sub(r"\n{3,}", "\n\n", t).strip()


# ── main ────────────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--audio", required=True)
    ap.add_argument("--title", required=True)
    ap.add_argument("--number", type=int, required=True)
    ap.add_argument("--season", type=int, default=1)
    ap.add_argument("--notes", required=True, help="markdown show notes")
    ap.add_argument("--transcript", help="markdown transcript")
    ap.add_argument("--summary", required=True, help="short plain-text blurb")
    ap.add_argument("--type", default="full", choices=["full", "trailer", "bonus"])
    ap.add_argument("--publish", action="store_true")
    a = ap.parse_args()

    audio = os.path.abspath(a.audio)
    size = os.path.getsize(audio)
    filename = os.path.basename(audio)

    # 1. authorize
    st, auth = call("GET", "/episodes/authorize_upload", params={"filename": filename})
    if st != 200:
        print("authorize_upload failed:", st, auth); return 1
    attrs = auth["data"]["attributes"]
    upload_url, audio_url, ctype = attrs["upload_url"], attrs["audio_url"], attrs["content_type"]
    print(f"1. upload authorized ({ctype}, expires in {attrs.get('expires_in')}s)")

    # 2. PUT the file. Presigned S3 URL: no api key, exact content type.
    with open(audio, "rb") as f:
        req = urllib.request.Request(upload_url, data=f.read(), method="PUT",
                                     headers={"Content-Type": ctype, "Content-Length": str(size)})
        with urllib.request.urlopen(req, timeout=600) as r:
            if r.status not in (200, 201, 204):
                print("upload failed:", r.status); return 1
    print(f"2. uploaded {size/1e6:.1f} MB")

    # 3. create the episode as a draft
    description = md_to_html(open(a.notes, encoding="utf-8").read())
    fields = {
        "episode[show_id]": SHOW_ID,
        "episode[title]": a.title,
        "episode[number]": a.number,
        "episode[season]": a.season,
        "episode[type]": a.type,
        "episode[explicit]": "false",
        "episode[audio_url]": audio_url,
        "episode[summary]": a.summary,
        "episode[description]": description,
    }
    if a.transcript:
        fields["episode[transcript_text]"] = transcript_plain(open(a.transcript, encoding="utf-8").read())

    st, ep = call("POST", "/episodes", data=fields)
    if st not in (200, 201):
        print("create failed:", st, json.dumps(ep)[:600]); return 1
    ep_id = ep["data"]["id"]
    at = ep["data"]["attributes"]
    print(f"3. episode created  id={ep_id}  #{at.get('number')}  status={at.get('status')}")
    print(f"   title      : {at.get('title')}")
    print(f"   summary    : {len(at.get('summary') or '')} chars")
    print(f"   description: {len(at.get('description') or '')} chars html")
    print(f"   transcript : {'yes' if at.get('transcript_text') else 'no'}")
    print(f"   share url  : {at.get('share_url')}")

    if not a.publish:
        print("\nDraft only. Re-run with --publish to make it live.")
        return 0

    # 4. publish
    st, pub = call("PATCH", f"/episodes/{ep_id}/publish", data={"episode[status]": "published"})
    if st not in (200, 201):
        print("publish failed:", st, json.dumps(pub)[:600]); return 1
    pa = pub["data"]["attributes"]
    print(f"4. PUBLISHED  status={pa.get('status')}  published_at={pa.get('published_at')}")
    print(f"   {pa.get('share_url')}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

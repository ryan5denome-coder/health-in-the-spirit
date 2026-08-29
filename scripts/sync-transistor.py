#!/usr/bin/env python3
"""Sync every published episode from the Transistor RSS feed into src/content/episodes.

Transistor is the source of truth for episode audio and show notes. This script
pulls the public feed and writes one markdown file per episode so the site can
render episodes statically — no API key, no runtime fetch, no build-time network
dependency once the files are committed.

    python3 scripts/sync-transistor.py            # write files
    python3 scripts/sync-transistor.py --dry-run  # report what would change

Feed fields map onto the `episodes` collection schema in src/content.config.ts.
Anything a human adds to a file by hand (see LOCAL_FIELDS) survives a re-sync;
everything else is overwritten from the feed every run.
"""
import argparse
import html
import os
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

FEED_URL = "https://feeds.transistor.fm/health-in-the-spirit"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "src", "content", "episodes")

NS = {
    "itunes": "http://www.itunes.com/dtds/podcast-1.0.dtd",
    "content": "http://purl.org/rss/1.0/modules/content/",
}

# Frontmatter keys the feed does not own. If an existing file sets one of these,
# we carry it forward instead of dropping it — that is how hand-curated extras
# (a YouTube link, a transcript, a pinned episode) survive a re-sync.
LOCAL_FIELDS = (
    "guestName",
    "youtubeEmbedUrl",
    "appleEpisodeUrl",
    "spotifyEmbedUrl",
    "transcriptUrl",
    "featured",
    "imageSrc",
    "imageAlt",
    "draft",
)


# ── feed ────────────────────────────────────────────────────────────────────


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "health-in-the-spirit-sync/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def text(node, path):
    """Text of a child element, or None. Whitespace-collapsed for scalars."""
    el = node.find(path, NS)
    if el is None or el.text is None:
        return None
    v = el.text.strip()
    return v or None


def slugify(s):
    s = html.unescape(s or "").lower()
    s = s.replace("&", " and ")
    # Fold the punctuation Transistor titles are full of (em dashes, apostrophes).
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return re.sub(r"-{2,}", "-", s).strip("-")


def dedent_html(s):
    """Feed CDATA arrives indented 8 spaces, which markdown reads as a code block."""
    return "\n".join(line.lstrip() for line in (s or "").splitlines()).strip()


def strip_tags(s):
    s = re.sub(r"<br\s*/?>", " ", s or "", flags=re.I)
    s = re.sub(r"</p>", " ", s, flags=re.I)
    s = re.sub(r"<[^>]+>", "", s)
    return re.sub(r"\s+", " ", html.unescape(s)).strip()


def summarize(item, fallback_html, limit=200):
    """Short card/meta description: prefer the hand-written iTunes summary."""
    for path in ("itunes:subtitle", "itunes:summary"):
        v = text(item, path)
        if v:
            v = strip_tags(v)
            if v:
                return v if len(v) <= limit else v[: limit - 1].rsplit(" ", 1)[0] + "…"
    v = strip_tags(fallback_html)
    return v if len(v) <= limit else v[: limit - 1].rsplit(" ", 1)[0] + "…"


def parse_items(xml_bytes):
    channel = ET.fromstring(xml_bytes).find("channel")
    show_image = channel.find("itunes:image", NS)
    show_image = show_image.get("href") if show_image is not None else None

    episodes = []
    for item in channel.findall("item"):
        body = dedent_html(text(item, "content:encoded") or text(item, "description") or "")
        enclosure = item.find("enclosure")
        item_image = item.find("itunes:image", NS)
        pub = parsedate_to_datetime(text(item, "pubDate"))
        share = text(item, "link") or ""
        # Transistor share links are /s/<id>; the embeddable player is /e/<id>.
        transistor_id = share.rsplit("/", 1)[-1] if "/s/" in share else None

        raw_num = text(item, "itunes:episode")
        keywords = text(item, "itunes:keywords") or ""

        episodes.append(
            {
                "number": int(raw_num) if raw_num and raw_num.isdigit() else None,
                "title": html.unescape(text(item, "title") or "Untitled"),
                "guid": text(item, "guid"),
                "episodeType": (text(item, "itunes:episodeType") or "full").lower(),
                "releaseDate": pub,
                "durationSeconds": int(text(item, "itunes:duration") or 0) or None,
                "audioUrl": enclosure.get("url") if enclosure is not None else None,
                "audioBytes": int(enclosure.get("length")) if enclosure is not None and enclosure.get("length") else None,
                "transistorShareUrl": share or None,
                "transistorEmbedUrl": f"https://share.transistor.fm/e/{transistor_id}" if transistor_id else None,
                "image": (item_image.get("href") if item_image is not None else None) or show_image,
                "explicit": (text(item, "itunes:explicit") or "no").lower() in ("yes", "true"),
                "keywords": [k.strip() for k in keywords.split(",") if k.strip()],
                "body": body,
                "description": summarize(item, body),
            }
        )

    # Oldest first, so a missing itunes:episode can fall back to feed order.
    episodes.sort(key=lambda e: e["releaseDate"])
    return episodes


# ── frontmatter ─────────────────────────────────────────────────────────────


def yaml_str(v):
    return '"' + str(v).replace("\\", "\\\\").replace('"', '\\"') + '"'


def read_local_overrides(path):
    """Pull LOCAL_FIELDS out of an existing file's frontmatter so a re-sync keeps them."""
    if not os.path.exists(path):
        return {}
    with open(path, encoding="utf-8") as f:
        src = f.read()
    m = re.match(r"^---\n(.*?)\n---\n", src, re.S)
    if not m:
        return {}
    out = {}
    for line in m.group(1).splitlines():
        km = re.match(r"^([A-Za-z0-9_]+):\s*(.+?)\s*$", line)
        if km and km.group(1) in LOCAL_FIELDS:
            out[km.group(1)] = km.group(2)
    return out


def render(ep, overrides):
    """Frontmatter, feed-derived, with any hand-curated LOCAL_FIELDS layered on top."""
    fields = [
        ("number", str(ep["number"])),
        ("slug", yaml_str(ep["slug"])),
        ("title", yaml_str(ep["title"])),
        ("description", yaml_str(ep["description"])),
        ("releaseDate", yaml_str(ep["releaseDate"].isoformat())),
        ("status", '"live"'),
        ("episodeType", yaml_str(ep["episodeType"])),
    ]
    if ep["durationSeconds"]:
        fields.append(("durationSeconds", str(ep["durationSeconds"])))
        fields.append(("durationMinutes", str(round(ep["durationSeconds"] / 60))))
    if ep.get("guestName"):
        fields.append(("guestName", yaml_str(ep["guestName"])))
    for key in ("audioUrl", "transistorShareUrl", "transistorEmbedUrl", "guid"):
        if ep.get(key):
            fields.append((key, yaml_str(ep[key])))
    if ep.get("audioBytes"):
        fields.append(("audioBytes", str(ep["audioBytes"])))
    if ep.get("image"):
        fields.append(("artworkUrl", yaml_str(ep["image"])))
    fields.append(("explicit", "true" if ep["explicit"] else "false"))
    fields.append(("draft", "false"))

    # Hand-curated values replace the feed value in place, keeping key order stable.
    keys = [k for k, _ in fields]
    for key, raw in overrides.items():
        if key in keys:
            fields[keys.index(key)] = (key, raw)
        else:
            fields.append((key, raw))

    lines = [f"{k}: {v}" for k, v in fields]
    if ep["keywords"]:
        lines.append("keywords:")
        lines.extend(f"  - {yaml_str(k)}" for k in ep["keywords"])

    return "---\n" + "\n".join(lines) + "\n---\n\n" + ep["body"] + "\n"


# ── guest detection ─────────────────────────────────────────────────────────

# Only one title pattern is safe enough to trust. Everything else is curated by
# hand (guestName is a LOCAL_FIELD, so it survives every re-sync) — a looser
# regex reads "The Acceptable Sin" as a person named "The Acceptable".
GUEST_PATTERN = re.compile(r"[Cc]onversation with ([A-Z][a-z]+(?: [A-Z][a-z]+)+)")


def detect_guest(title):
    m = GUEST_PATTERN.search(title)
    return m.group(1) if m else None


# ── main ────────────────────────────────────────────────────────────────────


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--dry-run", action="store_true", help="report changes without writing")
    ap.add_argument("--feed", default=FEED_URL)
    args = ap.parse_args()

    print(f"→ fetching {args.feed}")
    episodes = parse_items(fetch(args.feed))
    print(f"  {len(episodes)} episodes in feed")

    # Fill gaps and surface collisions rather than silently renumbering: the feed
    # is the source of truth and duplicates need fixing in Transistor, not here.
    seen = {}
    fallback = 0
    for ep in episodes:
        if ep["number"] is None:
            fallback += 1
            ep["number"] = fallback
        else:
            fallback = max(fallback, ep["number"])
        seen.setdefault(ep["number"], []).append(ep["title"])
        ep["slug"] = slugify(ep["title"])
        ep["guestName"] = detect_guest(ep["title"])

    for num, titles in sorted(seen.items()):
        if len(titles) > 1:
            print(f"  ⚠ episode number {num} is used by {len(titles)} episodes in Transistor:")
            for t in titles:
                print(f"      · {t}")

    slugs = {}
    for ep in episodes:
        slugs.setdefault(ep["slug"], []).append(ep)
    for slug, group in slugs.items():
        if len(group) > 1:
            for i, ep in enumerate(group[1:], start=2):
                ep["slug"] = f"{slug}-{i}"
                print(f"  ⚠ duplicate slug '{slug}' → renamed to '{ep['slug']}'")

    os.makedirs(OUT_DIR, exist_ok=True)
    keep, wrote, unchanged = set(), 0, 0

    for ep in episodes:
        filename = f"{ep['number']:02d}-{ep['slug']}.md"
        path = os.path.join(OUT_DIR, filename)
        keep.add(filename)
        content = render(ep, read_local_overrides(path))

        existing = None
        if os.path.exists(path):
            with open(path, encoding="utf-8") as f:
                existing = f.read()
        if existing == content:
            unchanged += 1
            continue

        verb = "update" if existing is not None else "create"
        print(f"  {verb}: {filename}")
        if not args.dry_run:
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
        wrote += 1

    # Anything left over is a pre-launch placeholder or an episode pulled from
    # Transistor. Either way the feed no longer describes it.
    for name in sorted(os.listdir(OUT_DIR)):
        if name.endswith(".md") and name not in keep:
            print(f"  remove: {name} (not in feed)")
            if not args.dry_run:
                os.remove(os.path.join(OUT_DIR, name))

    print(f"\n{'would write' if args.dry_run else 'wrote'} {wrote} file(s), {unchanged} unchanged")
    return 0


if __name__ == "__main__":
    sys.exit(main())

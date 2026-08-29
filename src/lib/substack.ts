/**
 * Substack feed reader. Build time only.
 *
 * Architecture, and why it is this way (see docs/substack-integration.md):
 *
 *   1. Local markdown in `src/content/posts` is the canonical source of truth.
 *      Substack hard-codes its own `rel=canonical` on every post and gives
 *      publishers no override, so anything published in full over there earns
 *      Substack the search authority, not healthinthespirit.com. Substack is a
 *      distribution channel here, never the CMS.
 *
 *   2. The fetch happens at build time, in Node, never in the browser. The feed
 *      sends no CORS headers at all (verified), so a client-side fetch is
 *      impossible without a proxy. Nothing in this file ships to the client.
 *
 *   3. It fails soft. A Substack outage, a shape change, or a DNS blip must
 *      never fail the site build, so every path returns `[]` and logs.
 *
 * The publication URL comes from `socialUrls.substack` in
 * `src/content/settings/site.json`. It is empty today because the publication
 * does not exist yet, and an empty value short-circuits before any network call.
 */
import { site } from './site';

export interface SubstackItem {
  title: string;
  /** Absolute Substack URL. Always link out. Never claim it as our canonical. */
  url: string;
  pubDate: Date;
  /** Plain-text teaser. Substack's <description> is the subtitle, not the body. */
  excerpt: string;
  /** True when the item's <enclosure> is audio. Substack puts an enclosure on
   *  every item (cover image for text posts, mp3 for episodes), so the type is
   *  the only reliable signal. */
  isPodcast: boolean;
}

/**
 * Turn whatever is in settings into a feed URL.
 *
 * Accepts a bare publication URL ("https://x.substack.com"), one with a trailing
 * slash, or a URL that already points at the feed. Returns null when unset, so
 * callers can skip the network entirely.
 *
 * `*.substack.com/feed` 301-redirects to a publication's custom domain, so the
 * fetch below must follow redirects. It does by default.
 */
export function substackFeedUrl(): string | null {
  const raw = site.socialUrls?.substack?.trim();
  if (!raw) return null;

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    console.warn(`[substack] socialUrls.substack is not a valid URL: ${raw}`);
    return null;
  }

  if (/\/feed(\.xml)?\/?$/.test(parsed.pathname)) return parsed.toString();

  parsed.pathname = `${parsed.pathname.replace(/\/+$/, '')}/feed`;
  return parsed.toString();
}

/** The publication home, for a "read on Substack" link. Null when unset. */
export function substackHomeUrl(): string | null {
  const raw = site.socialUrls?.substack?.trim();
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    parsed.pathname = parsed.pathname.replace(/\/feed(\.xml)?\/?$/, '/');
    return parsed.toString();
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Minimal RSS reading
//
// Honest scoping note: what follows is NOT a general XML parser and must not be
// treated as one. It is a set of regexes shaped to one known document, Substack's
// `/feed`, whose item structure is documented and verified in
// docs/substack-integration.md: flat <item> elements, CDATA-wrapped <title> and
// <content:encoded>, an HTML-escaped <description>, an RFC-822 <pubDate>, and
// exactly one self-closing <enclosure>. It would break on nested elements of the
// same name, on comments containing tag-like text, or on any other feed.
//
// It exists because the project has no XML parser in package.json and this is a
// single read-only consumer of a single feed. If a second feed ever needs
// parsing, add a real parser instead of widening this.
// ---------------------------------------------------------------------------

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  rsquo: '’',
  lsquo: '‘',
  rdquo: '”',
  ldquo: '“',
};

/** Decode the numeric and named entities Substack actually emits. */
function decodeEntities(input: string): string {
  return input
    .replace(/&#x([0-9a-f]+);/gi, (_m, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_m, dec: string) =>
      String.fromCodePoint(Number.parseInt(dec, 10)),
    )
    .replace(/&([a-z]+);/gi, (match, name: string) => NAMED_ENTITIES[name.toLowerCase()] ?? match);
}

/** Unwrap a CDATA section if the value is one, otherwise return it unchanged. */
function unwrapCdata(value: string): string {
  const match = value.match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/);
  return match ? match[1] : value;
}

/** First direct child element with this tag name, CDATA-unwrapped, undecoded. */
function readTag(xml: string, tagName: string): string | null {
  const pattern = new RegExp(
    `<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`,
    'i',
  );
  const match = xml.match(pattern);
  return match ? unwrapCdata(match[1]) : null;
}

/** Read one attribute off the first <enclosure> in an item. */
function readEnclosureType(itemXml: string): string | null {
  const enclosure = itemXml.match(/<enclosure\b[^>]*>/i);
  if (!enclosure) return null;
  const type = enclosure[0].match(/\btype\s*=\s*["']([^"']*)["']/i);
  return type ? type[1] : null;
}

/**
 * Strip tags, decode entities, collapse whitespace.
 *
 * Decoding runs before the strip as well as after it: <description> carries
 * HTML-escaped HTML (`&lt;em&gt;`), so stripping first would leave the escaped
 * tags sitting in the excerpt as literal text.
 */
function toPlainText(html: string): string {
  const stripped = decodeEntities(html)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ');

  return decodeEntities(stripped).replace(/\s+/g, ' ').trim();
}

/** Truncate on a word boundary so an excerpt never ends mid-word. */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const clipped = text.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(' ');
  const stem = (lastSpace > maxLength * 0.5 ? clipped.slice(0, lastSpace) : clipped).replace(
    /[\s,;:.]+$/,
    '',
  );
  return `${stem}…`;
}

function parseItems(xml: string, excerptLength: number): SubstackItem[] {
  const items: SubstackItem[] = [];
  const itemPattern = /<item\b[^>]*>([\s\S]*?)<\/item>/gi;

  let match: RegExpExecArray | null;
  while ((match = itemPattern.exec(xml)) !== null) {
    const itemXml = match[1];

    const rawTitle = readTag(itemXml, 'title');
    const rawLink = readTag(itemXml, 'link');
    if (!rawTitle || !rawLink) continue;

    const url = decodeEntities(rawLink).trim();
    if (!/^https?:\/\//i.test(url)) continue;

    const rawDate = readTag(itemXml, 'pubDate');
    const parsedDate = rawDate ? new Date(decodeEntities(rawDate).trim()) : new Date(Number.NaN);

    const enclosureType = readEnclosureType(itemXml);

    items.push({
      title: toPlainText(rawTitle),
      url,
      pubDate: Number.isNaN(parsedDate.getTime()) ? new Date(0) : parsedDate,
      excerpt: truncate(toPlainText(readTag(itemXml, 'description') ?? ''), excerptLength),
      isPodcast: Boolean(enclosureType?.toLowerCase().startsWith('audio/')),
    });
  }

  return items;
}

interface GetSubstackItemsOptions {
  /** Substack's feed carries the 20 most recent posts. Asking for more is moot. */
  limit?: number;
  excerptLength?: number;
}

/**
 * Fetch and parse the publication feed. Returns [] when Substack is not
 * configured, unreachable, slow, or shaped differently than expected.
 *
 * Never throws. The site build must survive anything that happens here.
 */
export async function getSubstackItems(
  options: GetSubstackItemsOptions = {},
): Promise<SubstackItem[]> {
  const { limit = 6, excerptLength = 180 } = options;

  const feedUrl = substackFeedUrl();
  if (!feedUrl) return []; // Not configured yet. No request, no warning, no noise.

  try {
    const response = await fetch(feedUrl, {
      redirect: 'follow', // *.substack.com/feed 301s to a custom domain.
      headers: {
        accept: 'application/rss+xml, application/xml;q=0.9, */*;q=0.8',
        'user-agent': 'healthinthespirit.com build (+https://healthinthespirit.com)',
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      console.warn(
        `[substack] ${feedUrl} returned ${response.status} ${response.statusText}. Skipping the Substack section.`,
      );
      return [];
    }

    const items = parseItems(await response.text(), excerptLength);
    if (items.length === 0) {
      console.warn(`[substack] no items found in ${feedUrl}. Skipping the Substack section.`);
      return [];
    }

    return items
      .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
      .slice(0, limit);
  } catch (error) {
    // Timeout, DNS, TLS, malformed body: all the same answer. Build proceeds.
    console.warn(
      `[substack] could not read ${feedUrl}. Skipping the Substack section.`,
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

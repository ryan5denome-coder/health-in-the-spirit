# Substack Integration for healthinthespirit.com

Research date: **2026-08-29**. Every claim below is either (a) cited to a live doc, or (b) verified empirically
against live Substack endpoints with `curl` on the research date — those are marked **[verified]** with the
observed output. Substack changes without notice; re-verify the **[verified]** items before relying on them
a year from now.

Site context: Astro `^6.2.0` static build (`astro.config.mjs` has no adapter → `output: 'static'`),
`@astrojs/sitemap`, `@astrojs/rss`, Tailwind v4 via Vite plugin, Decap CMS with content collections in
`src/content/{posts,episodes,saints,pages,settings}`, deployed on Cloudflare, plus a
`worker/decap-oauth.js` Worker for the Decap GitHub OAuth flow.

---

## 1. Does Substack have a public API or RSS feed?

### 1.1 RSS feed — yes, and it is the stable integration surface

**URL format:** `https://<publication>.substack.com/feed`

Two important behaviours:

- If the publication has a **custom domain**, the `*.substack.com/feed` URL **301-redirects** to the custom
  domain's `/feed`. **[verified]** `curl -sSD- https://noahpinion.substack.com/feed` →
  `HTTP/2 301`, `location: https://www.noahpinion.blog/feed`.
  **Consequence: your fetch client must follow redirects** (`curl -L`; `fetch()` follows by default;
  `redirect: 'error'` would break).
- `/feed.xml` is an alias and returns byte-identical content. **[verified]** `https://www.thefp.com/feed.xml`
  and `https://www.thefp.com/feed` both returned 224,666 bytes.
- Paths that do **not** work: `/rss` → 404, `/podcast/feed` → 404, `/feed/podcast` → 400 JSON (it needs a
  publication id path segment), `/s/<section>/feed` → not exposed. There is **one feed per publication**;
  sections and podcast episodes all share it.
  Source: [wpRSSAggregator, "Substack RSS Feed: Every URL That Works"](https://www.wprssaggregator.com/substack-rss-feed/)

### 1.2 Exact fields the feed exposes

**[verified]** against `https://www.noahpinion.blog/feed` and `https://www.thefp.com/feed`.

Root element declares these namespaces:

```
xmlns:dc      = http://purl.org/dc/elements/1.1/
xmlns:content = http://purl.org/rss/1.0/modules/content/
xmlns:atom    = http://www.w3.org/2005/Atom
xmlns:itunes  = http://www.itunes.com/dtds/podcast-1.0.dtd
xmlns:googleplay = http://www.google.com/schemas/play-podcasts/1.0
```

**Channel level:** `title`, `description`, `link`, `image/{url,title,link}`, `generator` (`Substack`),
`lastBuildDate`, `atom:link rel="self"`, `copyright`, `language`, `webMaster`,
`itunes:owner/{itunes:email,itunes:name}`, `itunes:author`, `itunes:block`,
`googleplay:{owner,email,author}`.

**Item level — the complete set observed:**

| Field | Present | Notes |
|---|---|---|
| `<title>` | yes | CDATA-wrapped |
| `<link>` | yes | absolute post URL on the publication's canonical domain |
| `<guid isPermaLink="false">` | yes | same string as `<link>` — use it as your key |
| `<description>` | yes | **teaser/subtitle only**, HTML-escaped, not the body |
| `<pubDate>` | yes | RFC-822, always `GMT` (e.g. `Fri, 28 Aug 2026 09:48:43 GMT`) |
| `<dc:creator>` | yes | author display name |
| `<content:encoded>` | yes | full post body as HTML, CDATA-wrapped |
| `<enclosure>` | yes | **always present, but the type varies — see below** |
| `<itunes:*>` per item | **no** | no per-episode `itunes:duration`, `itunes:episode`, `itunes:summary` |
| `<author>` | **no** | use `dc:creator` |
| `<category>` | **no** | Substack tags are **not** in the feed |
| `<comments>` / `slash:comments` | **no** | |

**The `<enclosure>` gotcha.** Substack emits an enclosure on *every* item, not just podcast episodes:

- Text post → `<enclosure url="https://substackcdn.com/image/fetch/..." length="0" type="image/jpeg"/>`
  (the cover image)
- Podcast episode → `<enclosure url="https://api.substack.com/feed/podcast/<POST_ID>/<HASH>.mp3" length="0" type="audio/mpeg"/>`

**[verified]** real podcast item from `thefp.com`:

```xml
<item>
  <title><![CDATA[Our Foreign Policy Divide Began with the Korean War]]></title>
  <description><![CDATA[Dane J. Cash, author of 'The Forgotten Debate,' explains why...]]></description>
  <link>https://www.thefp.com/p/school-of-war-korean-war-foreign-policy</link>
  <guid isPermaLink="false">https://www.thefp.com/p/school-of-war-korean-war-foreign-policy</guid>
  <dc:creator><![CDATA[Aaron MacLean]]></dc:creator>
  <pubDate>Fri, 28 Aug 2026 09:01:50 GMT</pubDate>
  <enclosure url="https://api.substack.com/feed/podcast/213027433/7d047c299ef18bde2fc617688286578a.mp3"
             length="0" type="audio/mpeg"/>
  <content:encoded><![CDATA[ ...full HTML... ]]></content:encoded>
</item>
```

So **always branch on `enclosure/@type.startsWith('audio/')`** to decide "is this an episode",
and **never trust `length`** — it is `0` on every item observed. If you need a real byte length or a
duration you have to HEAD the mp3 yourself or get it from the JSON archive endpoint's `podcast_duration`.

**Item count:** the feed returns the **20 most recent posts only**. **[verified]** both feeds returned
exactly 20 `<item>` elements. There is no `?limit=` or paging on `/feed`. If you need the full archive
you need the JSON endpoint (§1.4) or a local source of truth.

**Paid posts:** on a paywalled post, `content:encoded` contains only the public preview plus a subscribe
prompt — the same thing a logged-out visitor sees.
Source: [wpRSSAggregator](https://www.wprssaggregator.com/substack-rss-feed/)

**Content warnings for rendering `content:encoded` inline:** the body HTML is *not* clean semantic markup.
The Noahpinion feed body contained 693 `<div>`, 202 `<svg>`, 202 `<button>`, 102 `<picture>`/`<source>`
blocks, `data-attrs` JSON blobs, `data-component-name` attributes, Substack CSS class names, and 3
`<iframe>` embeds. **[verified]** by tag census. If you render it you must sanitize and restyle
aggressively, and you will inherit `<button>` elements that do nothing outside Substack.

### 1.3 CORS and rate limiting on `/feed`

**CORS: the feed sends NO CORS headers. A browser `fetch()` of it will fail.** **[verified]**:

```
$ curl -sSD- -o /dev/null -H "Origin: https://healthinthespirit.com" https://www.noahpinion.blog/feed
HTTP/2 200
content-type: application/xml; charset=utf-8
cf-cache-status: HIT
cache-control: no-cache
vary: Accept-Encoding
        # <- no access-control-allow-origin anywhere

$ curl -sSD- -o /dev/null -X OPTIONS -H "Origin: https://healthinthespirit.com" \
       -H "Access-Control-Request-Method: GET" https://www.noahpinion.blog/feed
HTTP/2 200
allow: GET,HEAD
        # <- 200, but no access-control-allow-* => preflight fails, request is blocked
```

This is the decisive fact for §3: **client-side browser fetch of a Substack feed is impossible without a
proxy.** Any tutorial telling you to `fetch('https://x.substack.com/feed')` from the browser is either
using a third-party CORS proxy (`api.allorigins.win`, `corsproxy.io`) or is wrong.

**Rate limiting:** no documented public limit, and none hit in practice. **[verified]** 15 sequential
requests to `/feed` → 15× `HTTP 200`, no `429`, no `Retry-After`. Requests with **no** `User-Agent` header
and with `User-Agent: node` both returned `200`, so there is no UA gate on the feed. Responses come through
Cloudflare (`server: cloudflare`, `cf-cache-status: HIT`, `cache-control: no-cache`) — meaning Substack
edge-caches the feed, so a build-time fetch is cheap for them and fast for you. Nothing in
`robots.txt` disallows `/feed`. **[verified]** `https://www.noahpinion.blog/robots.txt` disallows
`/action/`, `/publish`, `/sign-in`, `/subscribe`, `/embed`, `/feed/private`,
`/feed/podcast/*/private/*.rss` — but **not** `/feed`.

A once-per-build (or 2×/day) fetch is well inside anything reasonable. Do not poll it per-request from a
Worker without caching.

### 1.4 Official API vs. unofficial JSON endpoints

**Official API — effectively does not exist for this use case.** Substack published a
[Developer API](https://support.substack.com/hc/en-us/articles/45099095296916-Substack-Developer-API) with
[Terms of Use last updated 2026-01-08](https://substack.com/api-tos), but its documented surface is a
**profile-search endpoint** returning public creator profile data (name, LinkedIn URL, social URLs,
subscriber count) for creators who linked a LinkedIn handle. **There is no official endpoint to list your
posts, publish, or manage subscribers.** Treat the official API as irrelevant here.

**Unofficial JSON endpoints — they work, but are undocumented and quirky.**

`GET https://<pub>.substack.com/api/v1/archive?sort=new&offset=0&limit=N` — this is the endpoint the
Substack web app itself calls.

**[verified]** behaviour on 2026-08-29:

```
GET https://noahpinion.substack.com/api/v1/archive?...   -> HTTP 301 to the custom domain (follow redirects)
GET https://www.noahpinion.blog/api/v1/archive?sort=new&limit=3
    -> 200, content-type: application/json; charset=utf-8
    -> JSON array of post objects
    -> NO access-control-allow-origin header  => browser-blocked, same as /feed
```

Returned object keys (per post) included: `id`, `title`, `subtitle`, `slug`, `post_date`, `canonical_url`,
`description`, `search_engine_title`, `search_engine_description`, `social_title`, `cover_image`,
`coverImagePalette`, `audience`, `type`, `body_html`, `body_json`, `wordcount`, `postTags`,
`publishedBylines`, `reactions`, `reaction_count`, `comment_count`, `restacks`, `hidden`, `language`,
`section_id`, `section_name`, `section_slug`, `podcast_url`, `podcast_duration`, `podcast_upload_id`,
`podcastFields`, `podcastUpload`, `audio_items`, `has_voiceover`, `free_unlock_required`, `is_geoblocked`.

**Advantages over RSS:** real pagination (`offset` works — `offset=20&limit=5` returned a different set),
`postTags` (categories, absent from RSS), `podcast_duration`, `audience` (free vs. paid), and
`search_engine_title` / `search_engine_description`.

**Why it is NOT stable — [verified] anomaly:** `limit` is not honoured predictably.

```
?sort=new&offset=0&limit=5   -> 5 items
?sort=new&offset=0&limit=50  -> 23 items   (not 50)
?sort=new&offset=0&limit=100 -> 1 item     (not 100, not 23)
```

That is undocumented, unversioned behaviour that changed shape with no notice. Combine that with: no CORS
headers, no ToS coverage, no deprecation policy, and a Cloudflare front door that could start challenging
non-browser clients at any time.

**Verdict:** use `/feed` as the primary source. Reach for `/api/v1/archive` only for a one-time backfill or
if you specifically need tags/duration, and always with a cached fallback so a shape change cannot break
your build.

Third-party references if you go down this road:
[AnthonyDavidAdams/substack-api-reference](https://github.com/AnthonyDavidAdams/substack-api-reference) (129
mapped endpoints), [NHagar/substack_api](https://github.com/NHagar/substack_api) (Python wrapper).

---

## 2. Architecture options for a "blog tab powered by Substack"

Key SEO fact that decides this entire section:

> **Substack self-canonicals and gives you no way to point the canonical at your own site.**

**[verified]** a Substack post's `<head>`:

```html
<link rel="canonical" href="https://www.noahpinion.blog/p/heres-how-were-all-going-to-die" />
```

The canonical points at the Substack-hosted URL, always. There is no publisher-facing canonical field
(Substack exposes `search_engine_title` / `search_engine_description` per post, but no canonical override).
Confirmed by multiple SEO writeups as of mid-2026, e.g.
[MightyMinnow, "How to Cross-Post Without Hurting Your SEO"](https://www.mightyminnow.com/2025/12/how-to-cross-post-your-content-safely-without-hurting-your-seo/)
and [Superblog, "Substack SEO"](https://superblog.ai/substack-seo).

So in any Substack-first arrangement, **Google's canonical vote goes to Substack, and healthinthespirit.com
accrues nothing.** Setting `<link rel="canonical" href="substack...">` on *your* page (option b) makes that
worse, not better — it explicitly tells Google to drop your URL.

### (a) Build-time RSS fetch → post cards that link out to Substack

**How:** `.astro` page fetches `/feed` in frontmatter, renders title + `description` teaser + date, each
card's `href` is the Substack `<link>`.

| | |
|---|---|
| Pros | Trivial to build (~60 lines). Zero content duplication. Zero maintenance — new posts appear on next build. No sanitization risk. Fast static output. |
| Cons | Every click leaves your domain. Your `/blog` page is a thin link list — low-value in Google's eyes, will not rank for the topics. Goes stale between builds (§3). Only ever 20 posts. |
| SEO | **Neutral-to-negative.** No duplicate content, but no content either. Substack gets all the ranking, all the backlinks, all the dwell time. Your domain authority does not grow. |

### (b) Build-time RSS fetch → full `content:encoded` rendered inline, canonical → Substack

| | |
|---|---|
| Pros | Reader stays on your site. Looks like a real blog. Still zero authoring overhead. |
| Cons | You are rendering Substack's `<div>`/`<svg>`/`<button>` soup — must sanitize (see §1.2 tag census) and restyle. Paid posts render as a stub + subscribe wall. Images hotlink to `substackcdn.com`. If Substack changes body markup, your CSS breaks. |
| SEO | **Worst of the options.** With canonical → Substack you have explicitly ceded the page. Without a canonical you have real duplicate content across two domains and Google picks a winner — usually Substack (higher domain authority; Substack sits around DA 78 per [Superblog](https://superblog.ai/substack-seo)). Either way healthinthespirit.com gets nothing. |

### (c) Keep the Decap markdown blog, cross-post manually to Substack

| | |
|---|---|
| Pros | You already have it (`src/content/posts` + `src/pages/blog/[...slug].astro`). Full control of markup, schema, internal linking, images. All SEO value lands on your domain. |
| Cons | Manual double-publishing. Duplicate content risk if you paste the full text into Substack (Substack self-canonicals, so you are competing with yourself). Substack's importer is a **one-time migration** tool, not an ongoing sync — see [Substack import docs](https://support.substack.com/hc/en-us/articles/360037830351-How-do-I-import-my-posts-from-another-platform-such-as-Mailchimp-WordPress-Medium-or-Ghost). |
| SEO | **Good, if you don't paste the whole post.** Publish full text on your site; send a genuine excerpt/teaser + "read the full post" link to Substack. |

### (d) Hybrid — local markdown is the source of truth, Substack is distribution

| | |
|---|---|
| Pros | Everything in (c), plus Substack's email delivery, discovery/recommendation network, Notes, app, and paid-subscription rails. Podcast episodes still live on your site as first-class pages. |
| Cons | Two publish steps per post (write → publish site → paste teaser into Substack → send). Requires discipline about what goes into the Substack copy. |
| SEO | **Best.** Canonical content is on healthinthespirit.com. Substack posts are short teasers that link back to you — those links are `nofollow`-ish in value but they drive real referral traffic and brand searches, both of which help. No duplicate-content ambiguity because the Substack version is materially shorter and different. |

### Recommendation

**Go with (d), and add a small dose of (a).**

Concretely, for a small Christian health & wellness podcast that wants healthinthespirit.com to be the
authority hub:

1. **Source of truth stays in Decap → `src/content/posts`.** Full articles, full show notes, transcripts,
   episode pages, schema markup — all on your domain, all indexable, all internally linked. This is what
   builds authority.
2. **Substack is the newsletter + discovery layer.** Each post gets a Substack email that is a real teaser
   — hook, key takeaway, a scripture or two — capped with "Read the full post at healthinthespirit.com".
   Never paste the whole article. This sidesteps Substack's inability to canonical to you.
3. **Add a `/newsletter` page on your site** (option a) that build-time fetches the Substack feed and renders
   the last ~10 issues as cards linking out. This gives newcomers proof the newsletter is alive, gives you an
   internal page to point the "Subscribe" CTA at, and costs ~60 lines. Set the page itself to
   `<meta name="robots" content="noindex,follow">` — it is a directory page, not content you want ranking,
   and noindexing it removes any duplicate-teaser concern entirely.
4. **Keep the podcast RSS on your own host** and *also* publish to Substack if you want the paid-audio
   rails (§6). Do not make Substack your only podcast host — you would be handing them your feed URL, which
   is the one asset in podcasting you must never rent.
5. **Do not put Substack on `newsletter.healthinthespirit.com`** — see §4.

The one-line version: **your site owns the content and the SEO; Substack owns the inbox and the discovery
graph; the RSS feed is a read-only mirror for a directory page, never your content pipeline.**

---

## 3. Keeping it fresh on Cloudflare (staleness)

A build-time fetch is a snapshot. Options, worst to best for this site:

### Option A — Client-side browser fetch. **Not viable.**

**Blocked by CORS.** Verified in §1.3: neither `/feed` nor `/api/v1/archive` sends
`access-control-allow-origin`, and the `OPTIONS` preflight returns `200 allow: GET,HEAD` with no
`access-control-*` headers, so the browser rejects it. The only ways around it are a third-party CORS proxy
(adds a dependency, a privacy leak, and a single point of failure) or your own proxy — at which point
Option D is strictly better. **Rule this out.**

### Option B — Astro on-demand rendering with the Cloudflare adapter

Would let the page fetch at request time. **But:**

- Astro 6 requires `@astrojs/cloudflare` **v13** (`13.7.0` declares `peerDependencies: { astro: "^6.3.0",
  wrangler: "^4.83.0" }` — **[verified]** via npm registry). Your project is on `astro ^6.2.0`, so you would
  bump Astro to ≥6.3 first.
- **The adapter no longer supports Cloudflare Pages — Workers only.** Per the
  [Astro Cloudflare adapter docs](https://docs.astro.build/en/guides/integrations-guide/cloudflare/):
  "The Astro Cloudflare adapter no longer supports deployment on Cloudflare Pages." If you are currently on
  Pages, this is a platform migration, not a config change.
- It converts a purely static site into one with a server runtime, for the sake of one directory page.

**Overkill.** Only pick this if you already need SSR for something else. If you do go this route, you can
keep the rest of the site static and mark only that one page `export const prerender = false`, or use a
**server island** so the page stays static and only the feed block renders per-request.

### Option C — Astro experimental live content collections + `@ascorbic/feed-loader`

The loader supports an experimental *live* mode that fetches feeds at request time.
[@ascorbic/feed-loader](https://www.npmjs.com/package/@ascorbic/feed-loader) —
but **v2.0.1 declares `peerDependencies: { astro: "^4.14.0 || ^5.0.0" }`** (**[verified]** via npm registry),
i.e. **it does not yet support Astro 6**. Revisit later; not usable today.

### Option D — Deploy hook + Worker cron. ✅ **Recommended.**

Keep the site 100% static. A tiny Worker on a cron trigger POSTs your project's deploy hook twice a day; the
build re-fetches the feed. Simple, free, no runtime, no CORS, no adapter migration.

Cloudflare supports deploy hooks on **both** platforms:

- **Pages:** [Deploy Hooks](https://developers.cloudflare.com/pages/configuration/deploy-hooks/) —
  Workers & Pages → your project → Settings → Builds → *Add deploy hook*. Give it a name and a branch, get a
  unique URL, POST to it. "Deploy Hooks are uniquely linked to your project and do not require additional
  authentication."
- **Workers Builds:** [Deploy Hooks](https://developers.cloudflare.com/workers/ci-cd/builds/deploy-hooks/),
  shipped [2026-04-01](https://developers.cloudflare.com/changelog/post/2026-04-01-deploy-hooks/). Workers &
  Pages → your Worker → Settings → Builds → Deploy Hooks → *Create*. The Worker must already be connected to
  a Git repo. URL form:
  `https://api.cloudflare.com/client/v4/workers/builds/deploy_hooks/<DEPLOY_HOOK_ID>`, method **POST**, no
  auth header (the id in the URL *is* the credential). Success returns
  `{"success":true,"result":{"build_uuid":"…","branch":"main","worker":"…"}}`.
  **Rate limit: 10 builds/min per Worker, 100 builds/min per account.** Redundant hook fires that arrive
  before the first build starts are automatically deduped.

#### Exact setup

**1. Create the deploy hook** in the dashboard (steps above). Copy the URL. Treat it as a secret — anyone
with it can trigger builds.

**2. Create the cron Worker.** You already have a `worker/` directory for the Decap OAuth worker; add a
sibling. `worker/rebuild-cron/src/index.ts`:

```ts
export interface Env {
  DEPLOY_HOOK_URL: string;
}

export default {
  async scheduled(_controller: ScheduledController, env: Env, _ctx: ExecutionContext): Promise<void> {
    const res = await fetch(env.DEPLOY_HOOK_URL, { method: 'POST' });
    if (!res.ok) {
      // Surfaces in `wrangler tail` and in Workers Logs.
      console.error(`Deploy hook failed: ${res.status} ${await res.text()}`);
      return;
    }
    console.log('Deploy hook fired:', await res.text());
  },
} satisfies ExportedHandler<Env>;
```

**3. `worker/rebuild-cron/wrangler.jsonc`:**

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "hits-rebuild-cron",
  "main": "src/index.ts",
  "compatibility_date": "2026-08-01",
  "observability": { "enabled": true },
  "triggers": {
    // 06:10 and 18:10 UTC daily. Cron is 5-field: minute hour day month weekday, always UTC.
    "crons": ["10 6,18 * * *"]
  }
}
```

Cron syntax and limits: [Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/).

**4. Store the hook URL as a secret (never in the JSONC):**

```sh
cd worker/rebuild-cron
npx wrangler secret put DEPLOY_HOOK_URL   # paste the URL when prompted
npx wrangler deploy
```

**5. Test locally without waiting for the cron:**

```sh
npx wrangler dev
curl "http://localhost:8787/cdn-cgi/handler/scheduled?format=json"
```

**Cadence guidance:** twice a day is plenty for a weekly-ish podcast newsletter, and keeps you far under the
10/min hook limit and under Cloudflare's free build-minute allowance. If you want near-instant, add a Zapier
/ Make / IFTTT trigger on the Substack RSS feed that POSTs the same hook on new-item — but the cron alone is
the low-maintenance answer.

**Also worth doing:** Decap CMS commits to Git, which already triggers a build. The cron only exists to catch
Substack-side changes.

### Option E — Worker proxy + client-side fetch (fallback, not recommended here)

If you ever *do* want live data without a rebuild: a Worker route on your own domain that fetches
`https://<pub>.substack.com/feed` server-side (no CORS in Workers), caches it in the Cache API or KV for
15–60 min, and re-serves it **with** `access-control-allow-origin: https://healthinthespirit.com`. This is
the only correct way to do a browser-side Substack fetch. It adds moving parts and a client-side loading
state for a page that changes weekly — not worth it for this site.

---

## 4. Custom domain / subdomain on Substack

**What Substack supports:** one custom domain per publication, set in Settings → Domain → *Add custom
domain*. Owner or group-admin permission required.

**Cost: a one-time $50 USD fee per publication.** No sales tax/VAT is charged on it. This has been the price
since 2020 and is unchanged as of 2026.
Sources: [Substack support — custom domain setup](https://support.substack.com/hc/en-us/articles/360051222571-How-do-I-set-up-my-custom-domain-on-Substack),
[SubstackAPI guide](https://substackapi.com/docs/how-to-set-up-a-substack-custom-domain),
[the original $50 announcement discussion](https://news.ycombinator.com/item?id=24862378).

**DNS records:** a single **CNAME**. You must add the domain in Substack *first*; Substack then generates
the exact CNAME target for your publication and shows it in the dashboard — it is publication-specific, so
do not copy a target value from a blog post. (Commonly cited target:
`target.substack-custom-domains.com`, but **use the one Substack shows you**.) Propagation can take up to
**36 hours**.

**Root domains are not supported** — it must be a subdomain (`www.`, `newsletter.`, `read.`, etc.). That is
a hard constraint, and it is why you cannot point `healthinthespirit.com` itself at Substack.

⚠️ **Cloudflare-specific:** if `healthinthespirit.com` is on Cloudflare DNS, the CNAME for the Substack
subdomain **must be DNS-only (grey cloud), not proxied (orange cloud)**. Proxying it breaks Substack's
certificate issuance. Also be aware of the
[dangling-CNAME hijacking class of bug](https://gbhackers.com/substack-custom-domain-vulnerability/) —
if you ever stop using the subdomain, delete the DNS record, don't leave it pointing at Substack.

### Does a subdomain help or hurt SEO?

**It does not help healthinthespirit.com, and for your goal it actively hurts.**

Google treats a subdomain as a substantially separate site for authority purposes: backlinks, traffic, and
topical authority earned by `newsletter.healthinthespirit.com` do **not** reliably consolidate into
`healthinthespirit.com`. Subfolders consolidate; subdomains do not.
Sources: [Design Spartans, "Subdomains vs Subfolders for SEO 2026"](https://designspartans.com/subdomains-subfolders-seo/),
[Future Proof Digital](https://futureproofdigital.ie/blog/subdomain-vs-subfolder-vs-new-website/).

And you cannot fix it with a subfolder, because **Substack cannot be served from a subfolder** — there is no
`healthinthespirit.com/newsletter` option on Substack, and reverse-proxying a subfolder to Substack would
fight the self-canonical (§2) anyway.

**Concrete recommendation for this site:**

- **Skip the $50 custom domain.** Under the recommended architecture (§2d), Substack is not where your
  content ranks — it is your inbox and discovery channel. A custom domain buys you (i) branding in the email
  "from"/URL and (ii) portability if you leave Substack later. Neither is worth much yet for a new podcast.
- **If you buy it anyway** (branding matters to you, or you want the option to migrate off Substack without
  losing links), use `newsletter.healthinthespirit.com` and accept that it is a separate SEO property.
  Never use `www.` or the root — you need those for your Astro site.
- Either way, keep **healthinthespirit.com/blog** and **/episodes** as the canonical, indexed, authority-
  accruing content. That is the whole point.

---

## 5. Embeddable email signup

### 5.1 The official iframe embed

**URL format:** `https://<publication>.substack.com/embed` (redirects to the custom domain's `/embed` if one
is set — **[verified]**: `https://noahpinion.substack.com/embed` → `301` →
`https://www.noahpinion.blog/embed`).

Standard snippet Substack gives you:

```html
<iframe
  src="https://healthinthespirit.substack.com/embed"
  width="480" height="320"
  style="border:1px solid #EEE; background:white;"
  frameborder="0" scrolling="no"
  title="Subscribe to Health in the Spirit"
  loading="lazy"
></iframe>
```

Source: [Substack support — Can I embed a signup form?](https://support.substack.com/hc/en-us/articles/360041759232-Can-I-embed-a-signup-form-for-my-Substack-publication)

### 5.2 CSP — it will work, and here is exactly what to allow

**[verified]** headers on `https://www.noahpinion.blog/embed`:

```
HTTP/2 200
content-type: text/html; charset=utf-8
content-security-policy: frame-ancestors *
```

`frame-ancestors *` means **Substack does not restrict who may frame the embed** — no `X-Frame-Options`, no
allowlist. It will render on your site.

The constraint is *your* CSP, if you add one. You need:

```
frame-src https://*.substack.com https://substack.com;
```

(add your Substack custom-domain host too, if you set one). No `script-src` entry is needed — everything
runs inside the iframe's own origin, not yours. Note `/embed` is `Disallow:`ed in Substack's `robots.txt`
(**[verified]**), which is fine and expected — it just means the iframe URL is not indexed.

### 5.3 Styling — you cannot style it

The form renders inside a cross-origin iframe, so **your CSS cannot reach it**: fonts, colors, button
styles, input styling are all fixed. The only official control is a toggle to hide your publication name and
logo ("Show pub logo on embed"). You can size the iframe and put a border around it; that is the extent of
it.
Source: [Supascribe, "Substack Subscribe Form: Native Embed vs …"](https://supascribe.com/guides/substack-subscribe-form-embed)

For a site with a deliberate visual identity, the stock embed will look like a foreign object. Expect to
want an alternative.

### 5.4 Alternatives when the embed looks bad

**[verified]** — the embed's actual internals, from the live `/embed` HTML:

```html
<form action="/api/v1/free?nojs=true" method="post" novalidate>
  <input type="hidden" name="first_url"      value>
  <input type="hidden" name="first_referrer" value>
  <input type="hidden" name="current_url">
  <input type="hidden" name="current_referrer">
  <input type="hidden" name="first_session_url" value>
  <input type="hidden" name="first_session_referrer" value>
  <input type="hidden" name="referral_code">
  <input type="hidden" name="source" value="embed">
  <input type="hidden" name="referring_pub_id">
  <input type="hidden" name="additional_referring_pub_ids">
  <input name="email" type="email" placeholder="Type your email...">
</form>
```

So the subscribe endpoint is `POST https://<pub>.substack.com/api/v1/free` with at minimum `email` and
`source`. Three ways to use that:

1. **Your own styled form → your own Cloudflare Worker → Substack. ✅ Best alternative.**
   A cross-origin `fetch()` straight to `/api/v1/free` **will fail**: **[verified]** `OPTIONS` on that
   endpoint returns `HTTP/2 200, allow: DELETE,POST` with **no `access-control-allow-*` headers**, so any
   JSON preflight is rejected. (A plain `<form method="post">` posting directly would technically transmit —
   it's a simple request — but the browser cannot read the response, so you get no success/error state, and
   it navigates the user away.) Instead: your styled Astro form POSTs to a Worker route on
   `healthinthespirit.com`, the Worker server-side POSTs to Substack (no CORS in Workers), and returns clean
   JSON your UI can render. You control the markup, validation, honeypot/Turnstile, and the success state.
   **Caveat:** `/api/v1/free` is undocumented, unversioned, and could change or start requiring a captcha.
   Keep the iframe embed behind a feature flag as a fallback and monitor the Worker for non-2xx responses.

2. **A third-party wrapper.** [SubstackAPI](https://substackapi.com/) sells a hosted, styleable Substack
   signup form that does exactly the proxy in (1) for you. Fine if you'd rather not maintain the Worker;
   it adds a vendor and a third-party script.

3. **Capture in a different ESP and sync.** Own the list in a real ESP (ConvertKit, Beehiiv, Buttondown,
   MailerLite) and treat Substack as secondary. Highest control and full list portability, but you now run
   two lists and need a sync job — and Substack's import is a
   [one-time migration tool, not an ongoing sync](https://support.substack.com/hc/en-us/articles/360037830351-How-do-I-import-my-posts-from-another-platform-such-as-Mailchimp-WordPress-Medium-or-Ghost).
   Only worth it if email is the primary business, not the podcast.

**Pragmatic recommendation:** ship the iframe embed on `/subscribe` in v1 (it works, it's zero risk, it's 6
lines). If it clashes badly with the site's design, upgrade to option (1) — you already have Worker
infrastructure (`worker/decap-oauth.js`) and the pattern is ~40 lines.

---

## 6. Paid subscriptions and private podcast feeds

### 6.1 Private paid podcast feeds — yes, fully supported

Each subscriber gets a **personal, unique private podcast RSS URL**. Whether it contains free episodes only
or free + paid depends on their subscription status. Subscribers get it from their *Manage subscription*
page and paste it into their podcast app.

**[verified]** the URL shape leaks in Substack's own `robots.txt`, which disallows:

```
Disallow: /feed/private
Disallow: /feed/podcast/*/private/*.rss
```

confirming a per-subscriber tokenised private feed at `/feed/podcast/<id>/private/<token>.rss`.

Sources: [Substack — How do I distribute my podcast to apps?](https://support.substack.com/hc/en-us/articles/360038462911-How-do-I-distribute-my-podcast-to-apps),
[Will my Podcast RSS feed show paid-only content?](https://support.substack.com/hc/en-us/articles/360041722272-Will-my-Podcast-RSS-feed-show-paid-only-content),
[Podcasting questions answered](https://on.substack.com/p/podcastfaq),
[A guide to going paid with your podcast](https://on.substack.com/p/podcast-101-going-paid).

### 6.2 Fees

- **Substack: 10% of subscription revenue.** No monthly fee, no hosting fee, no bandwidth charge, free tier
  costs nothing until you turn on paid.
- **Stripe: ~2.9% + $0.30** per transaction (standard US card rates; Substack's billing runs on Stripe).
- **Combined effective take: roughly 13–16%** on typical price points. On a $10/month subscriber you keep
  about **$8.40**; the smaller the price, the worse the ratio, because Stripe's $0.30 is fixed — at $5/mo you
  keep ~$4.05 (~19% total take), so **annual plans meaningfully improve your net**.
- Minimum pricing on Substack is $5/month or $30/year.

Sources: [Substack for podcasts](https://substack.com/podcasts),
[Substack Pricing 2026 (SchoolMaker)](https://www.schoolmaker.com/blog/substack-pricing),
[Substack Pricing: What You Actually Pay](https://www.emailsoftwareinsights.com/reviews/substack/pricing/),
[Substack Pricing 2026: 10% Fee](https://www.getpricepulse.com/companies/substack-pricing.html).

### 6.3 Limitations you need to know

- **Spotify does not accept pasted private RSS feeds.** Paid subscribers listen to paid episodes on Spotify
  only via Spotify's native Substack account-linking, not by pasting a URL. Public episodes distribute to
  Spotify normally.
  [Substack — How do I listen to paid episodes on Spotify?](https://support.substack.com/hc/en-us/articles/25303480158228-How-do-I-listen-to-paid-episodes-on-Spotify)
- **Apple Podcasts** works with the pasted private feed for paid episodes; free episodes come through the
  public feed as normal.
- **Paid episodes are invisible in the public `/feed`.** The public RSS carries only the preview text for
  paywalled posts, so your site's build-time fetch will never see paid audio — by design, but plan your
  `/newsletter` page copy around it.
- **`<enclosure length>` is `0`** on every item in the public feed (**[verified]**) — some podcast apps and
  validators complain. Not fixable from your side.
- **No per-item `<itunes:duration>` in the public feed** (**[verified]**) — if you want durations on your
  site, get them from `podcast_duration` in the JSON archive endpoint, or from your own podcast host.
- **Substack owns the private feed URLs.** If you leave Substack, every subscriber must re-add a new feed.
  This is the strongest argument for keeping your *free/public* podcast feed on a host you control and using
  Substack only for the paid tier.
- Stripe payouts, taxes, and refunds are handled through your own connected Stripe account.

---

## 7. Recommended implementation — code

Astro 6, TypeScript, build-time fetch, no adapter, no runtime.

### 7.1 Install

```sh
npm i fast-xml-parser@^5.11.1
```

(`fast-xml-parser` 5.11.1 is current as of 2026-08-29. It runs at build time in Node, so it never ships to
the browser and never touches the Workers runtime.)

Do **not** use `@ascorbic/feed-loader` yet — v2.0.1 peers on `astro ^4 || ^5` and does not support Astro 6.

### 7.2 `src/lib/substack.ts`

```ts
import { XMLParser } from 'fast-xml-parser';

/** Publication feed. Substack 301-redirects *.substack.com -> custom domain; fetch() follows by default. */
export const SUBSTACK_FEED_URL = 'https://healthinthespirit.substack.com/feed';

export interface SubstackPost {
  /** Stable key — Substack sets <guid> to the same string as <link>. */
  id: string;
  title: string;
  /** Absolute Substack URL. Always link out; never claim it as your own canonical. */
  url: string;
  /** Teaser only. <description> is the subtitle, NOT the body. Plain text after entity decoding. */
  excerpt: string;
  author: string;
  pubDate: Date;
  /** Full post HTML from <content:encoded>. Present but unsanitized — see notes below. */
  contentHtml: string;
  /** Substack emits an <enclosure> on every item: cover image for text posts, mp3 for episodes. */
  audioUrl: string | null;
  imageUrl: string | null;
  isEpisode: boolean;
}

interface RawEnclosure { '@_url'?: string; '@_type'?: string; '@_length'?: string }
interface RawItem {
  title?: string;
  link?: string;
  guid?: string | { '#text'?: string };
  description?: string;
  pubDate?: string;
  'dc:creator'?: string;
  'content:encoded'?: string;
  enclosure?: RawEnclosure | RawEnclosure[];
}
interface RawFeed {
  rss?: { channel?: { title?: string; description?: string; link?: string; item?: RawItem | RawItem[] } };
}

// fast-xml-parser v5 defaults `cdataPropName: false`, which merges Substack's
// pervasive CDATA sections straight into each tag's text value. That's what we want.
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  trimValues: true,
});

function asArray<T>(v: T | T[] | undefined): T[] {
  return v == null ? [] : Array.isArray(v) ? v : [v];
}

/** Strip tags and decode the handful of entities Substack emits in <description>. */
function toPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCharCode(Number(d)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalize(item: RawItem): SubstackPost | null {
  const url = typeof item.link === 'string' ? item.link : null;
  const title = typeof item.title === 'string' ? item.title : null;
  if (!url || !title) return null;

  const guid = typeof item.guid === 'string' ? item.guid : (item.guid?.['#text'] ?? url);

  // One enclosure per item in practice, but tolerate an array.
  const enclosures = asArray(item.enclosure);
  const audio = enclosures.find((e) => e['@_type']?.startsWith('audio/'));
  const image = enclosures.find((e) => e['@_type']?.startsWith('image/'));

  const raw = item.pubDate ? new Date(item.pubDate) : new Date(NaN);

  return {
    id: guid,
    title: toPlainText(title),
    url,
    excerpt: toPlainText(item.description ?? ''),
    author: typeof item['dc:creator'] === 'string' ? item['dc:creator'] : 'Health in the Spirit',
    pubDate: Number.isNaN(raw.getTime()) ? new Date(0) : raw,
    contentHtml: item['content:encoded'] ?? '',
    audioUrl: audio?.['@_url'] ?? null,
    imageUrl: image?.['@_url'] ?? null,
    isEpisode: Boolean(audio),
  };
}

/**
 * Fetch + parse the Substack feed at build time.
 *
 * Fails soft: a Substack outage must never fail the whole site build. Returns [] and logs a warning,
 * and the page renders its empty state.
 */
export async function getSubstackPosts(limit = 10): Promise<SubstackPost[]> {
  try {
    const res = await fetch(SUBSTACK_FEED_URL, {
      headers: {
        accept: 'application/rss+xml, application/xml;q=0.9, */*;q=0.8',
        'user-agent': 'healthinthespirit.com build (+https://healthinthespirit.com)',
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      console.warn(`[substack] feed returned ${res.status} ${res.statusText}; rendering empty state`);
      return [];
    }

    const parsed = parser.parse(await res.text()) as RawFeed;
    const items = asArray(parsed.rss?.channel?.item);

    return items
      .map(normalize)
      .filter((p): p is SubstackPost => p !== null)
      .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
      .slice(0, limit);
  } catch (err) {
    console.warn('[substack] feed fetch failed; rendering empty state:', err);
    return [];
  }
}
```

**Notes on this file**

- **Fails soft on purpose.** If Substack is down or changes shape, the build succeeds with an empty
  newsletter page rather than taking the whole site offline. That is the right trade for a directory page.
- **Only the first 20 posts exist.** `/feed` has no paging, so `limit` above 20 is meaningless.
- `contentHtml` is exposed but the recommended page does **not** render it (see §2b). If you ever do, run it
  through a sanitizer (`sanitize-html`, `rehype-sanitize`) and strip Substack's `<button>`/`<svg>` chrome.

### 7.3 `src/pages/newsletter/index.astro`

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getSubstackPosts, SUBSTACK_FEED_URL } from '../../lib/substack';

const posts = await getSubstackPosts(12);

const SUBSTACK_HOME = 'https://healthinthespirit.substack.com';

const dateFmt = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC', // Substack pubDate is always GMT
});
---

<BaseLayout
  title="Newsletter | Health in the Spirit"
  description="Reflections on faith, health, and wholeness — delivered to your inbox."
>
  {/*
    noindex,follow: this page is a directory of posts that live on Substack.
    Substack self-canonicals, so there is nothing here for us to win in search —
    and noindexing removes any duplicate-teaser ambiguity. The real, indexable
    content lives at /blog and /episodes.
  */}
  <meta slot="head" name="robots" content="noindex,follow" />
  <link slot="head" rel="alternate" type="application/rss+xml" title="Health in the Spirit newsletter" href={SUBSTACK_FEED_URL} />

  <section class="mx-auto max-w-3xl px-4 py-16">
    <header class="mb-12 text-center">
      <h1 class="text-4xl font-semibold tracking-tight">The Newsletter</h1>
      <p class="mt-4 text-lg text-balance opacity-80">
        Reflections on faith, health, and wholeness — delivered to your inbox.
      </p>
      <a
        class="mt-6 inline-block rounded-full px-6 py-3 font-medium bg-slate-900 text-white hover:bg-slate-700"
        href={`${SUBSTACK_HOME}/subscribe`}
        rel="noopener"
      >
        Subscribe free
      </a>
    </header>

    {posts.length === 0 ? (
      <p class="text-center opacity-70">
        Recent issues aren't loading right now.
        <a class="underline" href={SUBSTACK_HOME} rel="noopener">Read them on Substack →</a>
      </p>
    ) : (
      <ul class="space-y-8">
        {posts.map((post) => (
          <li class="border-b border-black/10 pb-8 last:border-0">
            <article>
              <a class="group block" href={post.url} rel="noopener">
                <div class="flex items-baseline gap-3 text-sm opacity-60">
                  <time datetime={post.pubDate.toISOString()}>{dateFmt.format(post.pubDate)}</time>
                  {post.isEpisode && (
                    <span class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                      Episode
                    </span>
                  )}
                </div>

                <h2 class="mt-2 text-2xl font-semibold group-hover:underline">{post.title}</h2>

                {post.excerpt && <p class="mt-2 opacity-80">{post.excerpt}</p>}

                <span class="mt-3 inline-block text-sm font-medium">Read on Substack →</span>
              </a>

              {/* Public feed audio is playable directly — paid episodes never appear here. */}
              {post.audioUrl && (
                <audio class="mt-4 w-full" controls preload="none" src={post.audioUrl}>
                  <a href={post.url}>Listen to this episode</a>
                </audio>
              )}
            </article>
          </li>
        ))}
      </ul>
    )}
  </section>
</BaseLayout>
```

> `BaseLayout.astro` in this repo must expose a `<slot name="head" />` inside `<head>` for the `robots`
> and `alternate` tags above to land correctly. If it doesn't, pass them as props instead — check
> `src/layouts/BaseLayout.astro` and `src/components/SeoMeta.astro`.

### 7.4 `src/pages/subscribe.astro` — the embed (this page already exists; add the iframe)

```astro
---
const SUBSTACK_EMBED = 'https://healthinthespirit.substack.com/embed';
---
<div class="mx-auto max-w-lg">
  <iframe
    src={SUBSTACK_EMBED}
    width="480"
    height="320"
    style="border:1px solid #EEE; background:white; width:100%; max-width:480px;"
    frameborder="0"
    scrolling="no"
    title="Subscribe to Health in the Spirit"
    loading="lazy"
  ></iframe>
  <noscript>
    <a href="https://healthinthespirit.substack.com/subscribe">Subscribe to the newsletter</a>
  </noscript>
</div>
```

If you add a CSP header (via `public/_headers` on Pages, or a Worker), include:

```
frame-src https://*.substack.com https://substack.com;
```

### 7.5 Optional — expose it in the existing site RSS

`src/pages/rss.xml.js` currently builds from local collections. **Do not merge Substack items into it.** Your
site's feed should describe your site's content; mixing in items whose `<link>` points off-domain confuses
feed readers and podcast validators. Link the Substack feed as a separate `<link rel="alternate">` (done in
§7.3) instead.

---

## 8. Quick decision summary

| Question | Answer |
|---|---|
| RSS feed? | Yes — `https://<pub>.substack.com/feed`, 301s to custom domain, 20 most recent items, one feed for everything |
| Official API? | Effectively no (2026 Developer API = LinkedIn profile lookup only) |
| Unofficial JSON API? | `/api/v1/archive` works, richer data, but `limit` is unreliable and it's unversioned — backup only |
| CORS? | **Blocked.** No `access-control-allow-origin` on `/feed`, `/api/v1/archive`, or `/api/v1/free` |
| Rate limit on `/feed`? | None observed (15 rapid requests, all 200); Cloudflare-cached; not in `robots.txt` disallow |
| Best architecture | **Hybrid (d):** local markdown = source of truth; Substack = distribution; `/newsletter` page mirrors the feed, `noindex,follow` |
| Freshness | **Worker cron → deploy hook**, twice daily. Not client-side (CORS), not SSR (needs Pages→Workers migration) |
| Custom domain | $50 one-time, single CNAME (target from Substack dashboard), **subdomain only**, DNS-only in Cloudflare. Recommendation: skip it for now |
| Subdomain SEO | Neutral-to-negative — subdomains don't consolidate authority into the root domain |
| Embed | `/embed` iframe, `frame-ancestors *` so no framing restriction; **unstylable**; upgrade path = own form → Worker → `POST /api/v1/free` |
| Paid podcast | Yes, per-subscriber private feed at `/feed/podcast/<id>/private/<token>.rss`. Substack 10% + Stripe ~2.9%+$0.30 ≈ 13–16%. Spotify needs native linking, not a pasted feed |

---

## 9. Sources

**Verified empirically 2026-08-29** (curl against `noahpinion.substack.com` / `www.noahpinion.blog`,
`www.thefp.com`): feed URL redirect behaviour, item field inventory, enclosure types and `length="0"`,
20-item cap, absence of CORS headers on `/feed` and `/api/v1/archive` and `/api/v1/free`,
`OPTIONS` responses, 15-request burst with no 429, no-UA and `node`-UA both 200, `robots.txt` contents
including the private podcast feed path, `/embed` `content-security-policy: frame-ancestors *`,
the `/embed` form's `action="/api/v1/free?nojs=true"` and hidden fields, the self-referential
`rel="canonical"` on a Substack post, `/api/v1/archive` field list and `limit` anomaly,
`/feed.xml` byte-identity, npm registry versions for `astro`, `@astrojs/cloudflare`,
`@ascorbic/feed-loader`, `fast-xml-parser`.

**Documentation:**
- [Substack — set up a custom domain](https://support.substack.com/hc/en-us/articles/360051222571-How-do-I-set-up-my-custom-domain-on-Substack)
- [Substack — embed a signup form](https://support.substack.com/hc/en-us/articles/360041759232-Can-I-embed-a-signup-form-for-my-Substack-publication)
- [Substack — distribute my podcast to apps](https://support.substack.com/hc/en-us/articles/360038462911-How-do-I-distribute-my-podcast-to-apps)
- [Substack — will my podcast RSS show paid-only content?](https://support.substack.com/hc/en-us/articles/360041722272-Will-my-Podcast-RSS-feed-show-paid-only-content)
- [Substack — paid episodes on Spotify](https://support.substack.com/hc/en-us/articles/25303480158228-How-do-I-listen-to-paid-episodes-on-Spotify)
- [Substack — importing from another platform](https://support.substack.com/hc/en-us/articles/360037830351-How-do-I-import-my-posts-from-another-platform-such-as-Mailchimp-WordPress-Medium-or-Ghost)
- [Substack Developer API](https://support.substack.com/hc/en-us/articles/45099095296916-Substack-Developer-API) · [API Terms of Use](https://substack.com/api-tos)
- [Substack for podcasts](https://substack.com/podcasts) · [Podcasting FAQ](https://on.substack.com/p/podcastfaq) · [Going paid with your podcast](https://on.substack.com/p/podcast-101-going-paid)
- [Cloudflare Pages — Deploy Hooks](https://developers.cloudflare.com/pages/configuration/deploy-hooks/)
- [Cloudflare Workers Builds — Deploy Hooks](https://developers.cloudflare.com/workers/ci-cd/builds/deploy-hooks/) · [changelog 2026-04-01](https://developers.cloudflare.com/changelog/post/2026-04-01-deploy-hooks/)
- [Cloudflare Workers — Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
- [Astro — @astrojs/cloudflare adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/) · [On-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/)
- [@ascorbic/feed-loader](https://www.npmjs.com/package/@ascorbic/feed-loader) · [astro-loaders](https://github.com/ascorbic/astro-loaders)

**Analysis / secondary:**
- [wpRSSAggregator — Substack RSS Feed: Every URL That Works (2026)](https://www.wprssaggregator.com/substack-rss-feed/)
- [SubstackAPI — custom domain setup](https://substackapi.com/docs/how-to-set-up-a-substack-custom-domain) · [embed a signup form](https://substackapi.com/docs/how-to-embed-your-substack-signup-form-on-any-website)
- [Supascribe — native embed vs. alternatives](https://supascribe.com/guides/substack-subscribe-form-embed)
- [Superblog — Substack SEO](https://superblog.ai/substack-seo) · [Sprout Social — Substack SEO 2026](https://sproutsocial.com/insights/substack-seo/)
- [MightyMinnow — cross-posting without hurting SEO](https://www.mightyminnow.com/2025/12/how-to-cross-post-your-content-safely-without-hurting-your-seo/)
- [Design Spartans — subdomains vs subfolders 2026](https://designspartans.com/subdomains-subfolders-seo/) · [Future Proof Digital](https://futureproofdigital.ie/blog/subdomain-vs-subfolder-vs-new-website/)
- [SchoolMaker — Substack pricing 2026](https://www.schoolmaker.com/blog/substack-pricing) · [Email Software Insights](https://www.emailsoftwareinsights.com/reviews/substack/pricing/) · [PricePulse](https://www.getpricepulse.com/companies/substack-pricing.html)
- [GBHackers — Substack custom domain dangling-CNAME risk](https://gbhackers.com/substack-custom-domain-vulnerability/)
- [substack-api-reference](https://github.com/AnthonyDavidAdams/substack-api-reference) · [NHagar/substack_api](https://github.com/NHagar/substack_api)

# Design conventions

Read this before touching any `.astro` file. It is short on purpose.

## Stack

Astro 6, Tailwind v4 (via `@tailwindcss/vite`), no React, no client framework.
Interactivity is plain `<script>` in the component. There is no `useState`,
no `motion/react`, no `'use client'`. Do not import them.

Icons come from `astro-icon` with the Phosphor set:

```astro
import { Icon } from 'astro-icon/components';
<Icon name="ph:play-fill" class="w-5 h-5" aria-hidden="true" />
```

Never hand-write an SVG icon path. Never use emoji as an icon.

## Color: use semantic tokens, not palette values

`src/styles/global.css` defines two layers. Structural color must use the
semantic layer so it flips correctly in dark mode with no `dark:` variant:

| Use for | Class |
|---|---|
| Page background | `bg-surface` |
| Recessed wells, inputs | `bg-surface-sunken` |
| Cards, raised panels | `bg-surface-raised` |
| Inverted (dark) section | `bg-surface-inverse` + `text-ink-inverse` |
| Body text | `text-ink` |
| Secondary text | `text-ink-muted` |
| Captions, timestamps | `text-ink-subtle` |
| Headings | `text-heading` |
| Hairlines, borders | `border-line`, `border-line-strong` |
| The one accent (all CTAs) | `bg-accent` / `text-accent`, hover `bg-accent-hover` |
| Text on the accent | `text-accent-ink` |
| Gold detail, eyebrow text | `text-gilt` |

`bg-cream-200`, `text-forest-700`, `text-brown-700` and friends still exist but
are light-mode-only. Do not introduce new uses of them for anything structural.

There is exactly ONE accent on this site: terracotta, via `accent`. Never add a
second accent color for a badge, a status, or a section.

## Shape

One radius system: `rounded-xl` (12px) for buttons and inputs, `rounded-2xl`
(16px) for cards and panels, `rounded-full` for circular controls only. Do not
use `rounded-md`, `rounded-lg`, or `rounded-sm` in new work.

## Typography

- Display and headings: `font-serif` (Cormorant Garamond). Brand asset, keep it.
- Body: default sans (Inter). Brand asset, keep it.
- Numbers that change (timecodes, durations, counts): add `tnum`.
- Body copy gets `max-w-[68ch]` or the `.measure` class. Never full-bleed prose.

## Motion

Use `--ease-spring` for entrances and `--ease-out-quint` for state changes,
both already defined. Reveal on scroll by adding `data-reveal` (whole block) or
`data-reveal-children` (staggers direct children) to an element. The observer
lives in `BaseLayout.astro`; do not write another one.

Never use `window.addEventListener('scroll', ...)`.

Every motion must already be gated by reduced motion (the reveal CSS is). If
you add a transform on hover, prefix with `motion-safe:`.

## Hard copy rules

- **Zero em-dashes (`—`) and zero en-dashes (`–`) in any copy you write.** Use a
  period, a comma, parentheses, or a colon. This applies to headings, body,
  buttons, alt text, and meta descriptions.
  - The ONE exception: episode titles and show notes synced from Transistor.
    That is the user's own published writing and must match Apple and Spotify
    byte for byte. Never rewrite synced episode content.
- No "coming soon", no launch countdown, no future tense about the show. It is
  live, with nine episodes out, new ones on Tuesdays. Today is 2026-08-29.
- Only claim Apple Podcasts and Spotify. YouTube and Amazon are not live.
- Max one eyebrow (the small uppercase tracked label above a heading) per three
  sections on a page. Prefer none.
- No section-number labels (`01 / Episodes`), no scroll cues, no decorative
  status dots, no version stamps, no locale or weather strips.
- Do not invent statistics, testimonials, credentials, or prices.

## Components to reuse (do not rebuild these)

| Component | For |
|---|---|
| `BaseLayout.astro` | Every page. Handles head, SEO, JSON-LD, theme, reveal observer. |
| `SectionContainer.astro` | Section wrapper. `variant`, `padding`, `reveal` props. |
| `Button.astro` | All buttons and button-links. |
| `AudioPlayer.astro` | Any episode audio. Props: `src`, `title`, `durationSeconds`, `size`. |
| `EpisodeCard.astro` | Any episode in a list. Props: `episode`, `variant`. |
| `NewsletterForm.astro` | Any email capture. Props: `heading`, `subheading`, `cta`, `tone`, `source`. |
| `Prose.astro` | Rendered markdown bodies. |
| `Breadcrumbs.astro` | Inner pages. |

`SectionContainer` currently maps `variant="forest"` to palette classes. When
you need an inverted section, prefer `bg-surface-inverse text-ink-inverse` on
your own wrapper so it themes correctly.

## Content

Episodes are a content collection synced from the Transistor RSS feed by
`scripts/sync-transistor.py`. Schema is in `src/content.config.ts`. Never edit
`src/content/episodes/*.md` by hand except for the fields listed in
`LOCAL_FIELDS` at the top of the sync script, which survive a re-sync.

Settings live in `src/content/settings/site.json`, typed in `src/lib/site.ts`.
Import `site`, `newsletterLive`, `communityWaitlistLive` from there. Never
hardcode a podcast platform URL or an email address in a page.

## Accessibility floor

- Every interactive element has a visible focus ring (global, do not remove).
- Form inputs have a `<label>` above them. Never placeholder-as-label.
- Contrast: WCAG AA. `text-gilt` passes on both surfaces; raw `gold-500` does not.
- Touch targets 44px minimum on mobile.

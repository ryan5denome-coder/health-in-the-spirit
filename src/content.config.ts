import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

// ============================================================
// Blog posts — one markdown file per post (folder collection).
// ============================================================
const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
      heroAlt: z.string().optional(),
      tags: z.array(z.string()).default([]),
      author: z.string().default('Dr. Ryan DeNome'),
      draft: z.boolean().default(false),
    }),
});

// ============================================================
// Episodes — one markdown file per podcast episode.
// Body = show notes (markdown).
// ============================================================
const episodes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/episodes' }),
  schema: z.object({
    number: z.number(),
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    releaseDate: z.coerce.date(),
    status: z.enum(['upcoming', 'live']).default('upcoming'),
    durationMinutes: z.number().optional(),
    guestName: z.string().optional(),
    buzzsproutEmbedId: z.string().optional(),
    spotifyEmbedUrl: z.string().optional(),
    youtubeEmbedUrl: z.string().optional(),
    appleEpisodeUrl: z.string().optional(),
    audioUrl: z.string().optional(),
    imageSrc: z.string().optional(),
    imageAlt: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

// ============================================================
// Saints — one markdown file per saint profile.
// Body = full saint profile content (markdown).
// ============================================================
const saints = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/saints' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    era: z.string(),
    role: z.string(),
    feastDay: z.string().optional(),
    order: z.number().default(100),
    iconImage: z.string().optional(),
    iconAlt: z.string().optional(),
    heroQuote: z.string().optional(),
    summary: z.string().optional(),
    quotes: z
      .array(
        z.object({
          text: z.string(),
          citation: z.string().optional(),
          theme: z.string().optional(),
          modern: z.string().optional(),
        }),
      )
      .default([]),
    draft: z.boolean().default(false),
  }),
});

// ============================================================
// Pages — singletons (one .md per page, all share one schema).
// Each page only fills the fields it needs; rest are optional.
// ============================================================
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z
    .object({
      // homepage
      announcementMessage: z.string().optional(),
      announcementCtaLabel: z.string().optional(),
      announcementCtaHref: z.string().optional(),
      heroEyebrow: z.string().optional(),
      heroSubtitle: z.string().optional(),
      heroPrimaryCtaLabel: z.string().optional(),
      heroPrimaryCtaHref: z.string().optional(),
      heroSecondaryCtaLabel: z.string().optional(),
      heroSecondaryCtaHref: z.string().optional(),
      pillars: z
        .array(
          z.object({
            eyebrow: z.string(),
            title: z.string(),
            description: z.string(),
            href: z.string(),
            cta: z.string(),
          }),
        )
        .optional(),
      aboutTeaserBody: z.string().optional(),
      aboutTeaserQuote: z.string().optional(),
      newsletterHeading: z.string().optional(),
      newsletterSubtitle: z.string().optional(),

      // about
      heroTitle: z.string().optional(),
      storyBody: z.string().optional(),
      ryanBio: z.string().optional(),
      annieBio: z.string().optional(),
      missionBody: z.string().optional(),
      tagline: z.string().optional(),

      // saints index
      moreSaintsNote: z.string().optional(),

      // subscribe
      platforms: z
        .array(
          z.object({
            name: z.string(),
            status: z.string(),
            href: z.string().optional(),
          }),
        )
        .optional(),
      socials: z
        .array(
          z.object({
            name: z.string(),
            handle: z.string(),
            status: z.string(),
            href: z.string().optional(),
          }),
        )
        .optional(),

      // resources
      categories: z
        .array(
          z.object({
            name: z.string(),
            status: z.string().default('coming soon'),
            description: z.string(),
          }),
        )
        .optional(),

      // faq
      faqs: z
        .array(
          z.object({
            q: z.string(),
            a: z.string(),
          }),
        )
        .optional(),

      // press
      bio50: z.string().optional(),
      bio100: z.string().optional(),
      bio250: z.string().optional(),
    })
    .passthrough(),
});

export const collections = { posts, episodes, saints, pages };

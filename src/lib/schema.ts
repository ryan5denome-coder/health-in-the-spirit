/**
 * Sitewide schema.org JSON-LD builders.
 *
 * Why a single source: changing the brand description in one place updates
 * every page's structured data. LLM grounding tools and Google read this and
 * use it as the canonical entity definition.
 *
 * For a NATIONAL podcast (no local brick-and-mortar), the relevant types are:
 *   - PodcastSeries — describes the show
 *   - PodcastEpisode — describes individual episodes
 *   - WebSite — describes the website itself
 *   - Person — describes hosts (Ryan + Annie) and historical figures (saints)
 *   - Article — describes blog posts
 *   - BreadcrumbList — describes nav breadcrumbs (used on every page)
 */
import { site as settings } from './site';

export const SITE_URL = 'https://healthinthespirit.com';

const buildSameAs = (): string[] => {
  const s = settings.socialUrls;
  return [
    s.applePodcasts, s.spotify, s.youtube, s.amazonMusic, s.rss,
    s.instagram, s.tiktok, s.facebook, s.linkedin, s.twitter,
  ].filter((u): u is string => Boolean(u && u.length > 0));
};

const ryanPerson = {
  '@type': 'Person',
  '@id': `${SITE_URL}/about#ryan`,
  name: 'Dr. Ryan DeNome',
  givenName: 'Ryan',
  familyName: 'DeNome',
  honorificPrefix: 'Dr.',
  jobTitle: 'Chiropractor and Podcast Host',
  description:
    'Catholic chiropractor at The Wellness Way Mason and co-host of Health in the Spirit. Franciscan University of Steubenville (Humanities & Catholic Culture); Life University (Doctor of Chiropractic).',
  alumniOf: [
    { '@type': 'CollegeOrUniversity', name: 'Franciscan University of Steubenville' },
    { '@type': 'CollegeOrUniversity', name: 'Life University' },
  ],
  worksFor: { '@type': 'Organization', name: 'The Wellness Way Mason', url: 'https://thewellnesswaymason.com' },
  url: `${SITE_URL}/about`,
  email: 'ryan@healthinthespirit.com',
  knowsAbout: [
    'Chiropractic',
    'Functional medicine',
    'Catholic theology of the body',
    'Holistic health',
    'Stewardship of the body',
  ],
};

const anniePerson = {
  '@type': 'Person',
  '@id': `${SITE_URL}/about#annie`,
  name: 'Annie DeNome',
  givenName: 'Annie',
  familyName: 'DeNome',
  jobTitle: 'Theologian and Podcast Host',
  description:
    'Catholic Social Teaching advocate at Cross Catholic Outreach. Co-host of Health in the Spirit. Theology and Psychology graduate of Franciscan University of Steubenville. NET Ministries alumna.',
  alumniOf: [
    { '@type': 'CollegeOrUniversity', name: 'Franciscan University of Steubenville' },
  ],
  worksFor: { '@type': 'Organization', name: 'Cross Catholic Outreach' },
  url: `${SITE_URL}/about`,
  email: 'annie@healthinthespirit.com',
  knowsAbout: [
    'Catholic theology',
    'Catholic Social Teaching',
    'Integral human development',
    'Catholic spirituality',
  ],
};

/**
 * PodcastSeries — the canonical entity definition for the show.
 * This is the schema search engines and AI crawlers will pick up as
 * "what is Health in the Spirit?"
 */
export const podcastSeries = (): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'PodcastSeries',
  '@id': `${SITE_URL}#podcast`,
  name: settings.siteTitle,
  alternateName: 'HITS Podcast',
  url: SITE_URL,
  description: settings.defaultDescription,
  inLanguage: 'en-US',
  genre: ['Religion & Spirituality', 'Health & Fitness', 'Catholic', 'Wellness'],
  keywords: [
    'Catholic podcast',
    'Catholic health podcast',
    'Catholic wellness',
    'Holistic health',
    'Saints and health',
    'Catholic theology of the body',
    'Functional medicine Catholic',
    'St. Hildegard of Bingen',
    'Sts. Cosmas and Damian',
    'St. Augustine of Hippo',
  ].join(', '),
  audience: {
    '@type': 'Audience',
    audienceType: 'Catholics in the United States interested in holistic health',
    geographicArea: { '@type': 'Country', name: 'United States' },
  },
  webFeed: settings.socialUrls.rss || `${SITE_URL}/rss.xml`,
  image: `${SITE_URL}/og-default.png`,
  startDate: '2026-07-07',
  author: [ryanPerson, anniePerson],
  actor: [ryanPerson, anniePerson],
  publisher: { '@id': `${SITE_URL}#organization` },
  sameAs: buildSameAs(),
});

/**
 * Organization — the parent entity (the publisher). Some Google rich result
 * patterns prefer Organization specifically; we keep it alongside PodcastSeries.
 */
export const organization = (): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}#organization`,
  name: settings.siteTitle,
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/brand/main-logo.png`,
    width: 1200,
    height: 390,
  },
  image: `${SITE_URL}/og-default.png`,
  description: settings.defaultDescription,
  founder: [ryanPerson, anniePerson],
  email: settings.contactEmail,
  sameAs: buildSameAs(),
});

/**
 * WebSite — the site itself, with a SearchAction so search engines know
 * users can search the site (Google's sitelinks search box).
 */
export const website = (): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}#website`,
  url: SITE_URL,
  name: settings.siteTitle,
  description: settings.defaultDescription,
  publisher: { '@id': `${SITE_URL}#organization` },
  inLanguage: 'en-US',
});

/**
 * BreadcrumbList — auto-generated from the URL path. Goes in head on every page.
 * Example for /saints/hildegard-of-bingen → Home > Saints > St. Hildegard of Bingen
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export const breadcrumbList = (items: BreadcrumbItem[]): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    name: item.name,
    item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
  })),
});

/**
 * The complete sitewide JSON-LD bundle that lives in <head> on every page.
 */
export const sitewideJsonLd = (): Record<string, unknown>[] => [
  organization(),
  podcastSeries(),
  website(),
];

export { ryanPerson, anniePerson };

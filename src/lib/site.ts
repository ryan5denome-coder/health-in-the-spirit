/**
 * Site-wide settings — loaded once, imported by any component that needs them.
 *
 * Source: src/content/settings/site.json (edited via Decap at /admin → Settings → Site).
 *
 * Astro inlines the JSON at build time, so consumers get a typed object with
 * zero runtime cost.
 */
import siteJson from '../content/settings/site.json';

export interface SocialUrls {
  applePodcasts?: string;
  spotify?: string;
  youtube?: string;
  amazonMusic?: string;
  rss?: string;
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  substack?: string;
}

/** Email capture. `formAction` is the only thing that must change to go live. */
export interface NewsletterSettings {
  provider: 'mailerlite' | 'kit' | 'substack' | 'beehiiv' | 'none';
  /** POST target for the signup form. Placeholder until the real form exists. */
  formAction: string;
  listName: string;
  cadence: string;
  /** What the visitor gets for their address. Not a PDF: the show itself,
   *  a curated starting point, and an invitation into the community. */
  offerTitle: string;
  offerBlurb: string;
  communityNote: string;
}

export interface CommunitySettings {
  enabled: boolean;
  /** `waitlist` shows the join-the-waitlist flow; `live` links straight out. */
  status: 'waitlist' | 'live';
  platform: 'substack' | 'patreon' | 'circle' | 'skool';
  substackUrl?: string;
  waitlistFormAction?: string;
}

export interface SiteSettings {
  siteTitle: string;
  tagline: string;
  defaultDescription: string;
  contactEmail: string;
  guestEmail: string;
  privacyEmail?: string;
  ryanWeb3Key?: string;
  annieWeb3Key?: string;
  launchIso: string;
  newsletter: NewsletterSettings;
  community: CommunitySettings;
  socialUrls: SocialUrls;
}

export const site = siteJson as SiteSettings;

/**
 * True once a real signup endpoint has replaced the placeholder. Components use
 * this to decide between a live form and an honest "opening soon" state, so we
 * never show a form that silently drops addresses.
 */
export const newsletterLive =
  Boolean(site.newsletter?.formAction) &&
  !site.newsletter.formAction.startsWith('PLACEHOLDER');

export const communityWaitlistLive =
  Boolean(site.community?.waitlistFormAction) &&
  !site.community.waitlistFormAction.startsWith('PLACEHOLDER');

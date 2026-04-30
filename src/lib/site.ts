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
  socialUrls: SocialUrls;
}

export const site = siteJson as SiteSettings;

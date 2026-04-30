// RSS feed of blog posts. Lives at /rss.xml in production.
// Feed readers, podcast directories (when we add audio), and AI grounders all
// like to find this — it's a stable, machine-readable index of new content.
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { site as settings } from '../lib/site';

export async function GET(context) {
  const posts = (await getCollection('posts', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

  return rss({
    title: settings.siteTitle,
    description: settings.defaultDescription,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      author: `${settings.contactEmail} (${post.data.author || 'Dr. Ryan DeNome'})`,
      categories: post.data.tags ?? [],
      link: `/blog/${post.id}/`,
    })),
    customData: `<language>en-us</language><copyright>© ${new Date().getFullYear()} Health in the Spirit</copyright>`,
  });
}

# Health in the Spirit

Marketing and podcast site for **Health in the Spirit**, a Catholic health and wellness podcast with Dr. Ryan and Annie DeNome. Holistic health rooted in the Saints, Scripture, and the Catechism.

- **Live site:** https://healthinthespirit.com
- **Stack:** [Astro](https://astro.build) 6 + [Tailwind CSS](https://tailwindcss.com) v4
- **CMS:** [Decap CMS](https://decapcms.org) (GitHub backend) at `/admin`
- **Hosting:** Cloudflare Pages (Node 22)
- **Auth proxy:** Cloudflare Worker (`worker/decap-oauth.js`) for Decap's GitHub OAuth

## Project structure

```text
src/
  components/      Reusable Astro components (Hero, Cards, Footer, etc.)
  content/         Content collections (episodes, saints, posts, pages, settings)
  layouts/         BaseLayout
  lib/             site config + JSON-LD schema helpers
  pages/           Routes (.astro), plus rss.xml.js and /admin
  styles/          global.css (brand palette + Tailwind theme)
public/
  admin/config.yml Decap CMS config
  brand/           Logos and marks
  photos/          Host photography
worker/            Cloudflare Worker: GitHub OAuth proxy for Decap
```

Content authors edit episodes, saints, blog posts, and page copy through `/admin` (Decap CMS), which commits to this repo's `main` branch.

## Commands

| Command            | Action                                                    |
| :----------------- | :-------------------------------------------------------- |
| `npm install`      | Install dependencies                                      |
| `npm run dev`      | Start the dev server at `localhost:4321`                  |
| `npm run dev:cms`  | Dev server + local Decap proxy (edit content at `/admin`) |
| `npm run build`    | Build the production site to `./dist/`                    |
| `npm run preview`  | Preview the production build locally                      |

## Deployment

Pushes to `main` trigger a Cloudflare Pages build. The Decap admin requires the
GitHub OAuth proxy Worker to be deployed with `GITHUB_CLIENT_ID` and
`GITHUB_CLIENT_SECRET` set as Worker secrets. See `worker/decap-oauth.js` and
`public/admin/config.yml`.

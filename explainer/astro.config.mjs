// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import knowledgeSiteEngine from 'knowledge-site-engine/integration';

// `site` is used for canonical URLs: SITE_URL from the deploy environment, or Netlify's URL.
// A placeholder host appears in a deployed page's canonical link when neither is set.
// embed.mjs sets BASE_PATH=/plumbing/ when the website builds the pages.
const site = process.env.SITE_URL || process.env.URL || 'https://clpr.example';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  compressHTML: true,
  devToolbar: { enabled: false },
  integrations: [knowledgeSiteEngine(), mdx()],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    },
  },
});

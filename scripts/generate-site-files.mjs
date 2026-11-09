import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const { siteUrl, pages } = JSON.parse(await readFile(new URL('../site-pages.json', import.meta.url), 'utf8'));
const origin = new URL(siteUrl);
const paths = new Set();
const slugs = new Set();

if (origin.protocol !== 'https:' || origin.pathname !== '/') {
  throw new Error('siteUrl must be an HTTPS origin without a path.');
}
if (!Array.isArray(pages) || pages.length === 0) throw new Error('site-pages.json must define pages.');

for (const page of pages) {
  if (!page.path || !page.slug || !page.title || !page.description || !page.summary || !page.imageAlt || !page.section || !Array.isArray(page.topics) || page.topics.length === 0) {
    throw new Error(`SEO data is incomplete for "${page.slug || page.path || 'unknown page'}".`);
  }
  if (!/^\/(?:[a-z0-9-]+)?$/.test(page.path) || paths.has(page.path) || slugs.has(page.slug)) {
    throw new Error(`Page paths and image slugs must be valid and unique: "${page.path}" / "${page.slug}".`);
  }
  paths.add(page.path);
  slugs.add(page.slug);
}

const publicPages = pages.filter((page) => page.indexable);
const portalPage = pages.find((page) => page.path === '/portal');
if (!portalPage || portalPage.indexable || !publicPages.some((page) => page.path === '/')) {
  throw new Error('The home page must be indexable and the client portal must be present but non-indexable.');
}

const escapeXml = (value) => value.replace(/[<>&'"]/g, (character) => ({
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  "'": '&apos;',
  '"': '&quot;'
})[character]);
const pageUrl = (page) => `${origin.origin}${page.path === '/' ? '' : page.path}`;
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicPages.map((page) => `  <url><loc>${escapeXml(pageUrl(page))}</loc></url>`).join('\n')}\n</urlset>\n`;
const llms = `# TaxFlow AI

> TaxFlow AI is a tax-practice workflow product in development for solo Chartered Accountants. It is designed to help organize client documents and prepare information for professional review.

The current application is a working demo; product descriptions distinguish internal testing from planned capabilities. The desktop app is not yet available to download. Workflow comparisons are qualitative, not measured performance claims. The client portal is invitation-only and is not a public signup page.

## Pages

${publicPages.map((page) => `- [${page.title}](${pageUrl(page)}): ${page.description}\n  Summary: ${page.summary}\n  Topics: ${page.topics.join(', ')}.`).join('\n\n')}

## Additional destination

- [Invited-client portal](${pageUrl(portalPage)}): ${portalPage.description}
  Summary: ${portalPage.summary}
  Topics: ${portalPage.topics.join(', ')}.
`;

await mkdir(resolve('public'), { recursive: true });
await Promise.all([
  writeFile(resolve('public/robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${origin.origin}/sitemap.xml\n`),
  writeFile(resolve('public/sitemap.xml'), sitemap),
  writeFile(resolve('public/llms.txt'), llms)
]);

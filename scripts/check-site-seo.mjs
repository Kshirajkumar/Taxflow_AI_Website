import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const manifest = JSON.parse(await readFile('site-pages.json', 'utf8'));
const vercel = JSON.parse(await readFile('vercel.json', 'utf8'));
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
const robots = await readFile('dist/robots.txt', 'utf8');
const llms = await readFile('dist/llms.txt', 'utf8');
const screenshotHashes = new Set();
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);

assert.ok(robots.includes(`Sitemap: ${manifest.siteUrl}/sitemap.xml`));
assert.ok(!sitemap.includes('/portal'));
assert.equal(sitemapUrls.length, manifest.pages.filter((page) => page.indexable).length);
for (const section of [
  '## Audience and access',
  '## Product status',
  '## Accuracy, safety, and product limits',
  '## Guidance for AI assistants and search agents',
  '## Product and workflow',
  '## Access and policies',
  '## Website navigation'
]) {
  assert.ok(llms.includes(section), `AI-readable guide section: ${section}`);
}
assert.ok(llms.includes('TaxFlow AI does not currently file tax returns'));
assert.ok(llms.includes('not currently available to download'));
assert.ok(llms.includes(`[TaxFlow AI invited-client portal](${manifest.siteUrl}/portal)`));
assert.ok(llms.includes('not publicly specified instead of guessing'));

for (const page of manifest.pages) {
  const routeHtml = page.path === '/'
    ? 'dist/index.html'
    : resolve('dist', page.path.slice(1), 'index.html');
  const html = await readFile(routeHtml, 'utf8');
  const canonicalUrl = `${manifest.siteUrl}${page.path === '/' ? '' : page.path}`;
  const imageUrl = `${manifest.siteUrl}/social/${page.slug}.png`;
  const imagePath = resolve('dist/social', `${page.slug}.png`);
  const meta = {
    title: html.match(/<title>(.*?)<\/title>/)?.[1],
    description: html.match(/<meta name="description" content="([^"]*)" \/>/)?.[1],
    canonical: html.match(/<link rel="canonical" href="([^"]+)" \/>/)?.[1],
    robots: html.match(/<meta name="robots" content="([^"]+)" \/>/)?.[1],
    openGraphTitle: html.match(/<meta property="og:title" content="([^"]*)" \/>/)?.[1],
    openGraphDescription: html.match(/<meta property="og:description" content="([^"]*)" \/>/)?.[1],
    openGraphUrl: html.match(/<meta property="og:url" content="([^"]+)" \/>/)?.[1],
    openGraphImage: html.match(/<meta property="og:image" content="([^"]+)" \/>/)?.[1],
    twitterCard: html.match(/<meta name="twitter:card" content="([^"]+)" \/>/)?.[1]
  };

  assert.equal(meta.title, `${page.title} | TaxFlow AI`, `${page.path} title`);
  assert.equal(meta.description, page.description, `${page.path} description`);
  assert.equal(meta.canonical, canonicalUrl, `${page.path} canonical URL`);
  assert.equal(meta.robots, page.indexable ? 'index, follow, max-image-preview:large' : 'noindex, nofollow', `${page.path} robots`);
  assert.equal(meta.openGraphTitle, page.title, `${page.path} Open Graph title`);
  assert.equal(meta.openGraphDescription, page.description, `${page.path} Open Graph description`);
  assert.equal(meta.openGraphUrl, canonicalUrl, `${page.path} Open Graph URL`);
  assert.equal(meta.openGraphImage, imageUrl, `${page.path} Open Graph screenshot URL`);
  assert.equal(meta.twitterCard, 'summary_large_image', `${page.path} Twitter card`);
  assert.ok(sitemapUrls.includes(canonicalUrl) === page.indexable, `${page.path} sitemap inclusion`);
  await access(imagePath);

  const screenshot = await readFile(imagePath);
  assert.equal(screenshot.toString('hex', 0, 4), '89504e47', `${page.path} PNG signature`);
  assert.equal(screenshot.readUInt32BE(16), 1200, `${page.path} screenshot width`);
  assert.equal(screenshot.readUInt32BE(20), 630, `${page.path} screenshot height`);
  screenshotHashes.add(createHash('sha256').update(screenshot).digest('hex'));

  const jsonLd = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)?.[1];
  assert.ok(jsonLd, `${page.path} JSON-LD`);
  const schema = JSON.parse(jsonLd);
  assert.ok(schema['@graph'].some((entity) => entity['@type'] === 'Organization'));
  const webpage = schema['@graph'].find((entity) => ['WebPage', 'CollectionPage'].includes(entity['@type']));
  assert.equal(webpage.name, page.title);
  assert.equal(webpage.keywords, page.topics.join(', '));

  if (page.path !== '/') {
    assert.ok(
      vercel.rewrites.some((rewrite) => rewrite.source === page.path && rewrite.destination === `${page.path}/index.html`),
      `${page.path} Vercel route rewrite`
    );
  }
  if (page.indexable) {
    assert.ok(llms.includes(`[${page.title}](${canonicalUrl})`), `${page.path} AI-readable index link`);
    for (const topic of page.topics) assert.ok(llms.includes(topic), `${page.path} AI-readable topic: ${topic}`);
  }
  console.log(`Verified ${page.path}: SEO metadata, structured data, sitemap, and actual-page screenshot`);
}

assert.equal(screenshotHashes.size, manifest.pages.length, 'each URL should have its own page screenshot');
assert.ok(await readFile('dist/sitemap/index.html', 'utf8'));
assert.ok((await readFile('dist/sitemap/index.html', 'utf8')).includes('og:title'));
console.log(`Verified ${sitemapUrls.length} indexable sitemap URLs and ${screenshotHashes.size} distinct page screenshots.`);

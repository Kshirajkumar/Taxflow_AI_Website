import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import siteMetadata from './site-pages.json';

function escapeAttribute(value: string) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function socialPageHtml() {
  return {
    name: 'taxflow-social-page-html',
    apply: 'build' as const,
    async closeBundle() {
      const outputDirectory = resolve(process.cwd(), 'dist');
      const { siteUrl, pages } = siteMetadata;
      const template = await readFile(resolve(outputDirectory, 'index.html'), 'utf8');
      const organizationId = `${siteUrl}/#organization`;
      const websiteId = `${siteUrl}/#website`;

      for (const page of pages) {
        const canonicalUrl = `${siteUrl}${page.path === '/' ? '' : page.path}`;
        const imageUrl = `${siteUrl}/social/${page.slug}.png`;
        const escapedTitle = escapeAttribute(page.title);
        const escapedDescription = escapeAttribute(page.description);
        const escapedImageAlt = escapeAttribute(page.imageAlt);
        const schema = {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Organization',
              '@id': organizationId,
              name: 'TaxFlow AI',
              url: siteUrl,
              logo: `${siteUrl}/favicon.svg`
            },
            {
              '@type': 'WebSite',
              '@id': websiteId,
              name: 'TaxFlow AI',
              url: siteUrl,
              publisher: { '@id': organizationId },
              inLanguage: 'en'
            },
            {
              '@type': page.path === '/sitemap' ? 'CollectionPage' : 'WebPage',
              '@id': `${canonicalUrl}#webpage`,
              name: page.title,
              description: page.description,
              url: canonicalUrl,
              isPartOf: { '@id': websiteId },
              publisher: { '@id': organizationId },
              inLanguage: 'en',
              keywords: page.topics.join(', '),
              about: page.topics.map((topic: string) => ({ '@type': 'Thing', name: topic })),
              primaryImageOfPage: {
                '@type': 'ImageObject',
                contentUrl: imageUrl,
                width: 1200,
                height: 630,
                caption: page.imageAlt
              },
              ...(page.path === '/sitemap' && {
                mainEntity: {
                  '@type': 'ItemList',
                  itemListElement: pages
                    .filter((item: { path: string }) => item.path !== '/sitemap')
                    .map((item: { path: string; title: string }, index: number) => ({
                      '@type': 'ListItem',
                      position: index + 1,
                      name: item.title,
                      url: `${siteUrl}${item.path === '/' ? '' : item.path}`
                    }))
                }
              })
            }
          ]
        };
        const structuredData = JSON.stringify(schema).replace(/</g, '\\u003c');
        const html = template
          .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapedTitle} | TaxFlow AI</title>`)
          .replace(/<meta\s+name="description"[\s\S]*?\/>/, `<meta name="description" content="${escapedDescription}" />`)
          .replace(
            '</head>',
            `  <link rel="canonical" href="${canonicalUrl}" />
  <meta name="robots" content="${page.indexable ? 'index, follow, max-image-preview:large' : 'noindex, nofollow'}" />
  <meta name="author" content="TaxFlow AI" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="TaxFlow AI" />
  <meta property="og:title" content="${escapedTitle}" />
  <meta property="og:description" content="${escapedDescription}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:secure_url" content="${imageUrl}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${escapedImageAlt}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapedTitle}" />
  <meta name="twitter:description" content="${escapedDescription}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <meta name="twitter:image:alt" content="${escapedImageAlt}" />
  <script type="application/ld+json">${structuredData}</script>
</head>`
          );
        const filePath = page.path === '/'
          ? resolve(outputDirectory, 'index.html')
          : resolve(outputDirectory, page.path.slice(1), 'index.html');

        await mkdir(dirname(filePath), { recursive: true });
        await writeFile(filePath, html);
      }
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), socialPageHtml()],
    define: {
      __SUPABASE_URL__: JSON.stringify(env.SUPABASE_URL ?? ''),
      __SUPABASE_ANON_KEY__: JSON.stringify(env.SUPABASE_ANON_KEY ?? ''),
      __API_URL__: JSON.stringify(env.API_URL ?? '')
    },
    server: {
      port: 5174,
      strictPort: true
    }
  };
});

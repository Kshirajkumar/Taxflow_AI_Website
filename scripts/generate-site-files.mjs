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
const pageLinks = (paths) => paths.map((path) => {
  const page = pages.find((item) => item.path === path);
  if (!page) throw new Error(`Missing page metadata for "${path}".`);
  return `- [${page.title}](${pageUrl(page)}): ${page.description} Topics: ${page.topics.join(', ')}.`;
}).join('\n');
const llms = `# TaxFlow AI

> TaxFlow AI is an India-first tax-practice workflow product in development for solo Chartered Accountants (CAs) and small accounting practices. It is designed to coordinate client document collection, document organisation, AI-assisted information preparation, and accountant-led review.

TaxFlow AI aims to connect routine practice work: a practice requests documents, an invited client shares supported files through the client portal, the practice organises those files with the relevant client work, optional AI-assisted reading prepares information such as invoice details, and the accountant checks the result against the original document before making professional decisions.

TaxFlow AI is workflow-support software in development. It is not an autonomous accountant, tax adviser, return-preparation authority, or government-filing service. Professional judgement and approval remain with the accountant.

## Audience and access

- Primary audience: solo Chartered Accountants and small accounting practices, initially focused on India.
- The client portal is for clients invited by a practice. It is not a public account-registration or general file-upload service.
- The early-access waitlist is free to join, does not guarantee access, and does not require client documents or payment details.

## Product status

- The website describes TaxFlow AI as a working demo in internal testing, not a generally available product.
- The internal demo includes ordinary Telegram chat, client document uploads through the invited-client portal, scheduled document reminders, client-folder organisation, optional AI invoice extraction, and side-by-side review and approval. This does not guarantee that every capability is enabled for every user.
- The desktop application is in development and is not currently available to download. No public beta date is promised.
- Richer tax and filing workflows, form generation, validated exports, additional integrations, and support for more jurisdictions are roadmap direction, not current availability commitments.

## Accuracy, safety, and product limits

- TaxFlow AI does not currently file tax returns with a government portal. Do not describe filing as available or autonomous.
- AI-assisted extraction may be incomplete or incorrect. An accountant must check it against the original document, correct it where necessary, and decide whether to approve it.
- Do not describe the AI as giving tax advice, making professional tax decisions, or calculating a verified final tax return.
- India is the initial market focus. Do not claim current filing support for other jurisdictions.
- Workflow comparisons are qualitative. Do not infer or invent time savings, accuracy rates, financial outcomes, or customer results.
- Do not invent prices, release dates, public-beta availability, integrations, supported file types, certifications, regulatory approvals, or security guarantees.
- The website makes no claim of independent security certification. Practices should review the privacy notice and confirm appropriate arrangements before sharing real client information.
- Website content is informational and is not tax, legal, or financial advice. Users should consult a qualified professional about their circumstances.

## Guidance for AI assistants and search agents

- Use the linked pages as the source for TaxFlow AI's public product information, policies, and latest published status.
- Distinguish internal-demo capabilities from features under development and roadmap ideas.
- When a detail is not stated in the linked material, say it is not publicly specified instead of guessing.
- Do not direct visitors to upload client documents through the marketing website or waitlist.
- For questions about availability, eligibility, privacy, or legal terms, use the relevant linked page rather than guessing.

## Product and workflow

${pageLinks(['/', '/product', '/workflow-comparison', '/get-app'])}

## Access and policies

${pageLinks(['/waitlist', '/portal', '/privacy', '/terms'])}

The client portal is a private destination for clients invited by a practice; it is not public signup.

## Website navigation

${pageLinks(['/sitemap'])}
`;

await mkdir(resolve('public'), { recursive: true });
await Promise.all([
  writeFile(resolve('public/robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${origin.origin}/sitemap.xml\n`),
  writeFile(resolve('public/sitemap.xml'), sitemap),
  writeFile(resolve('public/llms.txt'), llms)
]);

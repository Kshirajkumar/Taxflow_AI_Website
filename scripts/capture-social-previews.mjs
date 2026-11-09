import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { preview } from 'vite';

const { pages } = JSON.parse(await readFile(new URL('../site-pages.json', import.meta.url), 'utf8'));
const outputDirectory = resolve('public/social');
const server = await preview({
  preview: { host: '127.0.0.1', port: 0, strictPort: false }
});
let browser;

try {
  const address = server.httpServer.address();
  if (!address || typeof address === 'string') throw new Error('Vite preview did not bind to a local port.');
  const baseUrl = `http://127.0.0.1:${address.port}`;
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
    reducedMotion: 'reduce'
  });
  await context.addInitScript(() => localStorage.setItem('taxflow_website_theme', 'light'));
  await mkdir(outputDirectory, { recursive: true });
  await mkdir(resolve('dist/social'), { recursive: true });

  for (const pageInfo of pages) {
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    const response = await page.goto(`${baseUrl}${pageInfo.path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    if (!response?.ok()) throw new Error(`${pageInfo.path} returned HTTP ${response?.status() ?? 'no response'}.`);
    await page.locator('main').first().waitFor({ state: 'visible', timeout: 15000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
    if (pageErrors.length) throw new Error(`${pageInfo.path} browser errors: ${pageErrors.join('; ')}`);
    const screenshotPath = resolve(outputDirectory, `${pageInfo.slug}.png`);
    await page.screenshot({ path: screenshotPath, type: 'png', animations: 'disabled' });
    await page.close();

    const screenshot = await readFile(screenshotPath);
    const width = screenshot.readUInt32BE(16);
    const height = screenshot.readUInt32BE(20);
    if (width !== 1200 || height !== 630) {
      throw new Error(`Screenshot for ${pageInfo.path} must be 1200×630; received ${width}×${height}.`);
    }
    await copyFile(screenshotPath, resolve('dist/social', `${pageInfo.slug}.png`));
    console.log(`Captured ${pageInfo.path} at ${screenshotPath}`);
  }
} finally {
  await browser?.close();
  await server.close();
}

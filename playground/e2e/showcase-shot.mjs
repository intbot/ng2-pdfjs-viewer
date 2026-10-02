// Retakes the showcase thumbnail of the live demo (docs-website/static/img/showcase/demo.jpg),
// which shows the hero's download count. Run by the downloads-milestone workflow; locally:
//   node e2e/showcase-shot.mjs
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'node:url';

const OUT = fileURLToPath(new URL('../../docs-website/static/img/showcase/demo.jpg', import.meta.url));

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 820 });
// networkidle0 also covers the hero's fetch of the live count.
await page.goto('https://demo.angularpdf.com/#/', { waitUntil: 'networkidle0' });
const viewer = page.frames().find((f) => f.url().includes('viewer.html'));
await viewer.waitForFunction(() => window.PDFViewerApplication?.pdfDocument && document.querySelector('.page canvas'));
await new Promise((r) => setTimeout(r, 1500)); // let the first page finish painting
await page.screenshot({ path: OUT, type: 'jpeg', quality: 85 });
await browser.close();
console.log('wrote', OUT);

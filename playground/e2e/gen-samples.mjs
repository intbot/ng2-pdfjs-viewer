// Generates license-clean sample PDFs from hand-authored HTML (our own content).
// Output: src/assets/samples/*.pdf   Run: node e2e/gen-samples.mjs
import puppeteer from 'puppeteer';
import { mkdirSync } from 'node:fs';

const OUT = 'C:/Code/ng2-pdfjs-viewer/playground/src/assets/samples';
mkdirSync(OUT, { recursive: true });

const base = `
  body { font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; color: #1a1f29; margin: 0; }
  .page { padding: 54px 60px; page-break-after: always; }
  h1 { font-size: 30px; margin: 0 0 6px; letter-spacing: -0.5px; }
  h2 { font-size: 19px; margin: 26px 0 8px; color: #4338ca; }
  p { line-height: 1.65; font-size: 13.5px; color: #344; }
  .muted { color: #8a93a3; } .lead { font-size: 15px; color: #475; }
`;

const lorem = (n) =>
  Array.from({ length: n }, () =>
    'The ng2-pdfjs-viewer component wraps Mozilla PDF.js to deliver a fast, accessible, ' +
    'mobile-first PDF experience in Angular applications with a fully declarative API.',
  ).join(' ');

const DOCS = {
  // multi-page, text-heavy — great for search / scroll / text selection
  'product-guide.pdf': `<style>${base}</style>
    <div class="page">
      <h1>ng2-pdfjs-viewer — Product Guide</h1>
      <p class="lead">A sample document generated for the feature playground. Try the search tool (⌕) for the word <b>“declarative”</b>, switch scroll modes, or select text.</p>
      <h2>1. Introduction</h2><p>${lorem(3)}</p>
      <h2>2. Installation</h2><p>${lorem(3)}</p>
      <h2>3. Declarative inputs</h2><p>${lorem(4)}</p>
    </div>
    <div class="page">
      <h1>Chapter Two</h1>
      <h2>4. Events</h2><p>${lorem(3)}</p>
      <h2>5. Theming</h2><p>${lorem(4)}</p>
      <h2>6. Accessibility</h2><p>${lorem(3)}</p>
      <p class="muted">Page 2 of 3 · generated content, no third-party copyright.</p>
    </div>
    <div class="page">
      <h1>Chapter Three</h1>
      <h2>7. Performance</h2><p>${lorem(4)}</p>
      <h2>8. Summary</h2><p>${lorem(3)}</p>
    </div>`,

  // branded table layout — different visual, good for zoom/print
  'invoice.pdf': `<style>${base}
      table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
      th, td { text-align: left; padding: 11px 10px; border-bottom: 1px solid #e6e9f0; }
      th { color: #6b7280; text-transform: uppercase; font-size: 10.5px; letter-spacing: 0.08em; }
      .right { text-align: right; } .total td { font-weight: 700; font-size: 15px; border-top: 2px solid #1a1f29; }
      .brand { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg,#7c5cff,#22d3ee); }
    </style>
    <div class="page">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div class="brand"></div>
        <div style="text-align:right"><h1 style="margin:0">INVOICE</h1><span class="muted">#PG-2026-0042</span></div>
      </div>
      <p class="lead" style="margin-top:24px">Sample invoice · for layout/zoom testing only.</p>
      <table>
        <thead><tr><th>Item</th><th class="right">Qty</th><th class="right">Price</th><th class="right">Total</th></tr></thead>
        <tbody>
          <tr><td>Annual support plan</td><td class="right">1</td><td class="right">$0.00</td><td class="right">$0.00</td></tr>
          <tr><td>Priority issue triage</td><td class="right">12</td><td class="right">$0.00</td><td class="right">$0.00</td></tr>
          <tr><td>Custom theming session</td><td class="right">2</td><td class="right">$0.00</td><td class="right">$0.00</td></tr>
          <tr class="total"><td colspan="3">Total (open source — free!)</td><td class="right">$0.00</td></tr>
        </tbody>
      </table>
    </div>`,

  // CSS graphics / charts — image-heavy feel, good for zoom & rotation
  'infographic.pdf': `<style>${base}
      .bars { display:flex; align-items:flex-end; gap:18px; height:200px; margin:24px 0; }
      .bar { width:54px; border-radius:10px 10px 0 0; background:linear-gradient(180deg,#7c5cff,#22d3ee); }
      .legend { display:flex; gap:18px; flex-wrap:wrap; }
      .pill { padding:8px 14px; border-radius:999px; color:#fff; font-size:12px; font-weight:600; }
      .donut { width:160px; height:160px; border-radius:50%; background:conic-gradient(#7c5cff 0 45%,#22d3ee 45% 72%,#ff8a5c 72% 100%); margin:18px auto; }
    </style>
    <div class="page">
      <h1>Downloads — an infographic</h1>
      <p class="lead">Colorful, image-heavy sample for testing zoom, rotation and rendering.</p>
      <div class="bars">
        <div class="bar" style="height:50%"></div><div class="bar" style="height:72%"></div>
        <div class="bar" style="height:88%"></div><div class="bar" style="height:96%"></div>
        <div class="bar" style="height:100%"></div>
      </div>
      <div class="legend">
        <span class="pill" style="background:#7c5cff">7M+ downloads</span>
        <span class="pill" style="background:#22d3ee">since 2018</span>
        <span class="pill" style="background:#ff8a5c">Angular 10–20</span>
      </div>
      <div class="donut"></div>
    </div>`,
};

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
for (const [file, html] of Object.entries(DOCS)) {
  const page = await browser.newPage();
  await page.setContent(`<!doctype html><html><body>${html}</body></html>`, { waitUntil: 'networkidle0' });
  await page.pdf({ path: `${OUT}/${file}`, format: 'A4', printBackground: true, margin: { top: '0', bottom: '0', left: '0', right: '0' } });
  console.log('wrote', file);
  await page.close();
}
await browser.close();
console.log('done →', OUT);

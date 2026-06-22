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

  // brand trust infographic — our own stats + identity; gradients/cards good for zoom & rotation
  'infographic.pdf': `<style>${base}
      .ig { padding: 60px 64px; }
      .ighead { display:flex; align-items:center; gap:18px; }
      .igmark { width:66px; height:66px; flex:none; }
      .igtitle { font-size:32px; font-weight:850; letter-spacing:-.6px; color:#15181f; line-height:1.05; }
      .igtitle .one { background:linear-gradient(120deg,#E40035,#9717E7); -webkit-background-clip:text; background-clip:text; color:transparent; }
      .igsub { color:#6b7280; font-size:15px; margin-top:4px; }
      .igchip { display:inline-block; margin-top:18px; background:#f7f5ff; border:1px solid #e7deff; border-radius:9px; padding:10px 16px; font-family:'JetBrains Mono',ui-monospace,Consolas,monospace; font-size:14px; }
      .igchip .pkg { color:#6C00F5; font-weight:700; } .igchip .p { color:#b6a3e0; } .igchip .cmd { color:#6b7280; }
      .ighero { font-size:108px; font-weight:850; letter-spacing:-3px; line-height:1; color:#15181f; margin:34px 0 0; }
      .igherol { color:#475; font-size:16px; margin-top:6px; }
      .igcards { display:flex; gap:16px; margin-top:34px; }
      .igcard { flex:1; border:1px solid #eceef3; border-radius:16px; padding:18px 20px; }
      .igcard .n { font-size:30px; font-weight:800; color:#15181f; }
      .igcard .l { color:#6b7280; font-size:13px; margin-top:4px; }
      .igfeat { margin-top:34px; color:#344; font-size:14px; line-height:1.75; }
      .igfoot { margin-top:38px; color:#9aa3b2; font-size:11.5px; border-top:1px solid #eef0f4; padding-top:16px; }
    </style>
    <div class="ig">
      <div class="ighead">
        <svg class="igmark" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="ig" x1="0" y1="0" x2=".55" y2="1"><stop offset="0" stop-color="#E40035"/><stop offset=".24" stop-color="#F60A48"/><stop offset=".352" stop-color="#F20755"/><stop offset=".494" stop-color="#DC087D"/><stop offset=".745" stop-color="#9717E7"/><stop offset="1" stop-color="#6C00F5"/></linearGradient></defs><path d="M28 12 H56 L74 30 V80 A4 4 0 0 1 70 84 H28 A4 4 0 0 1 24 80 V16 A4 4 0 0 1 28 12 Z" fill="url(#ig)"/><path d="M56 12 V26 A4 4 0 0 0 60 30 H74 Z" fill="#fff" fill-opacity=".4"/><path d="M40 12 H50 V34 L45 29 L40 34 Z" fill="#fff" fill-opacity=".9"/><text x="49" y="73" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="17" fill="#fff" letter-spacing="-.5">PDF</text></svg>
        <div>
          <div class="igtitle"><span class="one">#1</span> Angular PDF Viewer</div>
          <div class="igsub">AI-enabled, feature-rich and comprehensive</div>
        </div>
      </div>
      <span class="igchip"><span class="p">$</span> <span class="cmd">npm i</span> <span class="pkg">ng2-pdfjs-viewer</span></span>
      <div class="ighero">8.3M+</div>
      <div class="igherol">downloads and counting</div>
      <div class="igcards">
        <div class="igcard"><div class="n">0</div><div class="l">runtime dependencies</div></div>
        <div class="igcard"><div class="n">8 yrs</div><div class="l">shipping since 2018</div></div>
        <div class="igcard"><div class="n">10 &rarr; 22</div><div class="l">Angular versions</div></div>
      </div>
      <div class="igfeat"><b>Everything in one component:</b> view &middot; print &middot; search &middot; annotate &amp; sign &middot; fill forms &middot; read aloud &middot; organize pages &middot; zoom &middot; rotate &middot; theme &mdash; fully declarative, mobile-first, production-ready.</div>
      <div class="igfoot">npmjs.com/package/ng2-pdfjs-viewer &middot; Apache-2.0 (Commons Clause) &middot; powered by Mozilla PDF.js</div>
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

// Writes dist/sbom.json (CycloneDX 1.5) listing what ships inside the package: the bundled
// PDF.js, its sub-components, and the core-js polyfills compiled into pdf.mjs/pdf.worker.mjs.
// `npm sbom` can't see these because they aren't npm dependencies.
import { readFileSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const pdfjs = readFileSync('pdfjs/build/pdf.mjs', 'utf8').match(/const version = "([^"]+)"/)[1];
const coreJs = JSON.parse(readFileSync('node_modules/core-js/package.json', 'utf8')).version;

// Sub-component revisions come from mozilla/pdf.js external/ at this PDF.js tag. They change
// when PDF.js changes, so the build stops until they are rechecked for the new version.
const SUBCOMPONENTS_FOR = '6.4.299';
if (pdfjs !== SUBCOMPONENTS_FOR) {
  throw new Error(`scripts/sbom.mjs lists PDF.js ${SUBCOMPONENTS_FOR} sub-components but pdfjs/ is ${pdfjs}; update them from mozilla/pdf.js external/ at v${pdfjs}`);
}
const lic = (id) => [{ license: { id } }];
const sub = [
  { name: 'openjpeg', version: '8314119b067c0fc77834731168daaebd379fdb12', purl: 'pkg:github/uclouvain/openjpeg@8314119b067c0fc77834731168daaebd379fdb12',
    licenses: lic('BSD-2-Clause'), description: 'JPEG 2000 decoder, built to WebAssembly by mozilla/pdf.js.openjpeg', path: 'pdfjs/web/wasm/openjpeg.wasm' },
  { name: 'pdfium-jbig2', version: 'bb1f9f71', purl: 'pkg:generic/pdfium@bb1f9f71?vcs_url=https://pdfium.googlesource.com/pdfium',
    licenses: lic('Apache-2.0'), description: 'JBIG2 decoder from PDFium, built to WebAssembly by mozilla/pdf.js.jbig2', path: 'pdfjs/web/wasm/jbig2.wasm' },
  { name: 'qcms', purl: 'pkg:github/FirefoxGraphics/qcms',
    licenses: lic('MIT'), description: 'Colour management, built to WebAssembly by mozilla/pdf.js.qcms', path: 'pdfjs/web/wasm/qcms_bg.wasm' },
  { name: 'quickjs', version: '3d5e064e9dd67c70f7962836505a7fa067bf0a4e', purl: 'pkg:generic/quickjs@3d5e064e9dd67c70f7962836505a7fa067bf0a4e',
    licenses: lic('MIT'), description: 'JavaScript engine for the AcroForm scripting sandbox, built by mozilla/pdf.js.quickjs', path: 'pdfjs/web/wasm/quickjs-eval.wasm' },
  { name: 'foxit-standard-fonts', purl: 'pkg:generic/pdfium-foxit-fonts',
    licenses: lic('BSD-3-Clause'), description: 'Standard 14 fallback fonts from PDFium', path: 'pdfjs/web/standard_fonts/Foxit*.pfb' },
  { name: 'liberation-sans', version: '1.07.4', purl: 'pkg:generic/liberation-fonts@1.07.4',
    licenses: [{ license: { name: 'Liberation font licence 1.x (GPL-2.0 with font exception)', url: 'https://fedoraproject.org/wiki/Licensing/LiberationFontLicense' } }],
    description: 'Fallback fonts for XFA forms', path: 'pdfjs/web/standard_fonts/LiberationSans-*.ttf' },
].map(({ path, ...c }) => ({ type: c.name.includes('font') || c.name.startsWith('liberation') ? 'file' : 'library', 'bom-ref': c.name, ...c,
  properties: [{ name: 'ng2-pdfjs-viewer:path', value: path }] }));

const self = `pkg:npm/${pkg.name}@${pkg.version}`;
const bom = {
  bomFormat: 'CycloneDX',
  specVersion: '1.5',
  serialNumber: `urn:uuid:${randomUUID()}`,
  version: 1,
  metadata: {
    timestamp: new Date().toISOString(),
    component: { type: 'library', 'bom-ref': self, name: pkg.name, version: pkg.version, purl: self, licenses: lic(pkg.license) },
  },
  components: [
    { type: 'library', 'bom-ref': 'pdf.js', group: 'mozilla', name: 'pdf.js', version: pdfjs, purl: `pkg:github/mozilla/pdf.js@v${pdfjs}`,
      licenses: lic('Apache-2.0'), description: 'PDF rendering engine and viewer, vendored from the official pdfjs-dist release zip',
      externalReferences: [{ type: 'distribution', url: `https://github.com/mozilla/pdf.js/releases/download/v${pdfjs}/pdfjs-${pdfjs}-dist.zip` }],
      properties: [{ name: 'ng2-pdfjs-viewer:path', value: 'pdfjs/' }],
      components: sub },
    { type: 'library', 'bom-ref': 'core-js', name: 'core-js', version: coreJs, purl: `pkg:npm/core-js@${coreJs}`, licenses: lic('MIT'),
      description: 'Polyfills compiled into the bundled pdf.mjs and pdf.worker.mjs (see src/polyfill.js)',
      properties: [{ name: 'ng2-pdfjs-viewer:path', value: 'pdfjs/build/pdf.mjs, pdfjs/build/pdf.worker.mjs' }] },
  ],
  dependencies: [{ ref: self, dependsOn: ['pdf.js', 'core-js'] }, { ref: 'pdf.js', dependsOn: sub.map((c) => c['bom-ref']) }],
};
writeFileSync('dist/sbom.json', JSON.stringify(bom, null, 2) + '\n');
console.log(`dist/sbom.json: ${pkg.name}@${pkg.version}, PDF.js ${pdfjs}, core-js ${coreJs}`);

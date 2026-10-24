# Bill of Materials — ng2-pdfjs-viewer

A component and license inventory of the **published npm package** `ng2-pdfjs-viewer`.

| | |
| --- | --- |
| **Package** | `ng2-pdfjs-viewer` |
| **Version** | 26.5.0 |
| **License** | Apache-2.0 |
| **Runtime npm dependencies** | **none** (zero) |
| **Peer dependencies** | `@angular/common` `>=10`, `@angular/core` `>=10` |
| **Distribution** | FESM2022 (ng-packagr) + bundled PDF.js assets under `pdfjs/` |

> Since 26.5.0 the package ships a machine-readable CycloneDX 1.5 SBOM, `sbom.json`, written
> by `lib/scripts/sbom.mjs` on every build. It lists the bundled PDF.js and its sub-components
> (section 1), which `npm sbom` can't see because they aren't npm dependencies. For the
> build-time dependency graph, run `npm sbom --sbom-format cyclonedx` from `lib/`.

## 1. Bundled third-party components (ship inside the package)

The package vendors Mozilla **PDF.js** and its native sub-components under `pdfjs/`. These are
*not* npm dependencies — they ship as package assets. License texts are included alongside them
(`pdfjs/LICENSE`, `pdfjs/web/**/LICENSE_*`).

| Component | Role | License (as bundled) |
| --- | --- | --- |
| Mozilla **PDF.js** 6.4.299 | PDF rendering engine + viewer UI | Apache-2.0 |
| **OpenJPEG** `8314119b` (`openjpeg.wasm`) | JPEG 2000 image decoding | BSD-2-Clause |
| **QCMS** (`qcms_bg.wasm`) | Color management | MIT |
| **JBIG2** from PDFium `bb1f9f71` (`jbig2.wasm`) | JBIG2 image decoding | Apache-2.0 |
| **QuickJS** `3d5e064e` (`quickjs-eval.wasm`) | Sandboxed JS for AcroForm scripting | MIT |
| **Foxit** standard fonts (`Foxit*.pfb`) | Standard 14 fallback fonts | BSD-3-Clause (PDFium) |
| **Liberation Sans** 1.07.4 (`LiberationSans-*.ttf`) | Fallback fonts for XFA forms | Liberation font licence 1.x: GPL-2.0 with a font exception |
| **core-js** 3.49.0 | Polyfills compiled into `pdf.mjs` and `pdf.worker.mjs` (`lib/src/polyfill.js`) | MIT |

The Liberation Sans files are the only copyleft component. Their licence's font exception
means a document that embeds the font isn't covered by the GPL; the files themselves stay
under it, so redistributing a modified copy of them follows the GPL's terms.

## 2. Runtime dependencies

**None.** `dependencies` in `package.json` is empty. The package adds **zero transitive npm
supply chain** to a consuming application; the only third-party code it carries is what section 1 lists:
PDF.js, its sub-components and the core-js polyfills compiled into it. Angular is a *peer* dependency (provided by the host app), not bundled.

## 3. Build-time dependencies (NOT shipped)

Used only to build and test the package; never installed by consumers. Key entries
(`devDependencies`): `ng-packagr` ^22, `@angular/compiler-cli` ^22, `typescript` ~6.0,
`esbuild` ^0.28 (CSS minify), `terser` (JS minify), `shx`, `vitest` ^4, `jsdom`. The full
build graph is 236 components (see the CycloneDX SBOM above).

## 4. Consumer / supply-chain impact

- Because the published package has **no runtime npm dependencies**, security advisories against
  this repository's `docs-website/` and `playground/` (non-shipped) projects, or against the
  library's build-time `devDependencies`, **do not reach consumers** of the npm package.
- Supply-chain provenance: releases are published with **npm provenance** (OIDC trusted
  publishing from GitHub Actions) and tracked by an **OpenSSF Scorecard**.

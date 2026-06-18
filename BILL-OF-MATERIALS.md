# Bill of Materials — ng2-pdfjs-viewer

A component and license inventory of the **published npm package** `ng2-pdfjs-viewer`.

| | |
| --- | --- |
| **Package** | `ng2-pdfjs-viewer` |
| **Version** | 26.0.1 |
| **License** | Apache-2.0 WITH Commons-Clause |
| **Runtime npm dependencies** | **none** (zero) |
| **Peer dependencies** | `@angular/common` `>=10`, `@angular/core` `>=10` |
| **Distribution** | FESM2022 (ng-packagr) + bundled PDF.js assets under `pdfjs/` |

> Generated from `lib/` on the `master` branch. The machine-readable CycloneDX 1.5 SBOM
> (full dependency graph, 236 components incl. build-time deps) can be regenerated at any time
> with `npm sbom --sbom-format cyclonedx` from `lib/`.

## 1. Bundled third-party components (ship inside the package)

The package vendors Mozilla **PDF.js** and its native sub-components under `pdfjs/`. These are
*not* npm dependencies — they ship as package assets. License texts are included alongside them
(`pdfjs/LICENSE`, `pdfjs/web/**/LICENSE_*`).

| Component | Role | License (as bundled) |
| --- | --- | --- |
| Mozilla **PDF.js** 6.0.227 | PDF rendering engine + viewer UI | Apache-2.0 |
| **OpenJPEG** (`openjpeg.wasm`) | JPEG 2000 image decoding | BSD-2-Clause |
| **QCMS** (`qcms_bg.wasm`) | Color management | MIT (Mozilla / Marti Maria) |
| **JBIG2** (`jbig2.wasm`) | JBIG2 image decoding | BSD-3-Clause (PDFium) |
| **QuickJS** (`quickjs-eval.wasm`) | Sandboxed JS for AcroForm scripting | MIT |
| **Foxit** standard fonts | Fallback fonts | BSD-3-Clause (PDFium) |
| **Liberation** fonts (Arimo/Tinos/Cousine) | Fallback fonts | SIL OFL 1.1 |

## 2. Runtime dependencies

**None.** `dependencies` in `package.json` is empty. The package adds **zero transitive npm
supply chain** to a consuming application; the only third-party code it carries is the bundled
PDF.js above. Angular is a *peer* dependency (provided by the host app), not bundled.

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

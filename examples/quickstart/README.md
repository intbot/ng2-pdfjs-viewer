# ng2-pdfjs-viewer quickstart

A minimal Angular 22 app that renders a PDF with a single `<ng2-pdfjs-viewer>` tag. It is the
smallest setup that actually works: a standalone bootstrap, one component, and the one piece of
build wiring the viewer needs.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/intbot/ng2-pdfjs-viewer/tree/master/examples/quickstart)
[![Edit in CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/sandbox/github/intbot/ng2-pdfjs-viewer/tree/master/examples/quickstart)

## Run it locally

```bash
npm install
npm start
```

Then open http://localhost:4200.

## What's here

- `src/app/app.component.ts` — a standalone component that imports `PdfJsViewerModule` and
  renders `<ng2-pdfjs-viewer [pdfSrc]="pdfSrc">`. `pdfSrc` points at Mozilla's public
  `tracemonkey-pldi-09.pdf` sample, which is served with permissive CORS headers, so no PDF file
  ships in this repo. Swap it for your own URL or a local `assets/` file.
- `angular.json` — the one critical line is the assets entry that copies the viewer's bundled
  PDF.js into the build output:

  ```json
  {
    "glob": "**/*",
    "input": "node_modules/ng2-pdfjs-viewer/pdfjs",
    "output": "/assets/pdfjs"
  }
  ```

  The component loads the PDF.js viewer from `assets/pdfjs` at runtime. Without this copy step the
  iframe has nothing to load and the viewer stays blank — so keep it when you adapt the config to
  your own project.

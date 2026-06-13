import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      // The component and index re-export the AI helper from the
      // `ng2-pdfjs-viewer/ai` secondary entry point. ng-packagr resolves this
      // at build time; under vitest there is no package self-resolution, so
      // map it to the entry point's source.
      "ng2-pdfjs-viewer/ai": fileURLToPath(new URL("./ai/index.ts", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.spec.ts"],
    // The component imports @angular/core only for decorators/EventEmitter;
    // no TestBed - plain class instantiation with faked injectables. Vitest's
    // oxc transform handles the Angular decorators without extra config.
    globals: false,
  },
});

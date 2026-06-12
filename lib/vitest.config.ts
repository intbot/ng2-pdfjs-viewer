import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["tests/**/*.spec.ts"],
    // The component imports @angular/core only for decorators/EventEmitter;
    // no TestBed - plain class instantiation with faked injectables. Vitest's
    // oxc transform handles the Angular decorators without extra config.
    globals: false,
  },
});

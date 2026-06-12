import { describe, it, expect } from "vitest";
import { FEATURES, featureByRoute } from "../src/app/core/feature-registry";
import { FEATURE_GROUPS } from "../src/app/core/models";

describe("feature registry", () => {
  it("has unique ids and routes", () => {
    const ids = FEATURES.map((f) => f.id);
    const routes = FEATURES.map((f) => f.route);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(routes).size).toBe(routes.length);
  });

  it("only uses declared groups", () => {
    for (const f of FEATURES) {
      expect(FEATURE_GROUPS).toContain(f.group);
    }
  });

  it("every entry has an icon, description, tags and a loader", () => {
    for (const f of FEATURES) {
      expect(f.icon.length, f.id).toBeGreaterThan(0);
      expect(f.description.length, f.id).toBeGreaterThan(10);
      expect(f.tags.length, f.id).toBeGreaterThan(0);
      expect(typeof f.load, f.id).toBe("function");
    }
  });

  it("includes the new feature pages with the 'new' badge", () => {
    const newPages = ["editor", "search", "forms", "ai", "protection", "power", "custom-ui"];
    for (const id of newPages) {
      const page = FEATURES.find((f) => f.id === id);
      expect(page, id).toBeDefined();
      expect(page!.badge, id).toBe("new");
    }
  });

  it("lazily loads every page component without errors", { timeout: 30000 }, async () => {
    for (const f of FEATURES) {
      const cmp = await f.load();
      expect(cmp, f.id).toBeTypeOf("function");
    }
  });

  it("featureByRoute resolves routes and misses gracefully", () => {
    expect(featureByRoute("editor")?.id).toBe("editor");
    expect(featureByRoute("nope")).toBeUndefined();
  });

  it("tags index the key new APIs for the command palette", () => {
    const allTags = FEATURES.flatMap((f) => f.tags);
    for (const tag of [
      "annotationEditor",
      "getAnnotations",
      "search",
      "formData",
      "PdfAiAssistant",
      "contentProtection",
      "customToolbarTpl",
      "enablePageEditing",
    ]) {
      expect(allTags, tag).toContain(tag);
    }
  });
});

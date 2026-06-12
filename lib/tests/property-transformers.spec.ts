import { describe, it, expect } from "vitest";
import { PropertyTransformers } from "../src/utils/PropertyTransformers";

describe("PropertyTransformers", () => {
  describe("transformZoom", () => {
    it("normalizes named zooms to lowercase", () => {
      expect(PropertyTransformers.transformZoom.toViewer("Page-Width")).toBe(
        "page-width"
      );
      expect(PropertyTransformers.transformZoom.toViewer("AUTO")).toBe("auto");
    });

    it("passes numeric strings through unchanged", () => {
      expect(PropertyTransformers.transformZoom.toViewer("1.25")).toBe("1.25");
    });

    it("falls back to auto for empty values", () => {
      expect(PropertyTransformers.transformZoom.toViewer("")).toBe("auto");
    });

    it("converts numeric viewer scales to strings", () => {
      expect(PropertyTransformers.transformZoom.fromViewer(1.5)).toBe("1.5");
      expect(PropertyTransformers.transformZoom.fromViewer("page-fit")).toBe(
        "page-fit"
      );
      expect(PropertyTransformers.transformZoom.fromViewer(undefined)).toBe(
        "auto"
      );
    });
  });

  describe("transformRotation", () => {
    it("normalizes rotations into 0..359", () => {
      expect(PropertyTransformers.transformRotation.toViewer(450)).toBe(90);
      expect(PropertyTransformers.transformRotation.toViewer(-90)).toBe(270);
      expect(PropertyTransformers.transformRotation.toViewer(360)).toBe(0);
    });

    it("defaults non-numeric viewer rotations to 0", () => {
      expect(PropertyTransformers.transformRotation.fromViewer("x")).toBe(0);
      expect(PropertyTransformers.transformRotation.fromViewer(180)).toBe(180);
    });
  });

  describe("mode transforms", () => {
    it("whitelists cursor values with fallback", () => {
      expect(PropertyTransformers.transformCursor.toViewer("HAND")).toBe("hand");
      expect(PropertyTransformers.transformCursor.toViewer("laser")).toBe(
        "select"
      );
    });

    it("maps numeric viewer scroll modes to names", () => {
      expect(PropertyTransformers.transformScroll.fromViewer(1)).toBe(
        "horizontal"
      );
      expect(PropertyTransformers.transformScroll.fromViewer(99)).toBe(
        "vertical"
      );
    });

    it("maps numeric viewer spread modes to names", () => {
      expect(PropertyTransformers.transformSpread.fromViewer(2)).toBe("even");
      expect(PropertyTransformers.transformSpread.toViewer("bogus")).toBe(
        "none"
      );
    });

    it("whitelists page modes", () => {
      expect(PropertyTransformers.transformPageMode.toViewer("Bookmarks")).toBe(
        "bookmarks"
      );
      expect(PropertyTransformers.transformPageMode.toViewer("wat")).toBe(
        "none"
      );
    });
  });
});

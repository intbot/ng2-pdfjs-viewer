import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("bundled PDF.js builds", () => {
  it("keeps the modern and legacy bundles on the same PDF.js build", () => {
    const headers = ["build", "legacy/build"].flatMap((directory) =>
      ["pdf.mjs", "pdf.worker.mjs", "pdf.sandbox.mjs"].map((file) => {
        const source = read(`pdfjs/${directory}/${file}`);
        return source.match(/pdfjsVersion = ([\d.]+)[\s\S]*?pdfjsBuild = (\w+)/)?.slice(1);
      }),
    );

    expect(headers.every(Boolean)).toBe(true);
    expect(new Set(headers.map(String))).toEqual(new Set(["6.0.227,241dbabbf"]));
  });

  it("routes the API, worker, and sandbox bundles together in legacy mode", () => {
    expect(read("pdfjs/web/pdfjs-loader.mjs")).toContain("../legacy/build/pdf.mjs");
    const wrapper = read("pdfjs/web/postmessage-wrapper.js");
    expect(wrapper).toContain("../legacy/build/pdf.worker.mjs");
    expect(wrapper).toContain("../legacy/build/pdf.sandbox.mjs");
  });
});

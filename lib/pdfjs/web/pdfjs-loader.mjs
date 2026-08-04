const legacy = new URLSearchParams(location.search).get("pdfJsBuild") === "legacy";

await import(legacy ? "../legacy/build/pdf.mjs" : "../build/pdf.mjs");
await import("./viewer.mjs");

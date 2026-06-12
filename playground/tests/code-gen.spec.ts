import { describe, it, expect } from "vitest";
import { CodeGenService } from "../src/app/core/services/code-gen.service";
import { CodeBinding } from "../src/app/core/models";

describe("CodeGenService", () => {
  const gen = new CodeGenService();

  it("renders a minimal snippet when nothing diverges from defaults", () => {
    const bindings: CodeBinding[] = [
      { name: "zoom", value: "auto", kind: "string", omitWhen: "auto" },
    ];
    expect(gen.generate(bindings)).toBe(
      `<ng2-pdfjs-viewer [pdfSrc]="pdfSrc"></ng2-pdfjs-viewer>`
    );
  });

  it("renders string, number, boolean, expr and two-way bindings", () => {
    const bindings: CodeBinding[] = [
      { name: "pdfSrc", value: "pdfSrc", kind: "expr" },
      { name: "page", value: 3, kind: "number" },
      { name: "showSpinner", value: false, kind: "boolean" },
      { name: "downloadFileName", value: "report.pdf", kind: "string" },
      { name: "zoom", value: "page-width", kind: "string", twoWay: true },
    ];
    const out = gen.generate(bindings);
    expect(out).toContain(`[pdfSrc]="pdfSrc"`);
    expect(out).toContain(`[page]="3"`);
    expect(out).toContain(`[showSpinner]="false"`);
    expect(out).toContain(`[downloadFileName]="'report.pdf'"`);
    expect(out).toContain(`[(zoom)]="zoom"`);
  });

  it("drops bindings equal to omitWhen but keeps diverging ones", () => {
    const bindings: CodeBinding[] = [
      { name: "a", value: 1, kind: "number", omitWhen: 1 },
      { name: "b", value: 2, kind: "number", omitWhen: 1 },
    ];
    const out = gen.generate(bindings);
    expect(out).not.toContain("[a]");
    expect(out).toContain(`[b]="2"`);
  });

  it("supports custom tags", () => {
    expect(gen.generate([], "my-tag")).toBe(
      `<my-tag [pdfSrc]="pdfSrc"></my-tag>`
    );
  });
});

import { describe, it, expect, vi } from "vitest";
import { PdfJsViewerComponent } from "../src/ng2-pdfjs-viewer.component";

// parseAiCitations is the built-in AI panel's helper that splits an answer
// into plain-text runs and clickable [p.N] page citations. It is private, so
// we exercise it on a plain instance (the component-logic.spec.ts pattern).

function makeComponent(): PdfJsViewerComponent {
  const cdr = { markForCheck: vi.fn(), detectChanges: vi.fn() } as any;
  const appRef = { attachView: vi.fn(), detachView: vi.fn() } as any;
  return new PdfJsViewerComponent(cdr, appRef);
}

function parse(
  comp: PdfJsViewerComponent,
  text: string
): Array<{ text?: string; page?: number }> {
  return (comp as any).parseAiCitations(text);
}

describe("parseAiCitations (AI panel page citations)", () => {
  it("splits a [p.N] citation into a clickable page part", () => {
    const comp = makeComponent();
    expect(parse(comp, "See [p.3] for details.")).toEqual([
      { text: "See " },
      { page: 3 },
      { text: " for details." },
    ]);
  });

  it("accepts the [p3], [p. 12] and uppercase [P.4] variants", () => {
    const comp = makeComponent();
    expect(parse(comp, "a [p3] b [p. 12] c [P.4]")).toEqual([
      { text: "a " },
      { page: 3 },
      { text: " b " },
      { page: 12 },
      { text: " c " },
      { page: 4 },
    ]);
  });

  it("returns a single text part when there are no citations", () => {
    const comp = makeComponent();
    expect(parse(comp, "no citations here")).toEqual([
      { text: "no citations here" },
    ]);
  });

  it("handles back-to-back citations and a leading citation", () => {
    const comp = makeComponent();
    expect(parse(comp, "[p.1][p.2] tail")).toEqual([
      { page: 1 },
      { page: 2 },
      { text: " tail" },
    ]);
  });

  it("emits an empty array for empty input", () => {
    const comp = makeComponent();
    expect(parse(comp, "")).toEqual([]);
  });
});

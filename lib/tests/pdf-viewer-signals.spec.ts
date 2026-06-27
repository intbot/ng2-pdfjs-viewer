import { describe, it, expect } from "vitest";
import { DestroyRef, EventEmitter, Injector } from "@angular/core";
import { pdfViewerSignals, PdfViewerSignalSource } from "../signals";

// toSignal() needs a DestroyRef to tear down its subscription. In a real app that
// comes from the host component's injection context; here we hand it a stub so the
// projection can be exercised without TestBed/zone (matching this suite's style).
function makeInjector(): Injector {
  return Injector.create({
    providers: [{ provide: DestroyRef, useValue: { onDestroy: () => () => {} } }],
  });
}

function makeViewer(): PdfViewerSignalSource {
  return {
    onPageChange: new EventEmitter<number>(),
    onScaleChange: new EventEmitter<number>(),
    onRotationChange: new EventEmitter(),
    onPagesInit: new EventEmitter(),
    onDocumentError: new EventEmitter(),
    onUpdateFindMatchesCount: new EventEmitter(),
    onReadAloudStateChange: new EventEmitter(),
    onAnnotationEditorStateChange: new EventEmitter(),
    annotationEditorChange: new EventEmitter(),
    onSidebarViewChanged: new EventEmitter(),
    onMetadataLoaded: new EventEmitter(),
    onOutlineLoaded: new EventEmitter(),
    formDataChange: new EventEmitter(),
    onPresentationModeChanged: new EventEmitter(),
    zoomChange: new EventEmitter<string>(),
    cursorChange: new EventEmitter<string>(),
    scrollChange: new EventEmitter<string>(),
    spreadChange: new EventEmitter<string>(),
    pageModeChange: new EventEmitter<string>(),
  };
}

describe("pdfViewerSignals", () => {
  it("starts empty: value signals are undefined and loaded is false", () => {
    const viewer = makeViewer();
    const s = pdfViewerSignals(viewer, { injector: makeInjector() });

    expect(s.page()).toBeUndefined();
    expect(s.scale()).toBeUndefined();
    expect(s.totalPages()).toBeUndefined();
    expect(s.findMatches()).toBeUndefined();
    expect(s.loaded()).toBe(false);
  });

  it("reflects the latest value from each source output", () => {
    const viewer = makeViewer();
    const s = pdfViewerSignals(viewer, { injector: makeInjector() });

    viewer.onPageChange.emit(3);
    viewer.onScaleChange.emit(1.25);
    viewer.zoomChange.emit("page-fit");
    viewer.onUpdateFindMatchesCount.emit({ current: 2, total: 9 });

    expect(s.page()).toBe(3);
    expect(s.scale()).toBe(1.25);
    expect(s.zoom()).toBe("page-fit");
    expect(s.findMatches()).toEqual({ current: 2, total: 9 });

    // A second emission replaces the value (signals hold the latest, not a stream).
    viewer.onPageChange.emit(4);
    expect(s.page()).toBe(4);
  });

  it("derives totalPages and loaded from page initialization", () => {
    const viewer = makeViewer();
    const s = pdfViewerSignals(viewer, { injector: makeInjector() });

    expect(s.loaded()).toBe(false);
    expect(s.totalPages()).toBeUndefined();

    viewer.onPagesInit.emit({ pagesCount: 14 });

    expect(s.totalPages()).toBe(14);
    expect(s.loaded()).toBe(true);
  });

  it("exposes structured payloads as-is", () => {
    const viewer = makeViewer();
    const s = pdfViewerSignals(viewer, { injector: makeInjector() });

    viewer.onReadAloudStateChange.emit({ status: "reading", page: 2, sentence: "Hi." });
    viewer.onSidebarViewChanged.emit({ view: "thumbs" });
    viewer.annotationEditorChange.emit("highlight");

    expect(s.readAloud()).toEqual({ status: "reading", page: 2, sentence: "Hi." });
    expect(s.sidebar()).toEqual({ view: "thumbs" });
    expect(s.annotationEditorMode()).toBe("highlight");
  });
});

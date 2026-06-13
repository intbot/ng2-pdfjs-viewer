import { describe, it, expect, vi } from "vitest";
import { EventEmitter } from "@angular/core";
import { PdfJsViewerComponent } from "../src/ng2-pdfjs-viewer.component";

// OnPush / zoneless safety.
//
// A consumer can place <ng2-pdfjs-viewer> inside a ChangeDetectionStrategy.OnPush
// host (or a zoneless app). The viewer's state changes arrive as async postMessage
// notifications from the PDF.js iframe, which run OUTSIDE Angular's change detection.
// For an OnPush/zoneless host to re-render, the component must:
//   1. call cdr.markForCheck() whenever an async message mutates template-bound
//      state (loading overlay, error overlay, security warning, two-way form data), and
//   2. expose @Output()s as EventEmitters that fire synchronously, so a host's
//      (event)="..." binding runs and marks the OnPush host for check.
//
// This exercises the real component as a plain class (no TestBed) with a spy
// ChangeDetectorRef — the same pattern as component-logic.spec.ts.

function makeComponent(): {
  comp: PdfJsViewerComponent;
  markForCheck: ReturnType<typeof vi.fn>;
} {
  const markForCheck = vi.fn();
  const fakeCdr = { markForCheck, detectChanges: vi.fn() } as any;
  const fakeAppRef = { attachView: vi.fn(), detachView: vi.fn() } as any;
  return { comp: new PdfJsViewerComponent(fakeCdr, fakeAppRef), markForCheck };
}

// Route an async state-change notification exactly as the message handler does.
function routeState(comp: PdfJsViewerComponent, property: string, value: unknown): void {
  (comp as any).handleStateChangeNotification({ property, value, source: "viewer" });
}

describe("OnPush safety: async state changes mark the view for check", () => {
  it("loading overlay toggles and marks for check", () => {
    const { comp, markForCheck } = makeComponent();

    routeState(comp, "loading", true);
    expect(comp.isLoading).toBe(true);
    expect(markForCheck).toHaveBeenCalledTimes(1);

    markForCheck.mockClear();
    routeState(comp, "loading", false);
    expect(comp.isLoading).toBe(false);
    expect(markForCheck).toHaveBeenCalledTimes(1);
  });

  it("error overlay state marks for check", () => {
    const { comp, markForCheck } = makeComponent();

    routeState(comp, "error", "Failed to load document");
    expect(comp.hasError).toBe(true);
    expect(comp.currentErrorMessage).toContain("Failed to load document");
    expect(markForCheck).toHaveBeenCalled();
  });

  it("two-way formData sync emits and marks for check, and suppresses the echo", () => {
    const { comp, markForCheck } = makeComponent();
    const emitted: unknown[] = [];
    comp.formDataChange.subscribe((v) => emitted.push(v));

    routeState(comp, "formData", { name: "Ada", subscribed: true });
    expect(emitted).toEqual([{ name: "Ada", subscribed: true }]);
    expect(markForCheck).toHaveBeenCalled();

    // Re-delivering the same value is the echo of our own set-form-data — it
    // must NOT re-emit or schedule another CD pass.
    markForCheck.mockClear();
    routeState(comp, "formData", { name: "Ada", subscribed: true });
    expect(emitted.length).toBe(1);
    expect(markForCheck).not.toHaveBeenCalled();
  });

  it("dismissSecurityWarning() (public API) clears state and marks for check", () => {
    const { comp, markForCheck } = makeComponent();
    (comp as any).securityWarning = { message: "Blocked cross-origin navigation" };

    comp.dismissSecurityWarning();
    expect(comp.securityWarning).toBeNull();
    expect(markForCheck).toHaveBeenCalled();
  });
});

describe("OnPush safety: outputs fire synchronously for (event) bindings", () => {
  it("an event notification reaches its @Output subscriber synchronously", () => {
    const { comp } = makeComponent();
    const seen: unknown[] = [];
    comp.onNamedAction.subscribe((e) => seen.push(e));

    (comp as any).handleEventNotification({
      eventName: "namedAction",
      eventData: { action: "NextPage" },
    });

    // Synchronous delivery: by the next line the host's handler has already run,
    // so Angular has marked the OnPush host for check within the same tick.
    expect(seen).toEqual([{ action: "NextPage" }]);
    expect(comp.onNamedAction).toBeInstanceOf(EventEmitter);
  });
});

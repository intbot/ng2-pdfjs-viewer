import { describe, it, expect, vi } from "vitest";
import {
  PdfJsViewerComponent,
  shallowEquals,
} from "../src/ng2-pdfjs-viewer.component";

// The component is exercised as a plain class - no TestBed. Only the
// injectables actually used by the tested paths are faked.
function makeComponent(): PdfJsViewerComponent {
  const fakeCdr = { markForCheck: vi.fn(), detectChanges: vi.fn() } as any;
  const fakeAppRef = { attachView: vi.fn(), detachView: vi.fn() } as any;
  return new PdfJsViewerComponent(fakeCdr, fakeAppRef);
}

describe("shallowEquals", () => {
  it("treats same-content fresh objects as equal (getter-binding case)", () => {
    expect(shallowEquals({ a: 1, b: "x" }, { a: 1, b: "x" })).toBe(true);
  });

  it("rejects differing values, extra keys, and non-objects", () => {
    expect(shallowEquals({ a: 1 }, { a: 2 })).toBe(false);
    expect(shallowEquals({ a: 1 }, { a: 1, b: 1 })).toBe(false);
    expect(shallowEquals({ a: 1 }, null)).toBe(false);
    expect(shallowEquals("x", "x")).toBe(true); // identity
  });

  it("is shallow: nested objects compare by reference", () => {
    const nested = { x: 1 };
    expect(shallowEquals({ a: nested }, { a: nested })).toBe(true);
    expect(shallowEquals({ a: { x: 1 } }, { a: { x: 1 } })).toBe(false);
  });
});

describe("iframeSandbox allowlist", () => {
  it("accepts allowlisted tokens and exposes them via effectiveSandbox", () => {
    const comp = makeComponent();
    comp.iframeSandbox = "allow-top-navigation allow-presentation";

    expect(comp.iframeSandbox).toBe(
      "allow-top-navigation allow-presentation"
    );
    expect(comp.effectiveSandbox).toContain("allow-forms");
    expect(comp.effectiveSandbox).toContain("allow-popups");
    expect(comp.effectiveSandbox).toContain("allow-top-navigation");
  });

  it("silently drops tokens outside the allowlist (with a console warning)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const comp = makeComponent();

    comp.iframeSandbox =
      "allow-top-navigation allow-pointer-lock javascript:alert(1)";

    expect(comp.iframeSandbox).toBe("allow-top-navigation");
    expect(comp.effectiveSandbox).not.toContain("allow-pointer-lock");
    expect(comp.effectiveSandbox).not.toContain("javascript");
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("allow-pointer-lock")
    );
    warn.mockRestore();
  });

  it("keeps the base sandbox when nothing extra is requested", () => {
    const comp = makeComponent();
    expect(comp.effectiveSandbox).toBe(
      "allow-forms allow-scripts allow-same-origin allow-modals allow-downloads " +
        "allow-popups allow-popups-to-escape-sandbox"
    );
  });
});

describe("viewer URL parameter order (#305)", () => {
  it("appends file last so a hash fragment in the file URL is preserved", () => {
    const comp = makeComponent();
    const url = (comp as any).buildViewerUrl("doc.pdf#search=foo") as string;
    const [query, hash] = url.split("#");

    // The consumer's hash trails the whole URL, untouched - PDF.js reads it.
    expect(hash).toBe("search=foo");
    // Control params stay in the query string (before the hash), not the
    // fragment - so the wrapper's URLSearchParams(location.search) still sees
    // them. file is the final query param.
    const params = new URLSearchParams(query.slice(query.indexOf("?")));
    expect(params.get("urlValidation")).toBe("1");
    expect(params.get("file")).toBe("doc.pdf");
    expect(query.endsWith("&file=doc.pdf")).toBe(true);
  });
});

describe("init-time PDF.js options on the viewer URL", () => {
  function urlOptions(comp: PdfJsViewerComponent): Record<string, unknown> {
    const url = (comp as any).buildViewerUrl("test.pdf") as string;
    const match = url.match(/[?&]pjsOptions=([^&]+)/);
    return match ? JSON.parse(decodeURIComponent(match[1])) : {};
  }

  it("emits no pjsOptions param by default", () => {
    const comp = makeComponent();
    expect(
      ((comp as any).buildViewerUrl("test.pdf") as string).includes(
        "pjsOptions"
      )
    ).toBe(false);
  });

  it("maps the convenience inputs to PDF.js option names", () => {
    const comp = makeComponent();
    comp.enableSignatureEditor = true;
    comp.enableCommentEditor = true;
    comp.enablePageEditing = true;
    comp.pageColors = { background: "#1e1e1e", foreground: "#e8e8e8" };

    expect(urlOptions(comp)).toEqual({
      enableSignatureEditor: true,
      enableComment: true,
      enableMerge: true,
      enableSplitMerge: true,
      enableUpdatedAddImage: true,
      forcePageColors: true,
      pageColorsBackground: "#1e1e1e",
      pageColorsForeground: "#e8e8e8",
    });
  });

  it("merges raw pdfJsOptions, with convenience inputs winning conflicts", () => {
    const comp = makeComponent();
    comp.pdfJsOptions = {
      printResolution: 300,
      enableSignatureEditor: false,
    };
    comp.enableSignatureEditor = true;

    const opts = urlOptions(comp);
    expect(opts["printResolution"]).toBe(300);
    expect(opts["enableSignatureEditor"]).toBe(true);
  });
});

describe("setter-dispatched inputs queue until the viewer is ready", () => {
  it("annotationEditor setter queues a level-5 action and dedupes no-ops", () => {
    const comp = makeComponent();
    const queue = (comp as any).actionQueueManager;

    comp.annotationEditor = "highlight";
    expect(queue.getQueueStatus().queuedActions).toBe(1);

    comp.annotationEditor = "highlight"; // no-op: same mode
    expect(queue.getQueueStatus().queuedActions).toBe(1);

    comp.annotationEditor = "ink";
    expect(queue.getQueueStatus().queuedActions).toBe(2);
    expect(comp.annotationEditor).toBe("ink");
  });

  it("contentProtection setter dispatches protection + visibility + watermark", () => {
    const comp = makeComponent();
    const queue = (comp as any).actionQueueManager;

    comp.contentProtection = {
      blockPrint: true,
      disableTextSelection: true,
      watermark: { text: "CONFIDENTIAL" },
    };

    // set-content-protection, show-print(false), set-watermark
    expect(queue.getQueueStatus().queuedActions).toBe(3);
    expect(comp.contentProtection.blockPrint).toBe(true);
  });

  it("formData setter stores the value for [(formData)] reads", () => {
    const comp = makeComponent();
    comp.formData = { name: "Ada", subscribed: true };
    expect(comp.formData).toEqual({ name: "Ada", subscribed: true });
  });
});

describe("viewerConfig fan-out", () => {
  it("copies config keys onto the individual inputs", () => {
    const comp = makeComponent();
    comp.viewerConfig = {
      useOnlyCssZoom: true,
      externalLinkTarget: "top",
      rememberLastView: false,
    };

    expect(comp.useOnlyCssZoom).toBe(true);
    expect(comp.externalLinkTarget).toBe("top");
    expect(comp.rememberLastView).toBe(false);
  });
});

describe("chromeless preset", () => {
  // Run the real init snapshot and collect the steps of every batched
  // 'configure' message, so we assert the toolbar/sidebar payloads the
  // registry's get-overrides actually emit.
  function configureSteps(comp: PdfJsViewerComponent): any[] {
    const steps: any[] = [];
    vi.spyOn(comp as any, "dispatchAction").mockImplementation(
      (action: string, payload: any) => {
        if (action === "configure") steps.push(...payload);
        return Promise.resolve();
      },
    );
    (comp as any).queueAllConfigurations();
    return steps;
  }
  const payloadOf = (steps: any[], action: string) =>
    steps.find((s) => s.action === action)?.payload;

  it("forces toolbar and sidebar hidden when chromeless is on", () => {
    const comp = makeComponent();
    comp.chromeless = true;
    const steps = configureSteps(comp);
    expect(payloadOf(steps, "show-toolbar")).toBe(false);
    expect(payloadOf(steps, "show-sidebar")).toBe(false);
  });

  it("leaves them visible by default", () => {
    const steps = configureSteps(makeComponent());
    expect(payloadOf(steps, "show-toolbar")).toBe(true);
    expect(payloadOf(steps, "show-sidebar")).toBe(true);
  });

  it("still honors an explicit showToolbar=false on its own", () => {
    const comp = makeComponent();
    comp.showToolbar = false; // chromeless off: the && must keep this hiding
    expect(payloadOf(configureSteps(comp), "show-toolbar")).toBe(false);
  });
});

describe("wrapper event names map to component outputs", () => {
  // The component resolves emitters by reflection ("on" + eventName), so a
  // wrapper-side event whose name has no matching @Output silently drops.
  // This test pins the convention: every sendEventNotification name in the
  // wrapper must resolve to an EventEmitter (or be explicitly special-cased).
  it("every sendEventNotification name has a matching @Output emitter", async () => {
    const { readFileSync } = await import("node:fs");
    const { resolve } = await import("node:path");
    const { EventEmitter } = await import("@angular/core");
    // vitest runs with cwd = lib/ (vitest.config lives there)
    const wrapperPath = resolve(
      process.cwd(),
      "pdfjs/web/postmessage-wrapper.js",
    );
    const src = readFileSync(wrapperPath, "utf8");
    const names = [
      ...new Set(
        [...src.matchAll(/sendEventNotification\('([A-Za-z]+)'/g)].map(
          (m) => m[1],
        ),
      ),
    ];
    expect(names.length).toBeGreaterThan(15);

    // Handled by an explicit branch in handleEventNotification, not reflection
    const specialCased = new Set(["annotationEditorModeChange"]);

    const comp = makeComponent();
    for (const name of names) {
      if (specialCased.has(name)) continue;
      const emitter = (comp as any)[
        "on" + name.charAt(0).toUpperCase() + name.slice(1)
      ];
      expect(emitter, `wrapper event '${name}' has no matching output`)
        .toBeInstanceOf(EventEmitter);
    }
  });
});

describe("sidebar/layers/named-action/document-properties relays", () => {
  it("routes the four new event notifications to their @Output emitters", () => {
    const comp = makeComponent();
    const seen: Record<string, unknown[]> = {
      sidebar: [], layers: [], named: [], props: [],
    };
    comp.onSidebarViewChanged.subscribe((e) => seen.sidebar.push(e));
    comp.onLayersChanged.subscribe((e) => seen.layers.push(e));
    comp.onNamedAction.subscribe((e) => seen.named.push(e));
    comp.onDocumentProperties.subscribe((e) => seen.props.push(e));

    const route = (eventName: string, eventData: unknown) =>
      (comp as any).handleEventNotification({ eventName, eventData });

    route("sidebarViewChanged", { view: "outline" });
    route("layersChanged", { reason: "loaded", layersCount: 3 });
    route("layersChanged", { reason: "changed" });
    route("namedAction", { action: "NextPage" });
    route("documentProperties", {});

    expect(seen.sidebar).toEqual([{ view: "outline" }]);
    expect(seen.layers).toEqual([
      { reason: "loaded", layersCount: 3 },
      { reason: "changed" },
    ]);
    expect(seen.named).toEqual([{ action: "NextPage" }]);
    expect(seen.props.length).toBe(1);
  });
});

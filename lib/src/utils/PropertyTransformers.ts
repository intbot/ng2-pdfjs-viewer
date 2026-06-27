// Property normalization between component inputs and PDF.js viewer values

// Mode/name lists shared by the to- and from-viewer transforms. PDF.js encodes
// scroll and spread modes as integer enums, so for those the array index is the
// enum value and the order here doubles as the numeric->name map (keep it in
// sync with PDF.js). Declaring each list once keeps the input whitelist and the
// index map from drifting apart, and hoisting them to module scope avoids
// re-allocating the array on every viewer state-sync event.
const ZOOM_NAMES: readonly string[] = [
  "auto",
  "page-fit",
  "page-width",
  "page-actual",
];
const CURSOR_MODES: readonly string[] = ["select", "hand", "zoom"];
const SCROLL_MODES: readonly string[] = [
  "vertical",
  "horizontal",
  "wrapped",
  "page",
];
const SPREAD_MODES: readonly string[] = ["none", "odd", "even"];
const PAGE_MODES: readonly string[] = [
  "none",
  "thumbs",
  "bookmarks",
  "attachments",
];

// Lowercase + whitelist with fallback
const pick = (
  value: string | null | undefined,
  allowed: readonly string[],
  fallback: string,
): string => {
  const v = value ? value.toLowerCase() : "";
  return allowed.includes(v) ? v : fallback;
};

export class PropertyTransformers {
  static transformZoom = {
    toViewer: (zoom: string): string => {
      if (!zoom) return "auto";
      const v = zoom.toLowerCase();
      // Named zooms normalize to lowercase; numeric strings pass through
      return ZOOM_NAMES.includes(v) ? v : zoom;
    },

    fromViewer: (viewerZoom: any): string => {
      if (typeof viewerZoom === "string") return viewerZoom;
      // Numeric scale as a plain string ("1.25") - PDF.js accepts it directly
      if (typeof viewerZoom === "number") return viewerZoom.toString();
      return "auto";
    },
  };

  static transformRotation = {
    toViewer: (rotation: number): number => ((rotation % 360) + 360) % 360,

    fromViewer: (viewerRotation: any): number =>
      typeof viewerRotation === "number" ? viewerRotation : 0,
  };

  static transformCursor = {
    toViewer: (cursor: string): string => pick(cursor, CURSOR_MODES, "select"),

    fromViewer: (viewerCursor: any): string =>
      typeof viewerCursor === "string" ? viewerCursor : "select",
  };

  static transformScroll = {
    toViewer: (scroll: string): string => pick(scroll, SCROLL_MODES, "vertical"),

    fromViewer: (viewerScroll: any): string => {
      if (typeof viewerScroll === "number") {
        return SCROLL_MODES[viewerScroll] || "vertical";
      }
      return typeof viewerScroll === "string" ? viewerScroll : "vertical";
    },
  };

  static transformSpread = {
    toViewer: (spread: string): string => pick(spread, SPREAD_MODES, "none"),

    fromViewer: (viewerSpread: any): string => {
      if (typeof viewerSpread === "number") {
        return SPREAD_MODES[viewerSpread] || "none";
      }
      return typeof viewerSpread === "string" ? viewerSpread : "none";
    },
  };

  static transformPageMode = {
    toViewer: (pageMode: string): string => pick(pageMode, PAGE_MODES, "none"),

    fromViewer: (viewerPageMode: any): string =>
      typeof viewerPageMode === "string" ? viewerPageMode : "none",
  };
}

// Property normalization between component inputs and PDF.js viewer values

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
      return ["auto", "page-fit", "page-width", "page-actual"].includes(v)
        ? v
        : zoom;
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
    toViewer: (cursor: string): string =>
      pick(cursor, ["select", "hand", "zoom"], "select"),

    fromViewer: (viewerCursor: any): string =>
      typeof viewerCursor === "string" ? viewerCursor : "select",
  };

  static transformScroll = {
    toViewer: (scroll: string): string =>
      pick(scroll, ["vertical", "horizontal", "wrapped", "page"], "vertical"),

    fromViewer: (viewerScroll: any): string => {
      const modes = ["vertical", "horizontal", "wrapped", "page"];
      if (typeof viewerScroll === "number") {
        return modes[viewerScroll] || "vertical";
      }
      return typeof viewerScroll === "string" ? viewerScroll : "vertical";
    },
  };

  static transformSpread = {
    toViewer: (spread: string): string =>
      pick(spread, ["none", "odd", "even"], "none"),

    fromViewer: (viewerSpread: any): string => {
      const modes = ["none", "odd", "even"];
      if (typeof viewerSpread === "number") {
        return modes[viewerSpread] || "none";
      }
      return typeof viewerSpread === "string" ? viewerSpread : "none";
    },
  };

  static transformPageMode = {
    toViewer: (pageMode: string): string =>
      pick(pageMode, ["none", "thumbs", "bookmarks", "attachments"], "none"),

    fromViewer: (viewerPageMode: any): string =>
      typeof viewerPageMode === "string" ? viewerPageMode : "none",
  };
}

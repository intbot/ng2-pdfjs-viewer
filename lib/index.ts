export * from "./src/ng2-pdfjs-viewer.module";
export * from "./src/ng2-pdfjs-viewer.component";

// Export types that are needed by consumer applications
export {
  ChangedScale,
  ChangedRotation,
  ControlVisibilityConfig,
  AutoActionConfig,
  ErrorConfig,
  ViewerConfig,
  ThemeConfig,
  GroupVisibilityConfig,
  LayoutConfig,
  ToolbarDensity,
  ToolbarPosition,
  SidebarPosition,
  // New event data interfaces
  DocumentError,
  PagesInfo,
  PresentationMode,
  FindOperation,
  FindMatchesCount,
  DocumentMetadata,
  DocumentOutline,
  PageRenderInfo,
  // New high-value events
  AnnotationLayerRenderEvent,
  BookmarkClick,
} from "./src/interfaces/ViewerTypes";

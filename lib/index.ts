export * from "./src/ng2-pdfjs-viewer.module";
// Named export: the component file also exports test-only helpers
// (shallowEquals) that must not become public API
export { PdfJsViewerComponent } from "./src/ng2-pdfjs-viewer.component";

// Export types that are needed by consumer applications
export {
  ActionExecutionResult,
  ChangedPage,
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
  ExternalLinkTarget,
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
  // Annotation editing + programmatic search
  AnnotationEditorMode,
  AnnotationEditorState,
  AnnotationEditorModeChange,
  SearchOptions,
  SearchResult,
  // Forms + content protection
  FormDataMap,
  ContentProtectionConfig,
  WatermarkConfig,
  // Page organization, read-aloud, text extraction
  PagesEditedEvent,
  ReadAloudState,
  DocumentPageText,
  // Sidebar/layers/named-action/document-properties relays
  SidebarViewName,
  SidebarViewChange,
  LayersChange,
  NamedActionEvent,
  // Signature persistence hook
  PdfSignatureStorage,
} from "./src/interfaces/ViewerTypes";

// Bring-your-own-endpoint AI helper (no default network activity). The
// implementation lives in the `ng2-pdfjs-viewer/ai` secondary entry point
// (headless, no Angular dependency); these are re-exported here for
// backwards compatibility so existing `from "ng2-pdfjs-viewer"` imports keep
// working.
export {
  PdfAiAssistant,
  PdfAiAssistantConfig,
  PdfAiPanelConfig,
  PdfAiPanelMessage,
  PdfAiMessage,
  PdfPageText,
} from "ng2-pdfjs-viewer/ai";

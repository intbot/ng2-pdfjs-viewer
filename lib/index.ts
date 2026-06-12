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

// Bring-your-own-endpoint AI helper (no default network activity)
export {
  PdfAiAssistant,
  PdfAiAssistantConfig,
  PdfAiPanelConfig,
  PdfAiPanelMessage,
  PdfAiMessage,
} from "./src/utils/PdfAiAssistant";

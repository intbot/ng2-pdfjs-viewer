// #region Interfaces and Types
// PostMessage interface for control updates
export interface ControlMessage {
  type: "control-update";
  action: string;
  payload: any;
  id?: string;
  timestamp: number;
}

export interface ControlResponse {
  type: "control-response";
  id: string;
  success: boolean;
  action: string;
  payload?: any;
  error?: string;
}

// Action Queue System Interfaces
export interface ViewerAction {
  id: string;
  action: string;
  payload: any;
  resolver?: (result: ActionExecutionResult) => void;
  // Retry bookkeeping for transient iframe-unavailable failures
  retries?: number;
  requeued?: boolean;
  // Explicit readiness level for actions whose level isn't derivable from
  // the action name (batched 'configure' carries steps of one level each)
  level?: number;
}

export interface ActionExecutionResult {
  actionId: string;
  success: boolean;
  error?: string;
  timestamp: number;
  // Result payload for query actions (get-annotations, save-document, search)
  data?: any;
}

// Annotation editor modes exposed by PDF.js. 'disable' tears the editing UI
// down entirely; 'none' shows the toolbar buttons without an active tool.
export type AnnotationEditorMode =
  | "disable"
  | "none"
  | "freetext"
  | "highlight"
  | "stamp"
  | "ink"
  | "signature"
  | "comment";

// Editing/undo state of the annotation editor - drives save-button UX
export interface AnnotationEditorState {
  isEditing: boolean;
  isEmpty: boolean;
  hasSomethingToUndo: boolean;
  hasSomethingToRedo: boolean;
  hasSelectedEditor: boolean;
}

export interface AnnotationEditorModeChange {
  mode: AnnotationEditorMode;
}

export interface SearchOptions {
  caseSensitive?: boolean;
  entireWord?: boolean;
  // Highlight every match in the document (default true)
  highlightAll?: boolean;
  matchDiacritics?: boolean;
}

// Form field values keyed by field name. Text/choice fields are strings,
// checkboxes booleans, radio groups the selected export value.
export type FormDataMap = Record<string, string | boolean | null>;

export interface WatermarkConfig {
  text: string;
  // CSS color (default #888888)
  color?: string;
  // 0..1 (default 0.25)
  opacity?: number;
  // CSS font-size (default '48px')
  fontSize?: string;
  // degrees (default -35)
  rotation?: number;
}

// Client-side deterrence for casual copying - NOT DRM. A determined user can
// always retrieve the bytes from the network layer.
export interface ContentProtectionConfig {
  blockPrint?: boolean;
  blockDownload?: boolean;
  disableTextSelection?: boolean;
  watermark?: WatermarkConfig | null;
}

// Page-organization event (reorder/delete/extract/merge via the sidebar)
export interface PagesEditedEvent {
  operation: string;
  pagesCount: number;
}

// Read-aloud progress events. 'reading' fires once per sentence with the
// sentence text; the viewer highlights that sentence in the page text layer.
export interface ReadAloudState {
  status: "reading" | "paused" | "stopped" | "finished" | "error";
  page: number;
  sentence?: string;
}

// Per-page extracted text (BYO-AI integrations)
export interface DocumentPageText {
  page: number;
  text: string;
}

// Sidebar panel switches (thumbnails/outline/attachments/layers)
export type SidebarViewName =
  | "none"
  | "thumbs"
  | "outline"
  | "attachments"
  | "layers"
  | "unknown";
export interface SidebarViewChange {
  view: SidebarViewName;
}

// Optional-content (layers) lifecycle: 'loaded' once per layered document,
// 'changed' on every visibility toggle
export interface LayersChange {
  reason: "loaded" | "changed";
  layersCount?: number;
}

// Named action triggered from inside the document (GoToPage, Print, ...)
export interface NamedActionEvent {
  action: string;
}

// Host-side persistence for the signature editor's saved signatures
// (server/per-user storage instead of the viewer iframe's localStorage).
// `data` is PDF.js's serialized signature - treat it as an opaque JSON value.
export interface PdfSignatureStorage {
  loadAll(): Promise<Record<string, unknown>>;
  save(uuid: string, data: unknown): Promise<void>;
  delete(uuid: string): Promise<void>;
}

export interface SearchResult {
  total: number;
  current: { page: number; matchIndex: number } | null;
  // Match count per page, index 0 = page 1
  matchesPerPage: number[];
  // 1-based page numbers that contain at least one match
  pagesWithMatches: number[];
}

export type ChangedPage = number;
export type ChangedScale = number;
export interface ChangedRotation {
  rotation: number;
  page: number;
}

// Convenience configuration interfaces for grouping related properties
export interface ControlVisibilityConfig {
  openFile?: boolean;
  download?: boolean;
  print?: boolean;
  fullScreen?: boolean;
  find?: boolean;
  viewBookmark?: boolean;
  annotations?: boolean;
}

// Group visibility configuration for toolbar/sidebar
export interface GroupVisibilityConfig {
  toolbarLeft?: boolean;
  toolbarMiddle?: boolean;
  toolbarRight?: boolean;
  secondaryToolbarToggle?: boolean;
  sidebar?: boolean;
  sidebarLeft?: boolean;
  sidebarRight?: boolean;
}

// Layout & Responsive customization
export type ToolbarDensity = "default" | "compact" | "comfortable";
export type ToolbarPosition = "top" | "bottom";
export type SidebarPosition = "left" | "right";

// Where external links inside the PDF open. Mirrors PDF.js LinkTarget;
// 'top'/'parent' additionally require the matching [iframeSandbox] grant.
export type ExternalLinkTarget = "none" | "self" | "blank" | "parent" | "top";

export interface LayoutConfig {
  toolbarDensity?: ToolbarDensity;
  sidebarWidth?: string; // e.g., '280px'
  toolbarPosition?: ToolbarPosition;
  sidebarPosition?: SidebarPosition;
  responsiveBreakpoint?: string | number; // px threshold
}

export interface AutoActionConfig {
  downloadOnLoad?: boolean;
  printOnLoad?: boolean;
  showLastPageOnLoad?: boolean;
  rotateCW?: boolean;
  rotateCCW?: boolean;
}

export interface ErrorConfig {
  message?: string;
  override?: boolean;
  append?: boolean;
}

export interface ViewerConfig {
  showSpinner?: boolean;
  useOnlyCssZoom?: boolean;
  diagnosticLogs?: boolean;
  locale?: string;
  externalLinkTarget?: ExternalLinkTarget;
  rememberLastView?: boolean;
}

// Theme & Visual Customization Configuration
export interface ThemeConfig {
  theme?: "light" | "dark" | "auto";
  primaryColor?: string;
  backgroundColor?: string;
  pageBorderColor?: string;
  pageSpacing?: {
    margin?: string;
    spreadMargin?: string;
    border?: string;
  };
  toolbarColor?: string;
  textColor?: string;
  borderRadius?: string;
  customCSS?: string;
  cspNonce?: string; // CSP nonce for customCSS (optional)
  iframeTitle?: string; // Accessible title for the iframe (optional)
}

// New event data interfaces for enhanced PDF viewer functionality
export interface DocumentError {
  message: string;
  source?: any;
  name?: string;
}

export interface PagesInfo {
  pagesCount: number;
}

export interface PresentationMode {
  active: boolean;
  switchInProgress?: boolean;
}

export interface FindOperation {
  query: string;
  phraseSearch: boolean;
  caseSensitive: boolean;
  entireWord?: boolean;
  highlightAll?: boolean;
  findPrevious?: boolean;
}

export interface FindMatchesCount {
  current: number;
  total: number;
}

export interface DocumentMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
  pdfFormatVersion?: string;
  isLinearized?: boolean;
  isAcroFormPresent?: boolean;
  isXFAPresent?: boolean;
  isCollectionPresent?: boolean;
}

export interface DocumentOutline {
  items?: any[];
  hasOutline: boolean;
}

export interface PageRenderInfo {
  pageNumber: number;
  source?: string; // Optional - may contain non-cloneable objects
  timestamp?: number; // Epoch milliseconds (Date.now())
}

// New high-value events
export interface AnnotationLayerRenderEvent {
  pageNumber: number;
  error?: Error;
  timestamp: number; // Epoch milliseconds (Date.now())
}

export interface BookmarkClick {
  title: string;
  dest: string | null;
  action?: string;
  url?: string;
  pageNumber?: number;
  isCurrentItem: boolean;
}
// #endregion

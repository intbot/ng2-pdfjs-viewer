// #region Interfaces and Types
// PostMessage interface for control updates
export interface ControlMessage {
  type: 'control-update';
  action: string;
  payload: any;
  id?: string;
  timestamp: number;
}

export interface ControlResponse {
  type: 'control-response';
  id: string;
  success: boolean;
  action: string;
  payload?: any;
  error?: string;
}

// Two-way binding support interfaces
export interface PropertyChangeEvent {
  property: string;
  value: any;
  source: 'user' | 'programmatic';
  timestamp: number;
}

// Action Queue System Interfaces
export interface ViewerAction {
  id: string;
  action: string;
  payload: any;
  condition?: (viewer: any) => boolean;
  resolver?: (result: ActionExecutionResult) => void;
}

export interface ActionExecutionResult {
  actionId: string;
  success: boolean;
  error?: string;
  timestamp: number;
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

// Phase C: Group visibility configuration for toolbar/sidebar
export interface GroupVisibilityConfig {
  toolbarLeft?: boolean;
  toolbarMiddle?: boolean;
  toolbarRight?: boolean;
  secondaryToolbarToggle?: boolean;
  sidebar?: boolean;
  sidebarLeft?: boolean;
  sidebarRight?: boolean;
}

// Phase D: Layout & Responsive customization
export type ToolbarDensity = 'default' | 'compact' | 'comfortable';
export type ToolbarPosition = 'top' | 'bottom';
export type SidebarPosition = 'left' | 'right';

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
}

// Theme & Visual Customization Configuration (Phase 1)
export interface ThemeConfig {
  theme?: 'light' | 'dark' | 'auto';
  primaryColor?: string;
  backgroundColor?: string;
  pageBackgroundColor?: string;
  toolbarColor?: string;
  textColor?: string;
  borderRadius?: string;
  customCSS?: string;
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
  source?: string;  // Optional - may contain non-cloneable objects
  timestamp?: number;
}

// New high-value events (Phase 2)
export interface AnnotationLayerRenderEvent {
  pageNumber: number;
  error?: Error;
  timestamp: number;
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
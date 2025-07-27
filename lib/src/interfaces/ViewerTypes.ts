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

// Convenience configuration interfaces
export interface ControlVisibilityConfig {
  download?: boolean;
  print?: boolean; 
  find?: boolean;
  fullScreen?: boolean;
  openFile?: boolean;
  viewBookmark?: boolean;
  annotations?: boolean;
}

export interface AutoActionConfig {
  downloadOnLoad?: boolean;
  printOnLoad?: boolean;
  showLastPageOnLoad?: boolean;
  rotateCW?: boolean;
  rotateCCW?: boolean;
}

export interface ErrorConfig {
  override?: boolean;
  append?: boolean;
  message?: string;
}

export interface ViewerConfig {
  externalWindow?: boolean;
  showSpinner?: boolean;
  useOnlyCssZoom?: boolean;
  diagnosticLogs?: boolean;
  viewerFolder?: string;
  locale?: string;
}
// #endregion 
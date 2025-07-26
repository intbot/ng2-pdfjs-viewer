import { Component, Input, Output, OnInit, OnDestroy, ViewChild, EventEmitter, ElementRef, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';

// #region Interfaces and Types
// PostMessage interface for control updates
interface ControlMessage {
  type: 'control-update';
  action: string;
  payload: any;
  id?: string;
  timestamp: number;
}

interface ControlResponse {
  type: 'control-response';
  id: string;
  success: boolean;
  action: string;
  payload?: any;
  error?: string;
}

// Two-way binding support interfaces
interface PropertyChangeEvent {
  property: string;
  value: any;
  source: 'user' | 'programmatic';
  timestamp: number;
}

// Action Queue System Interfaces
interface ViewerAction {
  id: string;
  type: 'immediate' | 'auto' | 'demand' | 'conditional';
  action: string;
  payload: any;
  condition?: (viewer: any) => boolean;
}

interface ActionExecutionResult {
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
// #endregion

// #region Utility Classes
// Property transformation utilities
class PropertyTransformers {
  static transformZoom = {
    toViewer: (zoom: string): string => {
      if (!zoom) return 'auto';
      return zoom;
    },
    fromViewer: (scale: number | string): string => {
      if (typeof scale === 'string') {
        return scale;
      }
      if (typeof scale === 'number') {
        return `${Math.round(scale * 100)}%`;
      }
      return 'auto';
    }
  };

  static transformRotation = {
    toViewer: (rotation: number): number => {
      return ((rotation % 360) + 360) % 360;
    },
    fromViewer: (rotation: number): number => {
      return ((rotation % 360) + 360) % 360;
    }
  };

  static transformCursor = {
    toViewer: (cursor: string): string => {
      const validCursors = ['select', 'hand', 'zoom'];
      return validCursors.includes(cursor) ? cursor : 'select';
    },
    fromViewer: (cursor: string): string => {
      return cursor || 'select';
    }
  };

  static transformScroll = {
    toViewer: (scroll: string): string => {
      const validScrolls = ['vertical', 'horizontal', 'wrapped', 'page'];
      return validScrolls.includes(scroll) ? scroll : 'vertical';
    },
    fromViewer: (scroll: string): string => {
      return scroll || 'vertical';
    }
  };

  static transformSpread = {
    toViewer: (spread: string): string => {
      const validSpreads = ['none', 'odd', 'even'];
      return validSpreads.includes(spread) ? spread : 'none';
    },
    fromViewer: (spread: string): string => {
      return spread || 'none';
    }
  };

  static transformPageMode = {
    toViewer: (pageMode: string): string => {
      const validModes = ['none', 'thumbs', 'bookmarks', 'attachments'];
      return validModes.includes(pageMode) ? pageMode : 'none';
    },
    fromViewer: (pageMode: string): string => {
      return pageMode || 'none';
    }
  };
}

// Change origin tracking to prevent infinite loops
class ChangeOriginTracker {
  private userInitiatedChanges = new Set<string>();
  private programmaticChanges = new Set<string>();

  markUserInitiated(property: string): void {
    this.userInitiatedChanges.add(property);
    setTimeout(() => this.userInitiatedChanges.delete(property), 0);
  }

  markProgrammatic(property: string): void {
    this.programmaticChanges.add(property);
    setTimeout(() => this.programmaticChanges.delete(property), 0);
  }

  isUserInitiated(property: string): boolean {
    return this.userInitiatedChanges.has(property);
  }

  isProgrammatic(property: string): boolean {
    return this.programmaticChanges.has(property);
  }
}

// Shared utility functions for common patterns
class ComponentUtils {
  // Common property setter pattern
  static createPropertySetter<T>(
    component: PdfJsViewerComponent,
    propertyName: string,
    backingField: string,
    transformer: (value: T) => T,
    applierMethod: (value: T) => void,
    changeEmitter: EventEmitter<T>,
    changeTracker: ChangeOriginTracker
  ) {
    return (value: T) => {
      const normalizedValue = transformer(value);
      if ((component as any)[backingField] !== normalizedValue) {
        changeTracker.markProgrammatic(propertyName);
        (component as any)[backingField] = normalizedValue;
        applierMethod.call(component, normalizedValue);
        changeEmitter.emit(normalizedValue);
      }
    };
  }

  // Common validation for property values
  static validatePropertyValue(value: any, validValues: string[], defaultValue: string): string {
    if (typeof value === 'string' && validValues.includes(value)) {
      return value;
    }
    return defaultValue;
  }

  // Common PostMessage action mapping
  static getActionForProperty(propertyName: string): string | null {
    const actionMap: { [key: string]: string } = {
      // Control visibility
      'showOpenFile': 'show-openfile',
      'showDownload': 'show-download',
      'showPrint': 'show-print',
      'showFullScreen': 'show-fullscreen',
      'showFind': 'show-find',
      'showViewBookmark': 'show-bookmark',
      'showAnnotations': 'show-annotations',
      
      // Two-way binding properties
      'zoom': 'set-zoom',
      'cursor': 'set-cursor',
      'scroll': 'set-scroll',
      'spread': 'set-spread',
      'pageMode': 'update-page-mode',
      'rotation': 'set-rotation',
      
      // Navigation controls
      'page': 'set-page',
      'namedDest': 'go-to-named-dest',
      
      // Auto actions
      'showLastPageOnLoad': 'go-to-last-page',
      
      // Error handling
      'errorMessage': 'set-error-message',
      'errorOverride': 'set-error-override',
      'errorAppend': 'set-error-append',
      
      // Locale and CSS zoom
      'locale': 'set-locale',
      'useOnlyCssZoom': 'set-css-zoom',
      
      // Event configuration
      'beforePrint': 'enable-before-print',
      'afterPrint': 'enable-after-print',
      'pagesLoaded': 'enable-pages-loaded',
      'pageChange': 'enable-page-change'
    };
    return actionMap[propertyName] || null;
  }

  // Common event handler cleanup
  static cleanupEventHandlers(component: PdfJsViewerComponent): void {
    // Clean up webviewer loaded handler
    if ((component as any)._webviewerLoadedHandler) {
      document.removeEventListener("webviewerloaded", (component as any)._webviewerLoadedHandler);
      (component as any)._webviewerLoadedHandler = null;
    }
    
    // Clean up PDF.js event listeners
    if ((component as any)._pdfEventHandlers && component.PDFViewerApplication?.eventBus) {
      const eventBus = component.PDFViewerApplication.eventBus;
      const handlers = (component as any)._pdfEventHandlers;
      
      Object.keys(handlers).forEach(eventName => {
        eventBus.off(eventName, handlers[eventName]);
      });
      
      (component as any)._pdfEventHandlers = null;
    }
  }
}

// Action Queue Manager
class ActionQueueManager {
  private immediateActions: ViewerAction[] = []; // Execute when PostMessage API is ready (readiness >= 3)
  private viewerReadyActions: ViewerAction[] = []; // Execute when components are ready (readiness >= 4)
  private documentLoadedActions: ViewerAction[] = []; // Execute after PDF loads (readiness >= 5)
  private pendingActions: ViewerAction[] = [];   // On-demand actions
  private executedActions: Map<string, ActionExecutionResult> = new Map();
  private isDocumentLoaded = false;
  private isPostMessageReady = false;
  private postMessageReadiness = 0;
  private diagnosticLogs = false;
  private postMessageExecutor?: (action: string, payload: any) => Promise<any>;

  constructor(diagnosticLogs = false) {
    this.diagnosticLogs = diagnosticLogs;
  }

  setPostMessageReady(ready: boolean, readiness: number = 0): void {
    this.isPostMessageReady = ready;
    this.postMessageReadiness = readiness;
    if (ready && this.diagnosticLogs) {
      console.log(`🔍 ActionQueueManager: PostMessage API ready (readiness: ${readiness}), executing appropriate actions`);
    }
    if (ready) {
      this.executeQueuedActions();
    }
  }

  // Unified queue management
  queueAction(action: ViewerAction, queueType: 'immediate' | 'viewer-ready' | 'document-loaded' | 'on-demand'): Promise<ActionExecutionResult> | void {
    if (this.diagnosticLogs) {
      console.log(`🔍 ActionQueueManager: Queueing ${queueType} action: ${action.action} = ${action.payload}`);
    }

    switch (queueType) {
      case 'immediate':
        this.immediateActions.push(action);
        if (this.isPostMessageReady) {
          this.executeActionsFromQueue(this.immediateActions);
        }
        break;
      case 'viewer-ready':
        this.viewerReadyActions.push(action);
        if (this.postMessageReadiness >= 4) {
          this.executeActionsFromQueue(this.viewerReadyActions);
        }
        break;
      case 'document-loaded':
        this.documentLoadedActions.push(action);
        if (this.isDocumentLoaded) {
          this.executeActionsFromQueue(this.documentLoadedActions);
        }
        break;
      case 'on-demand':
        this.pendingActions.push(action);
        return this.executeAction(action);
    }
  }

  // Legacy methods for backward compatibility
  queueImmediateAction(action: ViewerAction): void {
    this.queueAction(action, 'immediate');
  }

  queueViewerReadyAction(action: ViewerAction): void {
    this.queueAction(action, 'viewer-ready');
  }

  queueDocumentLoadedAction(action: ViewerAction): void {
    this.queueAction(action, 'document-loaded');
  }

  queueOnDemandAction(action: ViewerAction): Promise<ActionExecutionResult> {
    return this.queueAction(action, 'on-demand') as Promise<ActionExecutionResult>;
  }

  onDocumentLoaded(): void {
    if (this.diagnosticLogs) {
      console.log('🔍 ActionQueueManager: Document loaded, executing document loaded actions');
    }
    this.isDocumentLoaded = true;
    this.executeActionsFromQueue(this.documentLoadedActions);
  }

  // Unified action execution
  private executeQueuedActions(): void {
    this.executeActionsFromQueue(this.immediateActions);
    if (this.postMessageReadiness >= 4) {
      this.executeActionsFromQueue(this.viewerReadyActions);
    }
    if (this.postMessageReadiness >= 5) {
      this.isDocumentLoaded = true;
      this.executeActionsFromQueue(this.documentLoadedActions);
    }
  }

  private async executeActionsFromQueue(queue: ViewerAction[]): Promise<void> {
    if (queue.length === 0) return;
    
    if (this.diagnosticLogs) {
      console.log(`🔍 ActionQueueManager: Executing ${queue.length} actions from queue`);
    }
    
    const actionsToExecute = [...queue];
    queue.length = 0; // Clear the queue
    
    for (const action of actionsToExecute) {
      try {
        await this.executeAction(action);
      } catch (error) {
        if (this.diagnosticLogs) {
          console.error(`🔍 ActionQueueManager: Error executing action ${action.action}:`, error);
        }
      }
    }
  }

  private async executeAction(action: ViewerAction): Promise<ActionExecutionResult> {
    const result: ActionExecutionResult = {
      actionId: action.id,
      success: false,
      timestamp: Date.now()
    };

    try {
      if (this.diagnosticLogs) {
        console.log(`🔍 ActionQueueManager: Executing action: ${action.action} = ${action.payload}`);
      }

      if (action.condition && !action.condition(null)) {
        result.error = 'Condition not met';
        this.executedActions.set(action.id, result);
        return result;
      }

      const success = await this.executeActionViaPostMessage(action);
      result.success = success;
      
      if (this.diagnosticLogs) {
        console.log(`🔍 ActionQueueManager: Action ${action.action} ${success ? 'succeeded' : 'failed'}`);
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
      if (this.diagnosticLogs) {
        console.error(`🔍 ActionQueueManager: Error executing action ${action.action}:`, error);
      }
    }

    this.executedActions.set(action.id, result);
    return result;
  }

  private async executeActionViaPostMessage(action: ViewerAction): Promise<boolean> {
    if (!this.postMessageExecutor) {
      throw new Error('PostMessage executor not set');
    }
    
    await this.postMessageExecutor(action.action, action.payload);
    return true;
  }

  setPostMessageExecutor(executor: (action: string, payload: any) => Promise<any>): void {
    this.postMessageExecutor = executor;
  }

  getActionStatus(actionId: string): 'pending' | 'executing' | 'completed' | 'failed' | 'not-found' {
    const result = this.executedActions.get(actionId);
    if (!result) {
      const inAnyQueue = this.immediateActions.some(a => a.id === actionId) ||
                        this.viewerReadyActions.some(a => a.id === actionId) ||
                        this.documentLoadedActions.some(a => a.id === actionId) ||
                        this.pendingActions.some(a => a.id === actionId);
      
      return inAnyQueue ? 'pending' : 'not-found';
    }
    
    return result.success ? 'completed' : 'failed';
  }

  clearQueues(): void {
    this.immediateActions = [];
    this.viewerReadyActions = [];
    this.documentLoadedActions = [];
    this.pendingActions = [];
    this.executedActions.clear();
    if (this.diagnosticLogs) {
      console.log('🔍 ActionQueueManager: All queues cleared');
    }
  }

  getQueueStatus(): { immediateActions: number; viewerReadyActions: number; documentLoadedActions: number; pendingActions: number; executedActions: number } {
    return {
      immediateActions: this.immediateActions.length,
      viewerReadyActions: this.viewerReadyActions.length,
      documentLoadedActions: this.documentLoadedActions.length,
      pendingActions: this.pendingActions.length,
      executedActions: this.executedActions.size
    };
  }
}
// #endregion

@Component({
  selector: 'ng2-pdfjs-viewer',
  standalone: false,
  template: `<iframe title="ng2-pdfjs-viewer" [hidden]="externalWindow || (!externalWindow && !pdfSrc)" #iframe width="100%" height="100%"></iframe>`
})
export class PdfJsViewerComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  // #region Component Properties
  @ViewChild('iframe', { static: true }) iframe: ElementRef;
  static lastID = 0;
  @Input() public viewerId = `ng2-pdfjs-viewer-ID${++PdfJsViewerComponent.lastID}`;
  
  // #region Event Outputs
  @Output() onBeforePrint: EventEmitter<void> = new EventEmitter();
  @Output() onAfterPrint: EventEmitter<void> = new EventEmitter();
  @Output() onDocumentLoad: EventEmitter<void> = new EventEmitter();
  @Output() onPageChange: EventEmitter<ChangedPage> = new EventEmitter();
  @Output() onScaleChange: EventEmitter<ChangedScale> = new EventEmitter();
  @Output() onRotationChange: EventEmitter<ChangedRotation> = new EventEmitter();
  // #endregion

  // #region Basic Configuration Properties
  @Input() public viewerFolder: string;
  @Input() public externalWindow: boolean = false;
  @Input() public target: string = '_blank';
  @Input() public showSpinner: boolean = true;
  @Input() public downloadFileName: string;
  @Input() public locale: string;
  @Input() public useOnlyCssZoom: boolean = false;
  @Input() public diagnosticLogs: boolean = false;
  // #endregion

  // #region Control Visibility Properties
  @Input() public showOpenFile: boolean = true;
  @Input() public showAnnotations: boolean = false;
  @Input() public showDownload: boolean = true;
  @Input() public showViewBookmark: boolean = true;
  @Input() public showPrint: boolean = true;
  @Input() public showFullScreen: boolean = true;
  @Input() public showFind: boolean = true;
  // #endregion

  // #region Auto-Action Properties
  @Input() public downloadOnLoad: boolean = false;
  @Input() public printOnLoad: boolean = false;
  @Input() public rotateCW: boolean = false;
  @Input() public rotateCCW: boolean = false;
  @Input() public showLastPageOnLoad: boolean = false;
  // #endregion

  // #region Navigation Properties
  @Input() public namedDest: string;
  // #endregion

  // #region Error Handling Properties
  @Input() public errorOverride: boolean = false;
  @Input() public errorAppend: boolean = true;
  @Input() public errorMessage: string;
  // #endregion

  // #region Deprecated Properties
  /** @deprecated Use `downloadOnLoad` instead. This property will be removed in a future version. */
  @Input() public set startDownload(value: boolean) {
    console.warn('⚠️ DEPRECATED: Property "startDownload" is deprecated. Use "downloadOnLoad" instead.');
    this.downloadOnLoad = value;
  }

  /** @deprecated Use `printOnLoad` instead. This property will be removed in a future version. */
  @Input() public set startPrint(value: boolean) {
    console.warn('⚠️ DEPRECATED: Property "startPrint" is deprecated. Use "printOnLoad" instead.');
    this.printOnLoad = value;
  }

  /** @deprecated Use `showOpenFile` instead. This property will be removed in a future version. */
  @Input() public set openFile(value: boolean) {
    console.warn('⚠️ DEPRECATED: Property "openFile" is deprecated. Use "showOpenFile" instead.');
    this.showOpenFile = value;
  }

  /** @deprecated Use `showDownload` instead. This property will be removed in a future version. */
  @Input() public set download(value: boolean) {
    console.warn('⚠️ DEPRECATED: Property "download" is deprecated. Use "showDownload" instead.');
    this.showDownload = value;
  }

  /** @deprecated Use `showPrint` instead. This property will be removed in a future version. */
  @Input() public set print(value: boolean) {
    console.warn('⚠️ DEPRECATED: Property "print" is deprecated. Use "showPrint" instead.');
    this.showPrint = value;
  }

  /** @deprecated Use `showFullScreen` instead. This property will be removed in a future version. */
  @Input() public set fullScreen(value: boolean) {
    console.warn('⚠️ DEPRECATED: Property "fullScreen" is deprecated. Use "showFullScreen" instead.');
    this.showFullScreen = value;
  }

  /** @deprecated Use `showFind` instead. This property will be removed in a future version. */
  @Input() public set find(value: boolean) {
    console.warn('⚠️ DEPRECATED: Property "find" is deprecated. Use "showFind" instead.');
    this.showFind = value;
  }

  /** @deprecated Use `showViewBookmark` instead. This property will be removed in a future version. */
  @Input() public set viewBookmark(value: boolean) {
    console.warn('⚠️ DEPRECATED: Property "viewBookmark" is deprecated. Use "showViewBookmark" instead.');
    this.showViewBookmark = value;
  }

  /** @deprecated Use `showLastPageOnLoad` instead. This property will be removed in a future version. */
  @Input() public set lastPage(value: boolean) {
    console.warn('⚠️ DEPRECATED: Property "lastPage" is deprecated. Use "showLastPageOnLoad" instead.');
    this.showLastPageOnLoad = value;
  }
  // #endregion

  // #region External Window Properties
  @Input() public externalWindowOptions: string;
  public viewerTab: any;
  // #endregion

  // #region Private Properties
  private _src: string | Blob | Uint8Array;
  private _page: number;
  private isPostMessageReady = false;
  private postMessageReadiness = 0;
  private pendingInitialConfig = true;
  private initialConfigQueued = false;
  private actionQueueManager: ActionQueueManager;
  private changeOriginTracker = new ChangeOriginTracker();
  private messageIdCounter = 0;
  private pendingMessages = new Map<string, { resolve: Function, reject: Function }>();
  private pendingChanges: SimpleChanges[] = [];
  private relaseUrl?: () => void;
  // #endregion

  // #region Two-Way Binding Properties
  // Private backing fields for two-way binding properties
  private _zoom: string = 'auto';
  private _rotation: number = 0;
  private _cursor: string = 'select';
  private _scroll: string = 'vertical';
  private _spread: string = 'none';
  private _pageMode: string = 'none';
  
  // Two-way binding Output events
  @Output() zoomChange = new EventEmitter<string>();
  @Output() rotationChange = new EventEmitter<number>();
  @Output() cursorChange = new EventEmitter<string>();
  @Output() scrollChange = new EventEmitter<string>();
  @Output() spreadChange = new EventEmitter<string>();
  @Output() pageModeChange = new EventEmitter<string>();

  /**
   * Two-way binding for zoom level
   * Supports: auto, page-fit, page-width, page-actual, percentage values (e.g., "150%")
   */
  @Input()
  get zoom(): string {
    return this._zoom;
  }
  set zoom(value: string) {
    const normalizedValue = PropertyTransformers.transformZoom.toViewer(value);
    if (this._zoom !== normalizedValue) {
      this.changeOriginTracker.markProgrammatic('zoom');
      this._zoom = normalizedValue;
      this.applyZoomToViewer(this._zoom);
      this.zoomChange.emit(this._zoom);
    }
  }

  /**
   * Two-way binding for document rotation
   * Supports: 0, 90, 180, 270 degrees
   */
  @Input()
  get rotation(): number {
    return this._rotation;
  }
  set rotation(value: number) {
    const normalizedValue = PropertyTransformers.transformRotation.toViewer(value);
    if (this._rotation !== normalizedValue) {
      this.changeOriginTracker.markProgrammatic('rotation');
      this._rotation = normalizedValue;
      this.applyRotationToViewer(this._rotation);
      this.rotationChange.emit(this._rotation);
    }
  }

  /**
   * Two-way binding for cursor mode
   * Supports: select, hand, zoom
   */
  @Input()
  get cursor(): string {
    return this._cursor;
  }
  set cursor(value: string) {
    const normalizedValue = PropertyTransformers.transformCursor.toViewer(value);
    if (this._cursor !== normalizedValue) {
      this.changeOriginTracker.markProgrammatic('cursor');
      this._cursor = normalizedValue;
      this.applyCursorToViewer(this._cursor);
      this.cursorChange.emit(this._cursor);
    }
  }

  /**
   * Two-way binding for scroll mode
   * Supports: vertical, horizontal, wrapped, page
   */
  @Input()
  get scroll(): string {
    return this._scroll;
  }
  set scroll(value: string) {
    const normalizedValue = PropertyTransformers.transformScroll.toViewer(value);
    if (this._scroll !== normalizedValue) {
      this.changeOriginTracker.markProgrammatic('scroll');
      this._scroll = normalizedValue;
      this.applyScrollToViewer(this._scroll);
      this.scrollChange.emit(this._scroll);
    }
  }

  /**
   * Two-way binding for spread mode
   * Supports: none, odd, even
   */
  @Input()
  get spread(): string {
    return this._spread;
  }
  set spread(value: string) {
    const normalizedValue = PropertyTransformers.transformSpread.toViewer(value);
    if (this._spread !== normalizedValue) {
      this.changeOriginTracker.markProgrammatic('spread');
      this._spread = normalizedValue;
      this.applySpreadToViewer(this._spread);
      this.spreadChange.emit(this._spread);
    }
  }

  /**
   * Two-way binding for page mode (sidebar state)
   * Supports: none, thumbs, bookmarks, attachments
   */
  @Input()
  get pageMode(): string {
    return this._pageMode;
  }
  set pageMode(value: string) {
    const normalizedValue = PropertyTransformers.transformPageMode.toViewer(value);
    if (this._pageMode !== normalizedValue) {
      this.changeOriginTracker.markProgrammatic('pageMode');
      this._pageMode = normalizedValue;
      this.applyPageModeToViewer(this._pageMode);
      this.pageModeChange.emit(this._pageMode);
    }
  }

  @Input()
  public set page(_page: number) {
    this._page = _page;
    if (this.PDFViewerApplication && this.PDFViewerApplication.initialized) {
      this.PDFViewerApplication.page = this._page;
    } else {
      if (this.diagnosticLogs) {
        console.warn("Document is not loaded yet!!!. Try to set page# after full load. Ignore this warning if you are not setting page# using '.' notation. (E.g. pdfViewer.page = 5;)");
      }
    }
  }

  public get page() {
    if (this.PDFViewerApplication && this.PDFViewerApplication.initialized) {
      return this.PDFViewerApplication.page;
    } else {
      if (this.diagnosticLogs) {
        console.warn("Document is not loaded yet!!!. Try to retrieve page# after full load.");
      }
      return this._page || 1;
    }
  }

  @Input()
  public set pdfSrc(_src: string | Blob | Uint8Array) {
    this._src = _src;
  }

  public get pdfSrc() {
    return this._src;
  }
  // #endregion

  // #region PDF.js Application Access Properties
  public get PDFViewerApplicationOptions() {
    let pdfViewerOptions = null;
    if (this.externalWindow) {
      if (this.viewerTab) {
        pdfViewerOptions = this.viewerTab.PDFViewerApplicationOptions;
      }
    } else {
      if (this.iframe.nativeElement.contentWindow) {
        pdfViewerOptions = this.iframe.nativeElement.contentWindow.PDFViewerApplicationOptions;
      }
    }
    return pdfViewerOptions;
  }

  public get PDFViewerApplication() {
    let pdfViewer = null;
    if (this.externalWindow) {
      if (this.viewerTab) {
        pdfViewer = this.viewerTab.PDFViewerApplication;
      }
    } else {
      if (this.iframe.nativeElement.contentWindow) {
        pdfViewer = this.iframe.nativeElement.contentWindow.PDFViewerApplication;
      }
    }
    if(this.diagnosticLogs) console.debug("PdfJsViewer: Viewer ->", pdfViewer);
    return pdfViewer;
  }
  // #endregion
  // #endregion

  // #region Lifecycle Methods
  ngOnInit(): void {   
         // 🟢 TEST LOG - Build verification (BUILD_ID: placeholder)
       console.log('🟢 ng2-pdfjs-viewer.component.ts: TEST LOG - BUILD_ID:', '2025-07-25T21-09-28-000Z');
    
    // Configure action queue manager with diagnostic logs
    this.actionQueueManager = new ActionQueueManager(this.diagnosticLogs);
    
    // Connect action queue manager to PostMessage system
    this.actionQueueManager.setPostMessageExecutor((action, payload) => this.sendControlMessage(action, payload));
    
    // Set up PostMessage listener
    this.setupMessageListener();
    
    // Load PDF for embedded views.
    if (!this.externalWindow) {
      this.loadPdf();
    }

    // Bind events.
    this.bindToPdfJsEventBus();
  }

  ngAfterViewInit(): void {
    // Additional initialization after view is ready
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.diagnosticLogs) {
    console.log('🔍 PdfJsViewer: ngOnChanges called with changes:', changes);
    console.log('🔍 PdfJsViewer: PDFViewerApplication available:', !!this.PDFViewerApplication);
    }
    
    if (this.PDFViewerApplication) {
      if (this.diagnosticLogs) {
      console.log('🔍 PdfJsViewer: PDFViewerApplication.initialized:', this.PDFViewerApplication.initialized);
      }
      
      // Only apply changes if PostMessage API is ready and viewer is initialized
      if (this.isPostMessageReady && this.PDFViewerApplication.initialized) {
        if (this.diagnosticLogs) {
        console.log('🔍 PdfJsViewer: Applying changes immediately');
        }
        this.applyChanges(changes);
      } else {
        if (this.diagnosticLogs) {
        console.log('🔍 PdfJsViewer: PostMessage API not ready or viewer not initialized, queuing changes');
        }
        this.pendingChanges.push(changes);
      }
    } else {
      if (this.diagnosticLogs) {
      console.log('🔍 PdfJsViewer: PDFViewerApplication not available, queuing changes');
      }
      this.pendingChanges.push(changes);
    }
  }

  ngOnDestroy(): void {
    // Clean up pending messages
    this.pendingMessages.clear();
    
    // Clean up event listeners
    ComponentUtils.cleanupEventHandlers(this);
    
    // Reset state flags
    this.initialConfigQueued = false;
    
    // Clean up URL
    this.relaseUrl?.();
  }
  // #endregion

  // #region Message Handling Methods
  private generateMessageId(): string {
    return `msg_${++this.messageIdCounter}_${Date.now()}`;
  }

  private sendControlMessage(action: string, payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const messageId = this.generateMessageId();
      
      const message: ControlMessage = {
        type: 'control-update',
        action,
        payload,
        id: messageId,
        timestamp: Date.now()
      };

      this.pendingMessages.set(messageId, { resolve, reject });

      // Send message to iframe
      if (this.iframe && this.iframe.nativeElement && this.iframe.nativeElement.contentWindow) {
        this.iframe.nativeElement.contentWindow.postMessage(message, '*');
        if (this.diagnosticLogs) {
        console.log('🔍 PdfJsViewer: Sent control message:', action, payload);
        }
      } else {
        this.pendingMessages.delete(messageId);
        reject(new Error('Iframe not available'));
      }
    });
  }

  private handleControlResponse(response: ControlResponse): void {
    const pendingMessage = this.pendingMessages.get(response.id);
    if (pendingMessage) {
      this.pendingMessages.delete(response.id);
      
      if (response.success) {
        pendingMessage.resolve(response);
      } else {
        pendingMessage.reject(new Error(response.error || 'Unknown error'));
      }
    }
  }

  private setupMessageListener(): void {
    window.addEventListener('message', (event) => {
      // Handle control responses from the viewer
      if (event.data && event.data.type === 'control-response') {
        this.handleControlResponse(event.data);
        return;
      }
      
      // Handle PostMessage API ready notification
      if (event.data && event.data.type === 'postmessage-ready') {
        if (this.diagnosticLogs) {
        console.log('🔍 PdfJsViewer: PostMessage API ready notification received');
        }
        this.isPostMessageReady = true;
        this.postMessageReadiness = event.data.readiness || 0;
        this.pendingInitialConfig = false;
        this.actionQueueManager.setPostMessageReady(true, this.postMessageReadiness);
        
        if (this.diagnosticLogs) {
        console.log(`🔍 PdfJsViewer: PostMessage readiness level: ${this.postMessageReadiness}`);
        }
        
        // Queue all initial configurations now that PostMessage API is ready (only once)
        if (!this.initialConfigQueued) {
          this.queueAllConfigurations();
          this.initialConfigQueued = true;
        }
        
        // Apply any pending changes that occurred before PostMessage API was ready
        this.applyPendingChanges();
        return;
      }
      
      // Handle state change notifications from PostMessage wrapper
      if (event.data && event.data.type === 'state-change') {
        this.handleStateChangeNotification(event.data);
        return;
      }
    });
  }

  private handleStateChangeNotification(notification: any): void {
    const { property, value, source } = notification;
    
    if (this.diagnosticLogs) {
      console.log(`🔍 PdfJsViewer: State change notification received: ${property} = ${value} (source: ${source})`);
    }

    // Always log state change notifications for debugging
    console.log(`🔍 PdfJsViewer: [DEBUG] State change notification: ${property} = ${value} (source: ${source})`);

    // Only process user-initiated changes to avoid infinite loops
    if (source === 'user' && !this.changeOriginTracker.isProgrammatic(property)) {
      this.changeOriginTracker.markUserInitiated(property);
      console.log(`🔍 PdfJsViewer: [DEBUG] Processing user-initiated change for ${property}`);
      
      switch (property) {
        case 'cursor':
          if (this._cursor !== value) {
            this._cursor = PropertyTransformers.transformCursor.fromViewer(value);
            this.cursorChange.emit(this._cursor);
          }
          break;
          
        case 'scroll':
          if (this._scroll !== value) {
            this._scroll = PropertyTransformers.transformScroll.fromViewer(value);
            this.scrollChange.emit(this._scroll);
          }
          break;
          
        case 'spread':
          if (this._spread !== value) {
            this._spread = PropertyTransformers.transformSpread.fromViewer(value);
            this.spreadChange.emit(this._spread);
          }
          break;
          
        case 'pageMode':
          if (this._pageMode !== value) {
            this._pageMode = PropertyTransformers.transformPageMode.fromViewer(value);
            this.pageModeChange.emit(this._pageMode);
          }
          break;
          
        case 'zoom':
          if (this._zoom !== value) {
            this._zoom = PropertyTransformers.transformZoom.fromViewer(value);
            this.zoomChange.emit(this._zoom);
          }
          break;
          
        case 'rotation':
          if (this._rotation !== value) {
            this._rotation = PropertyTransformers.transformRotation.fromViewer(value);
            this.rotationChange.emit(this._rotation);
          }
          break;
          
        // Note: namedDest is now a simple input property, not a two-way binding
          
        default:
          if (this.diagnosticLogs) {
            console.log(`🔍 PdfJsViewer: Unknown state change property: ${property}`);
          }
      }
    }
  }
  // #endregion

  // #region Property Mapping and Update Methods
  private mapPropertyToAction(propertyName: string): string | null {
    return ComponentUtils.getActionForProperty(propertyName);
  }

  private updateViewerControl(propertyName: string, value: any): void {
    if (this.diagnosticLogs) {
    console.log(`🔍 PdfJsViewer: updateViewerControl called with propertyName: ${propertyName}, value:`, value);
    }
    
    const action = this.mapPropertyToAction(propertyName);
    if (action) {
      this.sendControlMessage(action, value)
        .then(response => {
          if (this.diagnosticLogs) {
          console.log(`🔍 PdfJsViewer: Successfully updated ${propertyName} to ${value}`, response);
          }
        })
        .catch(error => {
          console.error(`🔍 PdfJsViewer: Failed to update ${propertyName} to ${value}:`, error);
        });
    } else {
      // Property is intentionally not mapped (handled via query parameters or direct API)
      if (this.diagnosticLogs) {
        console.log(`🔍 PdfJsViewer: Property ${propertyName} is handled via query parameters or direct API, skipping PostMessage`);
      }
    }
  }

  private applyChanges(changes: SimpleChanges): void {
    if (this.diagnosticLogs) {
    console.log('🔍 PdfJsViewer: applyChanges called with:', changes);
    }
    Object.keys(changes).forEach(propertyName => {
      const change = changes[propertyName];
      if (this.diagnosticLogs) {
      console.log(`🔍 PdfJsViewer: Processing property ${propertyName}:`, {
        currentValue: change.currentValue,
        previousValue: change.previousValue,
        isFirstChange: change.isFirstChange
      });
      }
      if (change.currentValue !== change.previousValue) {
        // Handle auto-actions - queue for document load, don't execute immediately
        const autoActions = ['downloadOnLoad', 'printOnLoad', 'showLastPageOnLoad', 'rotateCW', 'rotateCCW'];
        if (autoActions.includes(propertyName)) {
          if (this.diagnosticLogs) {
            console.log(`🔍 PdfJsViewer: Auto-action ${propertyName} changed to ${change.currentValue} - re-queueing configurations`);
          }
          // Re-queue all configurations when auto-actions change
          this.initialConfigQueued = false;
          if (this.isPostMessageReady) {
            this.queueAllConfigurations();
            this.initialConfigQueued = true;
          }
          return;
        }
        
        // Handle immediate actions (show/hide controls) - execute immediately
        const immediateActions = ['showOpenFile', 'showDownload', 'showPrint', 'showFullScreen', 'showFind', 'showViewBookmark', 'showAnnotations'];
        if (immediateActions.includes(propertyName)) {
          if (this.diagnosticLogs) {
            console.log(`🔍 PdfJsViewer: Immediate action ${propertyName} changed to ${change.currentValue} - executing immediately`);
          }
        this.updateViewerControl(propertyName, change.currentValue);
          return;
        }
        
        // Handle all other actions (including auto-actions) - execute immediately if PostMessage API is ready
        if (this.diagnosticLogs) {
          console.log(`🔍 PdfJsViewer: Action ${propertyName} changed to ${change.currentValue} - executing immediately`);
        }
        this.updateViewerControl(propertyName, change.currentValue);
      } else {
        console.log(`🔍 PdfJsViewer: No change detected for ${propertyName}`);
      }
    });
  }

  private applyPendingChanges(): void {
    console.log(`🔍 PdfJsViewer: applyPendingChanges called, pending changes count: ${this.pendingChanges.length}`);
    
    // Only apply pending changes if PostMessage API is ready
    if (!this.isPostMessageReady) {
      console.log('🔍 PdfJsViewer: PostMessage API not ready, skipping pending changes');
      return;
    }
    
    if (this.pendingChanges.length > 0) {
      console.log('🔍 PdfJsViewer: Processing pending changes for proper queuing');
      this.pendingChanges.forEach((changes, index) => {
        console.log(`🔍 PdfJsViewer: Processing pending change ${index + 1}:`, changes);
        this.processChangesForQueuing(changes);
      });
      this.pendingChanges = [];
      console.log('🔍 PdfJsViewer: Cleared pending changes');
    } else {
      console.log('🔍 PdfJsViewer: No pending changes to apply');
    }
  }

  private processChangesForQueuing(changes: SimpleChanges): void {
    if (this.diagnosticLogs) {
      console.log('🔍 PdfJsViewer: processChangesForQueuing called with:', changes);
    }
    
    Object.keys(changes).forEach(propertyName => {
      const change = changes[propertyName];
      if (this.diagnosticLogs) {
        console.log(`🔍 PdfJsViewer: Processing property ${propertyName} for queuing:`, {
          currentValue: change.currentValue,
          previousValue: change.previousValue,
          isFirstChange: change.isFirstChange
        });
      }
      
      if (change.currentValue !== change.previousValue) {
        // Handle immediate actions (show/hide controls) - execute immediately
        const immediateActions = ['showOpenFile', 'showDownload', 'showPrint', 'showFullScreen', 'showFind', 'showViewBookmark', 'showAnnotations'];
        if (immediateActions.includes(propertyName)) {
          if (this.diagnosticLogs) {
            console.log(`🔍 PdfJsViewer: Immediate action ${propertyName} changed to ${change.currentValue} - executing immediately`);
          }
          this.updateViewerControl(propertyName, change.currentValue);
          return;
        }
        
        // Handle all other actions (including auto-actions) - execute immediately if PostMessage API is ready
        if (this.diagnosticLogs) {
          console.log(`🔍 PdfJsViewer: Action ${propertyName} changed to ${change.currentValue} - executing immediately`);
        }
        this.updateViewerControl(propertyName, change.currentValue);
      } else {
        console.log(`🔍 PdfJsViewer: No change detected for ${propertyName}`);
      }
    });
  }
  // #endregion

  // #region PDF.js Event Binding Methods
  /**
   * Waits for the PDF.js viewer to be ready, and binds the the event bus.
   */
  private bindToPdfJsEventBus() {
    // Store the event listener reference so we can remove it later
    const webviewerLoadedHandler = () => {
      if (this.diagnosticLogs) console.debug("PdfJsViewer: webviewerloaded event received");
      if (!this.PDFViewerApplication) {
        if (this.diagnosticLogs) console.debug("PdfJsViewer: Viewer not yet (or no longer) available, events can not yet be bound.");
        return;
      }

      // https://github.com/mozilla/pdf.js/issues/9527
      this.PDFViewerApplication.initializedPromise.then(() => {
        // All configurations are now handled via PostMessage system
        // No need to call configureVisibleFeatures() anymore
        
        // Apply any pending changes that occurred before initialization
        this.applyPendingChanges();

        const app = this.PDFViewerApplication;
        const eventBus = app.eventBus;
        
        // Store event handler references for cleanup
        const documentLoadedHandler = () => {
          if (this.diagnosticLogs) console.debug("PdfJsViewer: The document has now been loaded!");
          this.onDocumentLoad.emit();
          
          // Queue auto-actions for this document load (not from component initialization)
          this.queueAutoActionsForDocumentLoad();
          
          // Execute all queued auto-actions
          this.actionQueueManager.onDocumentLoaded();
        };

        const pagesInitHandler = () => {
          if (this.diagnosticLogs) console.debug("PdfJsViewer: All pages have been rendered!");
        };

        const pagesLoadedHandler = () => {
          if (this.diagnosticLogs) console.debug("PdfJsViewer: All pages have been fully loaded!");

          // Execute auto-print on pages loaded (ensures PDF is fully ready for printing)
          if (this.printOnLoad === true) {
            if (this.diagnosticLogs) {
              console.log('🔍 PdfJsViewer: Executing auto-print on pages loaded');
            }
            this.actionQueueManager.queueDocumentLoadedAction({
              id: 'auto-print-pages-loaded',
              type: 'auto',
              action: 'trigger-print',
              payload: true
            });
          }
        };

        const beforePrintHandler = () => {
          if (this.diagnosticLogs) console.debug("PdfJsViewer: The document is about to be printed!");
          this.onBeforePrint.emit();
        };

        const afterPrintHandler = () => {
          if (this.diagnosticLogs) console.debug("PdfJsViewer: The document has been printed!");
          this.onAfterPrint.emit();
        };

        const pageChangingHandler = (event: any) => {
          if (this.diagnosticLogs) console.debug("PdfJsViewer: The page has changed:", event.pageNumber);
          
          // Update two-way binding for page
          if (this._page !== event.pageNumber && !this.changeOriginTracker.isProgrammatic('page')) {
            this.changeOriginTracker.markUserInitiated('page');
            this._page = event.pageNumber;
            // Note: page property uses existing setter/getter, no need to emit pageChange here
          }
          
          this.onPageChange.emit(event.pageNumber);
        };

        const rotationChangingHandler = (event: any) => {
          const newRotation: ChangedRotation = {
            rotation: event.pagesRotation,
            page: event.pageNumber
          }
          if (this.diagnosticLogs) console.debug("PdfJsViewer: The rotation has changed!", event);
          
          // Update two-way binding for rotation
          const normalizedRotation = PropertyTransformers.transformRotation.fromViewer(event.pagesRotation);
          if (this._rotation !== normalizedRotation && !this.changeOriginTracker.isProgrammatic('rotation')) {
            this.changeOriginTracker.markUserInitiated('rotation');
            this._rotation = normalizedRotation;
            this.rotationChange.emit(normalizedRotation);
          }
          
          this.onRotationChange.emit(newRotation);
        };

        const scaleChangingHandler = (event: any) => {
          const newScale: ChangedScale = event.scale;
          if (this.diagnosticLogs) console.debug("PdfJsViewer: The document has scale has changed!", newScale);
          
          // Update two-way binding for zoom
          const normalizedZoom = PropertyTransformers.transformZoom.fromViewer(event.scale);
          if (this._zoom !== normalizedZoom && !this.changeOriginTracker.isProgrammatic('zoom')) {
            this.changeOriginTracker.markUserInitiated('zoom');
            this._zoom = normalizedZoom;
            this.zoomChange.emit(normalizedZoom);
          }
          
          this.onScaleChange.emit(newScale);
        };
        
        // Store handlers for cleanup
        (this as any)._pdfEventHandlers = {
          documentloaded: documentLoadedHandler,
          pagesinit: pagesInitHandler,
          pagesloaded: pagesLoadedHandler,
          beforeprint: beforePrintHandler,
          afterprint: afterPrintHandler,
          pagechanging: pageChangingHandler,
          rotationchanging: rotationChangingHandler,
          scalechanging: scaleChangingHandler
        };
        
        // Attach event listeners
        eventBus.on("documentloaded", documentLoadedHandler);
        eventBus.on("pagesinit", pagesInitHandler);
        eventBus.on("pagesloaded", pagesLoadedHandler);
        eventBus.on("beforeprint", beforePrintHandler);
        eventBus.on("afterprint", afterPrintHandler);
        eventBus.on("pagechanging", pageChangingHandler);
        eventBus.on("rotationchanging", rotationChangingHandler);
        eventBus.on("scalechanging", scaleChangingHandler);
        
        if (this.diagnosticLogs) {
          console.log('🔍 PdfJsViewer: PDF.js events successfully bound');
        }
      });
    };
    
    // Store the handler reference for cleanup
    (this as any)._webviewerLoadedHandler = webviewerLoadedHandler;
    
    document.addEventListener("webviewerloaded", webviewerLoadedHandler);
  }
  // #endregion

  // #region Configuration and Action Queue Methods
  private queueAllConfigurations(): void {
    if (this.diagnosticLogs) {
      console.log('🔍 PdfJsViewer: Queueing all initial configurations');
    }

    // Queue control visibility configurations (immediate actions)
    this.queueConfiguration('showOpenFile', this.showOpenFile, 'show-openfile');
    this.queueConfiguration('showDownload', this.showDownload, 'show-download');
    this.queueConfiguration('showPrint', this.showPrint, 'show-print');
    this.queueConfiguration('showFullScreen', this.showFullScreen, 'show-fullscreen');
    this.queueConfiguration('showFind', this.showFind, 'show-find');
    this.queueConfiguration('showViewBookmark', this.showViewBookmark, 'show-bookmark');
    this.queueConfiguration('showAnnotations', this.showAnnotations, 'show-annotations');

    // Queue mode configurations (immediate actions)
    if (this.cursor) {
      this.queueConfiguration('cursor', this.cursor, 'set-cursor');
    }
    if (this.scroll) {
      this.queueConfiguration('scroll', this.scroll, 'set-scroll');
    }
    if (this.spread) {
      this.queueConfiguration('spread', this.spread, 'set-spread');
    }

    // Queue navigation configurations (immediate actions)
    if (this._page) {
      this.queueConfiguration('page', this._page, 'set-page');
    }
    if (this.zoom) {
      this.queueConfiguration('zoom', this.zoom, 'set-zoom');
    }
    // Note: zoom is now handled by two-way binding [(zoom)]
    if (this.namedDest) {
      this.queueConfiguration('namedDest', this.namedDest, 'go-to-named-dest');
    }
    if (this.pageMode) {
      this.queueConfiguration('pageMode', this.pageMode, 'update-page-mode');
    }

    // Queue rotation configurations (immediate actions)
    if (this.rotateCW === true) {
      this.queueConfiguration('rotateCW', this.rotateCW, 'trigger-rotate-cw');
    }
    if (this.rotateCCW === true) {
      this.queueConfiguration('rotateCCW', this.rotateCCW, 'trigger-rotate-ccw');
    }

    // Queue error handling configurations (non-auto-actions)
    if (this.errorMessage) {
      this.queueConfiguration('errorMessage', this.errorMessage, 'set-error-message');
    }
    if (this.errorOverride !== undefined) {
      this.queueConfiguration('errorOverride', this.errorOverride, 'set-error-override');
    }
    if (this.errorAppend !== undefined) {
      this.queueConfiguration('errorAppend', this.errorAppend, 'set-error-append');
    }

    // Queue locale and CSS zoom configurations (immediate actions)
    if (this.locale) {
      this.queueConfiguration('locale', this.locale, 'set-locale');
    }
    if (this.useOnlyCssZoom !== undefined) {
      this.queueConfiguration('useOnlyCssZoom', this.useOnlyCssZoom, 'set-css-zoom');
    }

    // Queue event configurations (non-auto-actions)
    if (this.onBeforePrint) {
      this.queueConfiguration('beforePrint', true, 'enable-before-print');
    }
    if (this.onAfterPrint) {
      this.queueConfiguration('afterPrint', true, 'enable-after-print');
    }
    if (this.onDocumentLoad) {
      this.queueConfiguration('pagesLoaded', true, 'enable-pages-loaded');
    }
    if (this.onPageChange) {
      this.queueConfiguration('pageChange', true, 'enable-page-change');
    }

    // Note: Auto-actions are now queued when the document loads, not during component initialization
    // This ensures they use the current property values at the time of document load
  }

  private queueAutoActionsForDocumentLoad(): void {
    if (this.diagnosticLogs) {
      console.log('🔍 PdfJsViewer: Queueing auto-actions for current document load');
    }
    
    // Queue auto actions (these will be executed after document loads)
    if (this.downloadOnLoad === true) {
      if (this.diagnosticLogs) {
        console.log('🔍 PdfJsViewer: Queueing auto-download for document load');
      }
      this.actionQueueManager.queueDocumentLoadedAction({
        id: 'auto-download',
        type: 'auto',
        action: 'trigger-download',
        payload: true
      });
    }
    // Note: Auto-print is now handled in pagesLoadedHandler to ensure PDF is fully ready for printing
    if (this.showLastPageOnLoad === true) {
      if (this.diagnosticLogs) {
        console.log('🔍 PdfJsViewer: Queueing auto-last-page for document load');
      }
      this.actionQueueManager.queueDocumentLoadedAction({
        id: 'auto-last-page',
        type: 'auto',
        action: 'go-to-last-page',
        payload: true
      });
    }

  }

  private queueConfiguration(propertyName: string, value: any, action: string): void {
    if (value !== undefined && value !== null) {
      // Determine which queue to use based on action requirements
      const immediateActions = ['show-download', 'show-print', 'show-fullscreen', 'show-find', 'show-bookmark', 'show-openfile', 'show-annotations', 'set-error-message', 'set-error-override', 'set-error-append', 'set-css-zoom'];
      const viewerReadyActions = ['set-cursor', 'set-scroll', 'set-spread', 'set-zoom', 'update-page-mode', 'set-locale'];
      const documentLoadedActions = ['set-page', 'set-rotation', 'go-to-last-page', 'go-to-named-dest', 'trigger-download', 'trigger-print', 'trigger-rotate-cw', 'trigger-rotate-ccw'];
      
      let actionType: 'immediate' | 'auto' | 'demand' | 'conditional' = 'immediate';
      let queueMethod = 'queueImmediateAction';
      
      if (viewerReadyActions.includes(action)) {
        actionType = 'auto';
        queueMethod = 'queueViewerReadyAction';
      } else if (documentLoadedActions.includes(action)) {
        actionType = 'auto';
        queueMethod = 'queueDocumentLoadedAction';
      }
      
      const actionObj: ViewerAction = {
        id: `config-${propertyName}`,
        type: actionType,
        action: action,
        payload: value
      };
      
      if (queueMethod === 'queueImmediateAction') {
        this.actionQueueManager.queueImmediateAction(actionObj);
      } else if (queueMethod === 'queueViewerReadyAction') {
        this.actionQueueManager.queueViewerReadyAction(actionObj);
      } else if (queueMethod === 'queueDocumentLoadedAction') {
        this.actionQueueManager.queueDocumentLoadedAction(actionObj);
      }
    }
  }

  public refresh(): void { // Needs to be invoked for external window or when needs to reload pdf
    if (this.diagnosticLogs) {
      console.log('🔍 PdfJsViewer: Refreshing viewer - clearing action queue and reloading PDF');
    }
    
    // Clean up existing event listeners
    ComponentUtils.cleanupEventHandlers(this);
    
    // Clear the action queue to ensure clean state
    if (this.actionQueueManager) {
      this.actionQueueManager.clearQueues();
    }
    
    // Reset PostMessage readiness state
    this.isPostMessageReady = false;
    this.postMessageReadiness = 0;
      this.pendingInitialConfig = true;
    this.initialConfigQueued = false; // Reset initial config flag
    
    // Reload the PDF - this will trigger queueAllConfigurations() when PostMessage API is ready
    this.loadPdf();
  }

  // Public method for external control messages
  public sendViewerControlMessage(action: string, payload: any): Promise<any> {
    return this.sendControlMessage(action, payload);
  }

  // Public methods for on-demand actions
  public triggerDownload(): Promise<ActionExecutionResult> {
    if (!this.actionQueueManager) {
      return Promise.reject(new Error('ActionQueueManager not initialized'));
    }
    return this.actionQueueManager.queueOnDemandAction({
      id: `download-${Date.now()}`,
      type: 'demand',
      action: 'trigger-download',
      payload: true
    });
  }

  public triggerPrint(): Promise<ActionExecutionResult> {
    if (!this.actionQueueManager) {
      return Promise.reject(new Error('ActionQueueManager not initialized'));
    }
    return this.actionQueueManager.queueOnDemandAction({
      id: `print-${Date.now()}`,
      type: 'demand',
      action: 'trigger-print',
      payload: true
    });
  }

  public triggerRotation(direction: 'cw' | 'ccw'): Promise<ActionExecutionResult> {
    if (!this.actionQueueManager) {
      return Promise.reject(new Error('ActionQueueManager not initialized'));
    }
    const action = direction === 'cw' ? 'trigger-rotate-cw' : 'trigger-rotate-ccw';
    return this.actionQueueManager.queueOnDemandAction({
      id: `rotate-${direction}-${Date.now()}`,
      type: 'demand',
      action: action,
      payload: true
    });
    }
    
  public goToPage(page: number): Promise<ActionExecutionResult> {
    if (!this.actionQueueManager) {
      return Promise.reject(new Error('ActionQueueManager not initialized'));
    }
    return this.actionQueueManager.queueOnDemandAction({
      id: `page-${page}-${Date.now()}`,
      type: 'demand',
      action: 'set-page',
      payload: page
    });
    }

  public setZoom(zoom: string): Promise<ActionExecutionResult> {
    if (!this.actionQueueManager) {
      return Promise.reject(new Error('ActionQueueManager not initialized'));
    }
    return this.actionQueueManager.queueOnDemandAction({
      id: `zoom-${zoom}-${Date.now()}`,
      type: 'demand',
      action: 'set-zoom',
      payload: zoom
    });
  }

  public setCursor(cursor: string): Promise<ActionExecutionResult> {
    if (!this.actionQueueManager) {
      return Promise.reject(new Error('ActionQueueManager not initialized'));
    }
    return this.actionQueueManager.queueOnDemandAction({
      id: `cursor-${cursor}-${Date.now()}`,
      type: 'demand',
      action: 'set-cursor',
      payload: cursor
    });
  }

  public setScroll(scroll: string): Promise<ActionExecutionResult> {
    if (!this.actionQueueManager) {
      return Promise.reject(new Error('ActionQueueManager not initialized'));
    }
    return this.actionQueueManager.queueOnDemandAction({
      id: `scroll-${scroll}-${Date.now()}`,
      type: 'demand',
      action: 'set-scroll',
      payload: scroll
    });
  }

  public setSpread(spread: string): Promise<ActionExecutionResult> {
    if (!this.actionQueueManager) {
      return Promise.reject(new Error('ActionQueueManager not initialized'));
    }
    return this.actionQueueManager.queueOnDemandAction({
      id: `spread-${spread}-${Date.now()}`,
      type: 'demand',
      action: 'set-spread',
      payload: spread
    });
  }

  public goToNamedDestination(destination: string): Promise<ActionExecutionResult> {
    if (!this.actionQueueManager) {
      return Promise.reject(new Error('ActionQueueManager not initialized'));
    }
    return this.actionQueueManager.queueOnDemandAction({
      id: `nameddest-${destination}-${Date.now()}`,
      type: 'demand',
      action: 'go-to-named-dest',
      payload: destination
    });
  }

  public setPageMode(mode: string): Promise<ActionExecutionResult> {
    if (!this.actionQueueManager) {
      return Promise.reject(new Error('ActionQueueManager not initialized'));
    }
    return this.actionQueueManager.queueOnDemandAction({
      id: `pagemode-${mode}-${Date.now()}`,
      type: 'demand',
      action: 'update-page-mode',
      payload: mode
    });
  }

  public setLocale(locale: string): Promise<ActionExecutionResult> {
    if (!this.actionQueueManager) {
      return Promise.reject(new Error('ActionQueueManager not initialized'));
    }
    return this.actionQueueManager.queueOnDemandAction({
      id: `locale-${locale}-${Date.now()}`,
      type: 'demand',
      action: 'set-locale',
      payload: locale
    });
  }

  // Action queue management methods
  public getActionStatus(actionId: string): 'pending' | 'executing' | 'completed' | 'failed' | 'not-found' {
    if (!this.actionQueueManager) {
      return 'not-found';
    }
    return this.actionQueueManager.getActionStatus(actionId);
  }

  public getQueueStatus(): { immediateActions: number; viewerReadyActions: number; documentLoadedActions: number; pendingActions: number; executedActions: number } {
    if (!this.actionQueueManager) {
      return {
        immediateActions: 0,
        viewerReadyActions: 0,
        documentLoadedActions: 0,
        pendingActions: 0,
        executedActions: 0
      };
    }
    return this.actionQueueManager.getQueueStatus();
  }

  public clearActionQueue(): void {
    if (this.actionQueueManager) {
      this.actionQueueManager.clearQueues();
    }
  }
  // #endregion

  // #region PDF Loading and URL Handling
  private loadPdf() {
    if (!this._src) {
      return;
    }

    if (this.externalWindow && (typeof this.viewerTab === 'undefined' || this.viewerTab.closed)) {
      this.viewerTab = window.open('', this.target, this.externalWindowOptions || '');
      if (this.viewerTab == null) {
        console.error("ng2-pdfjs-viewer: For 'externalWindow = true'. i.e opening in new tab to work, pop-ups should be enabled.");
        return;
      }

      if (this.showSpinner) {
        this.viewerTab.document.write(`
          <style>
          .loader {
            position: fixed;
            left: 40%;
            top: 40%;
            border: 16px solid #f3f3f3;
            border-radius: 50%;
            border-top: 16px solid #3498db;
            width: 120px;
            height: 120px;
            animation: spin 2s linear infinite;
          }
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
          </style>
          <div class="loader"></div>
        `);
      }
    }

    this.relaseUrl?.();
    let fileUrl;
    if (this._src instanceof Blob) {
      const url = URL.createObjectURL(this._src);
      fileUrl = encodeURIComponent(url);
      this.relaseUrl = () => URL.revokeObjectURL(url);
    } else if (this._src instanceof Uint8Array) {
      let blob = new Blob([this._src], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      this.relaseUrl = () => URL.revokeObjectURL(url);
      fileUrl = encodeURIComponent(url);
    } else {
      fileUrl = this._src;
    }

    let viewerUrl;
    if (this.viewerFolder) {
      viewerUrl = `${this.viewerFolder}/web/viewer.html`;
    } else {
      viewerUrl = `assets/pdfjs/web/viewer.html`;
    }

    // Add cache-busting timestamp only in development mode
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' || 
                         window.location.port === '4200' ||
                         window.location.href.includes('localhost:4200');
    
    let cacheBuster: number | undefined;
    if (isDevelopment) {
      cacheBuster = Date.now();
      viewerUrl += `?file=${fileUrl}&cb=${cacheBuster}`;
      if (this.diagnosticLogs) {
        console.log(`🔍 PdfJsViewer: Development mode detected, using cache-busting timestamp: ${cacheBuster}`);
      }
    } else {
      viewerUrl += `?file=${fileUrl}`;
      if (this.diagnosticLogs) {
        console.log(`🔍 PdfJsViewer: Production mode detected, no cache-busting applied`);
      }
    }

    if (typeof this.viewerId !== 'undefined') {
      viewerUrl += `&viewerId=${this.viewerId}`;
    }
    
    // Add additional cache-busting for the viewerId to ensure unique iframe URLs (development only)
    if (isDevelopment && cacheBuster) {
      viewerUrl += `&_t=${cacheBuster}`;
    }

    // All other configurations are now handled via PostMessage system
    // No need to add any other parameters to the URL

    if (this.externalWindow) {
      this.viewerTab.location.href = viewerUrl;
    } else {
      this.iframe.nativeElement.contentWindow.location.replace(viewerUrl);
    }
    
    if (this.diagnosticLogs) {
      console.debug(`PdfJsViewer: Minimal URL configuration:
        pdfSrc = ${this.pdfSrc}
        fileUrl = ${fileUrl}
        externalWindow = ${this.externalWindow}
        viewerFolder = ${this.viewerFolder}
        viewerId = ${this.viewerId}
        
        All other configurations handled via PostMessage system:
        showOpenFile = ${this.showOpenFile}
        showDownload = ${this.showDownload}
        showViewBookmark = ${this.showViewBookmark}
        showPrint = ${this.showPrint}
        showFullScreen = ${this.showFullScreen}
        showFind = ${this.showFind}
        cursor = ${this.cursor}
        scroll = ${this.scroll}
        spread = ${this.spread}
        page = ${this.page}
        zoom = ${this.zoom}
        namedDest = ${this.namedDest}
        pageMode = ${this.pageMode}
        errorOverride = ${this.errorOverride}
        errorAppend = ${this.errorAppend}
        errorMessage = ${this.errorMessage}
        locale = ${this.locale}
        useOnlyCssZoom = ${this.useOnlyCssZoom}
        
        Auto-actions (handled by action queue):
        downloadOnLoad = ${this.downloadOnLoad}
        printOnLoad = ${this.printOnLoad}
        showLastPageOnLoad = ${this.showLastPageOnLoad}
      `);
      }
  }
  // #endregion

  // #region Two-Way Binding Helper Methods
  private applyZoomToViewer(zoom: string): void {
    if (this.isPostMessageReady) {
      // Use direct PostMessage for immediate updates
      this.updateViewerControl('zoom', zoom);
    }
  }

  private applyRotationToViewer(rotation: number): void {
    if (this.isPostMessageReady) {
      // Rotation requires document loaded (readiness >= 5)
      if (this.postMessageReadiness >= 5) {
        this.updateViewerControl('rotation', rotation);
      } else {
        // Queue for when document is loaded
        this.actionQueueManager.queueDocumentLoadedAction({
          id: `twoway-rotation-${Date.now()}`,
          type: 'auto',
          action: 'set-rotation',
          payload: rotation
        });
      }
    }
  }

  private applyCursorToViewer(cursor: string): void {
    if (this.isPostMessageReady) {
      // Use direct PostMessage for immediate updates
      this.updateViewerControl('cursor', cursor);
    }
  }

  private applyScrollToViewer(scroll: string): void {
    if (this.isPostMessageReady) {
      // Use direct PostMessage for immediate updates
      this.updateViewerControl('scroll', scroll);
    }
  }

  private applySpreadToViewer(spread: string): void {
    if (this.isPostMessageReady) {
      // Use direct PostMessage for immediate updates
      this.updateViewerControl('spread', spread);
    }
  }

  private applyPageModeToViewer(pageMode: string): void {
    if (this.isPostMessageReady) {
      // Use direct PostMessage for immediate updates
      this.updateViewerControl('pageMode', pageMode);
    }
  }
  // #endregion
}

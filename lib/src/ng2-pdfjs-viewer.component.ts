import { Component, Input, Output, OnInit, OnDestroy, ViewChild, EventEmitter, ElementRef, OnChanges, SimpleChanges, AfterViewInit, TemplateRef } from '@angular/core';

// Import extracted modules
import { 
  ControlMessage, 
  ControlResponse, 
  PropertyChangeEvent,
  ViewerAction,
  ActionExecutionResult,
  ChangedPage,
  ChangedScale,
  ChangedRotation,
  ControlVisibilityConfig,
  GroupVisibilityConfig,
  LayoutConfig,
  ToolbarDensity,
  ToolbarPosition,
  SidebarPosition,
  AutoActionConfig,
  ErrorConfig,
  ViewerConfig,
  ThemeConfig,
  DocumentError,
  PagesInfo,
  PresentationMode,
  FindOperation,
  FindMatchesCount,
  DocumentMetadata,
  DocumentOutline,
  PageRenderInfo,
  // New high-value events (Phase 2)
  AnnotationLayerRenderEvent,
  BookmarkClick
} from './interfaces/ViewerTypes';
import { ActionQueueManager } from './managers/ActionQueueManager';
import { PropertyTransformers } from './utils/PropertyTransformers';
import { ComponentUtils } from './utils/ComponentUtils';
import { ChangeOriginTracker } from './utils/ChangeOriginTracker';

@Component({
  selector: 'ng2-pdfjs-viewer',
  standalone: false,
  styles: [`
    /* Spinner overlay styling */
    .ng2-pdfjs-loading-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: saturate(120%) blur(1px);
    }
    
    /* Default spinner animation */
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `],
  template: `
  <div class="ng2-pdfjs-viewer-container" style="position:relative;width:100%;height:100%;">
    <iframe title="ng2-pdfjs-viewer" [hidden]="externalWindow || (!externalWindow && !pdfSrc)" #iframe width="100%" height="100%"></iframe>

    <div class="ng2-pdfjs-loading-overlay" *ngIf="showSpinner && isLoading && !externalWindow"
         [ngClass]="spinnerClass"
         style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.6);backdrop-filter:saturate(120%) blur(1px);">
      <ng-container *ngIf="customSpinnerTpl; else defaultSpinner" [ngTemplateOutlet]="customSpinnerTpl"></ng-container>
      <ng-template #defaultSpinner>
        <div style="text-align:center;">
          <div style="display:inline-block;width:40px;height:40px;border:4px solid #f3f3f3;border-top:4px solid #2196F3;border-radius:50%;animation:spin 1s linear infinite;"></div>
          <div style="margin-top:16px;color:#666;font-size:16px;">Loading PDF...</div>
        </div>
      </ng-template>
    </div>
  </div>
  `
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

  // New high-value events for enhanced PDF viewer functionality
  @Output() onDocumentError: EventEmitter<DocumentError> = new EventEmitter();
  @Output() onDocumentInit: EventEmitter<void> = new EventEmitter();
  @Output() onPagesInit: EventEmitter<PagesInfo> = new EventEmitter();
  @Output() onPresentationModeChanged: EventEmitter<PresentationMode> = new EventEmitter();
  @Output() onOpenFile: EventEmitter<void> = new EventEmitter();
  @Output() onFind: EventEmitter<FindOperation> = new EventEmitter();
  @Output() onUpdateFindMatchesCount: EventEmitter<FindMatchesCount> = new EventEmitter();
  @Output() onMetadataLoaded: EventEmitter<DocumentMetadata> = new EventEmitter();
  @Output() onOutlineLoaded: EventEmitter<DocumentOutline> = new EventEmitter();
  @Output() onPageRendered: EventEmitter<PageRenderInfo> = new EventEmitter();

  // New high-value events (Phase 2)
  @Output() onAnnotationLayerRendered: EventEmitter<AnnotationLayerRenderEvent> = new EventEmitter();
  @Output() onBookmarkClick: EventEmitter<BookmarkClick> = new EventEmitter();
  @Output() onIdle: EventEmitter<void> = new EventEmitter();
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

  // #region Theme & Visual Customization Properties (Phase 1)
  @Input() public theme: 'light' | 'dark' | 'auto' = 'light';
  @Input() public primaryColor?: string;
  @Input() public backgroundColor?: string;
  @Input() public pageBorderColor?: string;
  @Input() public toolbarColor?: string;
  @Input() public textColor?: string;
  @Input() public borderRadius?: string;
  @Input() public customCSS?: string;
  // #endregion

  // #region Loading & Spinner Customization (Phase 2)
  @Input() public customSpinnerTpl?: TemplateRef<any>;
  @Input() public spinnerClass?: string;
  // #endregion

  // #region Phase C: Toolbar/Sidebar Group Visibility
  @Input() public showToolbarLeft: boolean = true;
  @Input() public showToolbarMiddle: boolean = true;
  @Input() public showToolbarRight: boolean = true;
  @Input() public showSecondaryToolbarToggle: boolean = true;
  @Input() public showSidebar: boolean = true;
  @Input() public showSidebarLeft: boolean = true;
  @Input() public showSidebarRight: boolean = true;
  // #endregion

  // #region Phase D: Layout & Responsive Customization
  @Input() public toolbarDensity: ToolbarDensity = 'default';
  @Input() public sidebarWidth?: string; // e.g., '280px'
  @Input() public toolbarPosition: ToolbarPosition = 'top';
  @Input() public sidebarPosition: SidebarPosition = 'left';
  @Input() public responsiveBreakpoint?: string | number;
  // #endregion

  // Internal loading state for overlay control
  public isLoading: boolean = true;
  private hasFirstRender: boolean = false;


  // #region Convenience Configuration Setters
  @Input() public set controlVisibility(config: ControlVisibilityConfig) {
    if (config.download !== undefined) this.showDownload = config.download;
    if (config.print !== undefined) this.showPrint = config.print;
    if (config.find !== undefined) this.showFind = config.find;
    if (config.fullScreen !== undefined) this.showFullScreen = config.fullScreen;
    if (config.openFile !== undefined) this.showOpenFile = config.openFile;
    if (config.viewBookmark !== undefined) this.showViewBookmark = config.viewBookmark;
    if (config.annotations !== undefined) this.showAnnotations = config.annotations;
  }

  @Input() public set autoActions(config: AutoActionConfig) {
    if (config.downloadOnLoad !== undefined) this.downloadOnLoad = config.downloadOnLoad;
    if (config.printOnLoad !== undefined) this.printOnLoad = config.printOnLoad;
    if (config.showLastPageOnLoad !== undefined) this.showLastPageOnLoad = config.showLastPageOnLoad;
    if (config.rotateCW !== undefined) this.rotateCW = config.rotateCW;
    if (config.rotateCCW !== undefined) this.rotateCCW = config.rotateCCW;
  }

  @Input() public set errorHandling(config: ErrorConfig) {
    if (config.override !== undefined) this.errorOverride = config.override;
    if (config.append !== undefined) this.errorAppend = config.append;
    if (config.message !== undefined) this.errorMessage = config.message;
  }

  @Input() public set viewerConfig(config: ViewerConfig) {
    if (config.showSpinner !== undefined) this.showSpinner = config.showSpinner;
    if (config.useOnlyCssZoom !== undefined) this.useOnlyCssZoom = config.useOnlyCssZoom;
    if (config.diagnosticLogs !== undefined) this.diagnosticLogs = config.diagnosticLogs;
    if (config.locale !== undefined) this.locale = config.locale;
  }

  @Input() public set themeConfig(config: ThemeConfig) {
    if (config.theme !== undefined) this.theme = config.theme;
    if (config.primaryColor !== undefined) this.primaryColor = config.primaryColor;
    if (config.backgroundColor !== undefined) this.backgroundColor = config.backgroundColor;
    if (config.pageBorderColor !== undefined) this.pageBorderColor = config.pageBorderColor;
    if (config.toolbarColor !== undefined) this.toolbarColor = config.toolbarColor;
    if (config.textColor !== undefined) this.textColor = config.textColor;
    if (config.borderRadius !== undefined) this.borderRadius = config.borderRadius;
    if (config.customCSS !== undefined) this.customCSS = config.customCSS;
  }
  
  @Input() public set groupVisibility(config: GroupVisibilityConfig) {
    if (config.toolbarLeft !== undefined) this.showToolbarLeft = config.toolbarLeft;
    if (config.toolbarMiddle !== undefined) this.showToolbarMiddle = config.toolbarMiddle;
    if (config.toolbarRight !== undefined) this.showToolbarRight = config.toolbarRight;
    if (config.secondaryToolbarToggle !== undefined) this.showSecondaryToolbarToggle = config.secondaryToolbarToggle;
    if (config.sidebar !== undefined) this.showSidebar = config.sidebar;
    if (config.sidebarLeft !== undefined) this.showSidebarLeft = config.sidebarLeft;
    if (config.sidebarRight !== undefined) this.showSidebarRight = config.sidebarRight;
  }

  @Input() public set layoutConfig(config: LayoutConfig) {
    if (config.toolbarDensity !== undefined) this.toolbarDensity = config.toolbarDensity;
    if (config.sidebarWidth !== undefined) this.sidebarWidth = config.sidebarWidth;
    if (config.toolbarPosition !== undefined) this.toolbarPosition = config.toolbarPosition;
    if (config.sidebarPosition !== undefined) this.sidebarPosition = config.sidebarPosition;
    if (config.responsiveBreakpoint !== undefined) this.responsiveBreakpoint = config.responsiveBreakpoint;
  }
  // #endregion

  // #region Helper function for deprecated properties
  private setDeprecatedProperty(oldName: string, newProperty: string, value: any): void {
    console.warn(`⚠️ DEPRECATED: Property "${oldName}" is deprecated. Use "${newProperty}" instead.`);
    (this as any)[newProperty] = value;
  }
  // #endregion

  // #region Deprecated Properties (Simplified)
  /** @deprecated Use `downloadOnLoad` instead. This property will be removed in a future version. */
  @Input() public set startDownload(value: boolean) {
    this.setDeprecatedProperty('startDownload', 'downloadOnLoad', value);
  }

  /** @deprecated Use `printOnLoad` instead. This property will be removed in a future version. */
  @Input() public set startPrint(value: boolean) {
    this.setDeprecatedProperty('startPrint', 'printOnLoad', value);
  }

  /** @deprecated Use `showOpenFile` instead. This property will be removed in a future version. */
  @Input() public set openFile(value: boolean) {
    this.setDeprecatedProperty('openFile', 'showOpenFile', value);
  }

  /** @deprecated Use `showDownload` instead. This property will be removed in a future version. */
  @Input() public set download(value: boolean) {
    this.setDeprecatedProperty('download', 'showDownload', value);
  }

  /** @deprecated Use `showPrint` instead. This property will be removed in a future version. */
  @Input() public set print(value: boolean) {
    this.setDeprecatedProperty('print', 'showPrint', value);
  }

  /** @deprecated Use `showFullScreen` instead. This property will be removed in a future version. */
  @Input() public set fullScreen(value: boolean) {
    this.setDeprecatedProperty('fullScreen', 'showFullScreen', value);
  }

  /** @deprecated Use `showFind` instead. This property will be removed in a future version. */
  @Input() public set find(value: boolean) {
    this.setDeprecatedProperty('find', 'showFind', value);
  }

  /** @deprecated Use `showViewBookmark` instead. This property will be removed in a future version. */
  @Input() public set viewBookmark(value: boolean) {
    this.setDeprecatedProperty('viewBookmark', 'showViewBookmark', value);
  }

  /** @deprecated Use `showLastPageOnLoad` instead. This property will be removed in a future version. */
  @Input() public set lastPage(value: boolean) {
    this.setDeprecatedProperty('lastPage', 'showLastPageOnLoad', value);
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
   * One-way binding for document rotation
   * Supports: 0, 90, 180, 270 degrees
   */
  @Input()
  set rotation(value: number) {
    const normalizedValue = PropertyTransformers.transformRotation.toViewer(value);
    if (this._rotation !== normalizedValue) {
      this._rotation = normalizedValue;
      this.applyRotationToViewer(this._rotation);
    }
  }
  
  get rotation(): number {
    return this._rotation;
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
         // 🟢 TEST LOG - Build verification (BUILD_ID from separate file)
        console.log('🟢 ng2-pdfjs-viewer.component.ts: TEST LOG - BUILD_ID:', (window as any).NG2_PDF_VIEWER_BUILD_ID || 'BUILD_ID_NOT_LOADED');
        
        // Debug theme initialization
        console.log('🎨 THEME DEBUG: ngOnInit - theme value:', this.theme);
                 console.log('🎨 THEME DEBUG: ngOnInit - primaryColor:', this.primaryColor);
         console.log('🎨 THEME DEBUG: ngOnInit - backgroundColor:', this.backgroundColor);
    
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
    // Minimal initialization - rely on event-driven readiness notifications
    if (this.diagnosticLogs) {
      console.log('🔍 PdfJsViewer: ngAfterViewInit - view initialized');
    }
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
        if (this.diagnosticLogs) {
          console.log(`🔍 PdfJsViewer: PostMessage readiness updated from ${this.postMessageReadiness} to ${event.data.readiness}`);
        }
        this.postMessageReadiness = event.data.readiness || 0;
        
        // CRITICAL FIX: Process queued actions when readiness level increases
        if (this.actionQueueManager) {
          this.actionQueueManager.updateReadiness(this.postMessageReadiness);
          this.actionQueueManager.processQueuedActions();
        }
        
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

      // Handle event notifications from PostMessage wrapper
      if (event.data && event.data.type === 'event-notification') {
        this.handleEventNotification(event.data);
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

    // Phase 2: Internal loading overlay control is system-driven and must be handled unconditionally
    if (property === 'loading') {
      this.isLoading = !!value;
      return;
    }



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

  private handleEventNotification(notification: any): void {
    const { eventName, eventData } = notification;
    
    if (this.diagnosticLogs) {
      console.log(`🔍 PdfJsViewer: Event notification received: ${eventName}`, eventData);
    }

    // Emit the appropriate event based on the event name
    switch (eventName) {
      case 'documentError':
        this.onDocumentError.emit(eventData);
        break;
        
      case 'documentInit':
        this.onDocumentInit.emit();
        break;
        
      case 'pagesInit':
        this.onPagesInit.emit(eventData);
        break;
        
      case 'presentationModeChanged':
        this.onPresentationModeChanged.emit(eventData);
        break;
        
      case 'openFile':
        this.onOpenFile.emit();
        break;
        
      case 'find':
        this.onFind.emit(eventData);
        break;
        
      case 'updateFindMatchesCount':
        this.onUpdateFindMatchesCount.emit(eventData);
        break;
        
      case 'metadataLoaded':
        this.onMetadataLoaded.emit(eventData);
        break;
        
      case 'outlineLoaded':
        this.onOutlineLoaded.emit(eventData);
        break;
        
      case 'pageRendered':
        this.onPageRendered.emit(eventData);
        break;
        
      case 'annotationLayerRendered':
        this.onAnnotationLayerRendered.emit(eventData);
        break;
        
      case 'bookmarkClick':
        this.onBookmarkClick.emit(eventData);
        break;
        
      case 'idle':
        this.onIdle.emit();
        break;
        
      default:
        if (this.diagnosticLogs) {
          console.log(`🔍 PdfJsViewer: Unknown event notification: ${eventName}`);
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
      // Use universal dispatcher instead of direct PostMessage
      this.dispatchAction(action, value, 'property-change');
    } else {
      // Property is intentionally not mapped (handled via query parameters or direct API)
          if (this.diagnosticLogs) {
        console.log(`🔍 PdfJsViewer: Property ${propertyName} is handled via query parameters or direct API, skipping`);
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
        
        // Use universal dispatcher for ALL actions - pure event-driven approach
        const action = this.mapPropertyToAction(propertyName);
        if (action) {
          if (this.diagnosticLogs) {
            console.log(`🔍 PdfJsViewer: Action ${propertyName} changed to ${change.currentValue} - using universal dispatcher`);
          }
          this.dispatchAction(action, change.currentValue, 'property-change');
    } else {
      if (this.diagnosticLogs) {
            console.log(`🔍 PdfJsViewer: Property ${propertyName} has no action mapping - skipping`);
      }
    }
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
        
        // Use universal dispatcher for ALL actions - pure event-driven approach
        const action = this.mapPropertyToAction(propertyName);
        if (action) {
        if (this.diagnosticLogs) {
            console.log(`🔍 PdfJsViewer: Action ${propertyName} changed to ${change.currentValue} - using universal dispatcher`);
          }
          this.dispatchAction(action, change.currentValue, 'property-change');
        } else {
          if (this.diagnosticLogs) {
            console.log(`🔍 PdfJsViewer: Property ${propertyName} has no action mapping - skipping`);
          }
        }
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

        // Note: pagesInit event is now handled via the PostMessage wrapper event system

        const pagesLoadedHandler = () => {
          if (this.diagnosticLogs) console.debug("PdfJsViewer: All pages have been fully loaded!");

          // Execute auto-print on pages loaded (ensures PDF is fully ready for printing)
          if (this.printOnLoad === true) {
            if (this.diagnosticLogs) {
              console.log('🔍 PdfJsViewer: Executing auto-print on pages loaded via universal dispatcher');
            }
            this.dispatchAction('trigger-print', true, 'initial-load');
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
          pagesloaded: pagesLoadedHandler,
          beforeprint: beforePrintHandler,
          afterprint: afterPrintHandler,
          pagechanging: pageChangingHandler,
          rotationchanging: rotationChangingHandler,
          scalechanging: scaleChangingHandler
        };
        
        // Attach event listeners
        eventBus.on("documentloaded", documentLoadedHandler);
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
    console.log('🎨 THEME DEBUG: queueAllConfigurations called');
    if (this.diagnosticLogs) {
      console.log('🔍 PdfJsViewer: queueAllConfigurations called');
    }
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

    // Phase C: Toolbar/Sidebar group visibility
    this.queueConfiguration('showToolbarLeft', this.showToolbarLeft, 'show-toolbar-left');
    this.queueConfiguration('showToolbarMiddle', this.showToolbarMiddle, 'show-toolbar-middle');
    this.queueConfiguration('showToolbarRight', this.showToolbarRight, 'show-toolbar-right');
    this.queueConfiguration('showSecondaryToolbarToggle', this.showSecondaryToolbarToggle, 'show-secondary-toolbar-toggle');
    this.queueConfiguration('showSidebar', this.showSidebar, 'show-sidebar');
    this.queueConfiguration('showSidebarLeft', this.showSidebarLeft, 'show-sidebar-left');
    this.queueConfiguration('showSidebarRight', this.showSidebarRight, 'show-sidebar-right');

    // Phase D: Layout customization
    this.queueConfiguration('toolbarDensity', this.toolbarDensity, 'set-toolbar-density');
    if (this.sidebarWidth) {
      this.queueConfiguration('sidebarWidth', this.sidebarWidth, 'set-sidebar-width');
    }
    this.queueConfiguration('toolbarPosition', this.toolbarPosition, 'set-toolbar-position');
    this.queueConfiguration('sidebarPosition', this.sidebarPosition, 'set-sidebar-position');
    if (this.responsiveBreakpoint !== undefined) {
      this.queueConfiguration('responsiveBreakpoint', this.responsiveBreakpoint, 'set-responsive-breakpoint');
    }

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
    // Queue navigation configuration if specified
    if (this.namedDest && this.namedDest.trim() !== '') {
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

    // Queue theme and visual customization configurations (Phase 1)
    // Always queue theme to ensure initial styles are applied
    console.log(`🎨 THEME DEBUG: this.theme = ${this.theme}, type = ${typeof this.theme}`);
    console.log(`🎨 THEME DEBUG: Calling queueConfiguration for theme`);
    this.queueConfiguration('theme', this.theme || 'light', 'set-theme');
    if (this.diagnosticLogs) {
      console.log(`🔍 PdfJsViewer: Queuing theme configuration: ${this.theme || 'light'}`);
    }
    if (this.primaryColor) {
      this.queueConfiguration('primaryColor', this.primaryColor, 'set-primary-color');
    }
    if (this.backgroundColor) {
      this.queueConfiguration('backgroundColor', this.backgroundColor, 'set-background-color');
    }
    if (this.pageBorderColor) {
      this.queueConfiguration('pageBorderColor', this.pageBorderColor, 'set-page-border-color');
    }
    if (this.toolbarColor) {
      this.queueConfiguration('toolbarColor', this.toolbarColor, 'set-toolbar-color');
    }
    if (this.textColor) {
      this.queueConfiguration('textColor', this.textColor, 'set-text-color');
    }
    if (this.borderRadius) {
      this.queueConfiguration('borderRadius', this.borderRadius, 'set-border-radius');
    }
    if (this.customCSS) {
      this.queueConfiguration('customCSS', this.customCSS, 'set-custom-css');
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

    // Queue new high-value event configurations
    if (this.onDocumentError) {
      this.queueConfiguration('documentError', true, 'enable-document-error');
    }
    if (this.onDocumentInit) {
      this.queueConfiguration('documentInit', true, 'enable-document-init');
    }
    if (this.onPagesInit) {
      this.queueConfiguration('pagesInit', true, 'enable-pages-init');
    }
    if (this.onPresentationModeChanged) {
      this.queueConfiguration('presentationModeChanged', true, 'enable-presentation-mode-changed');
    }
    if (this.onOpenFile) {
      this.queueConfiguration('openFile', true, 'enable-open-file');
    }
    if (this.onFind) {
      this.queueConfiguration('find', true, 'enable-find');
    }
    if (this.onUpdateFindMatchesCount) {
      this.queueConfiguration('updateFindMatchesCount', true, 'enable-update-find-matches-count');
    }
    if (this.onMetadataLoaded) {
      this.queueConfiguration('metadataLoaded', true, 'enable-metadata-loaded');
    }
    if (this.onOutlineLoaded) {
      this.queueConfiguration('outlineLoaded', true, 'enable-outline-loaded');
    }
    if (this.onPageRendered) {
      this.queueConfiguration('pageRendered', true, 'enable-page-rendered');
    }
    
    // New high-value events (Phase 2)
    if (this.onAnnotationLayerRendered) {
      this.queueConfiguration('annotationLayerRendered', true, 'enable-annotation-layer-rendered');
    }
    if (this.onBookmarkClick) {
      this.queueConfiguration('bookmarkClick', true, 'enable-bookmark-click');
    }
    if (this.onIdle) {
      this.queueConfiguration('idle', true, 'enable-idle');
    }

    // Note: Auto-actions are now queued when the document loads, not during component initialization
    // This ensures they use the current property values at the time of document load
  }

  private queueAutoActionsForDocumentLoad(): void {
    // Use universal dispatcher for auto-actions
    if (this.downloadOnLoad === true) {
      if (this.diagnosticLogs) {
        console.log('🔍 PdfJsViewer: Queueing auto-download via universal dispatcher');
      }
      this.dispatchAction('trigger-download', true, 'initial-load');
    }
    
    if (this.showLastPageOnLoad === true) {
      if (this.diagnosticLogs) {
        console.log('🔍 PdfJsViewer: Queueing auto-last-page via universal dispatcher');  
      }
      this.dispatchAction('go-to-last-page', true, 'initial-load');
    }
    
    // Auto-print is handled in pagesLoadedHandler for timing reasons
  }

  private queueConfiguration(propertyName: string, value: any, action: string): void {
    if (this.diagnosticLogs) {
      console.log(`🔍 PdfJsViewer: Queueing configuration ${propertyName} = ${value} via universal dispatcher`);
    }
    
    // Use universal dispatcher for all configuration actions
    this.dispatchAction(action, value, 'initial-load');
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

  // #region Public Methods for On-Demand Actions
  public triggerDownload(): Promise<ActionExecutionResult> {
    // Use universal dispatcher for user interactions - now always returns Promise<ActionExecutionResult>
    return this.dispatchAction('trigger-download', true, 'user-interaction');
  }

  public triggerPrint(): Promise<ActionExecutionResult> {
    // Use universal dispatcher for user interactions - now always returns Promise<ActionExecutionResult>
    return this.dispatchAction('trigger-print', true, 'user-interaction');
  }

  public setPage(page: number): Promise<ActionExecutionResult> {
    // Use universal dispatcher for user interactions - now always returns Promise<ActionExecutionResult>
    return this.dispatchAction('set-page', page, 'user-interaction');
  }

  public setZoom(zoom: string): Promise<ActionExecutionResult> {
    // Use universal dispatcher for user interactions - now always returns Promise<ActionExecutionResult>
    return this.dispatchAction('set-zoom', zoom, 'user-interaction');
  }

  public goToLastPage(): Promise<ActionExecutionResult> {
    // Use universal dispatcher for user interactions - now always returns Promise<ActionExecutionResult>
    return this.dispatchAction('go-to-last-page', true, 'user-interaction');
  }

  public setCursor(cursor: string): Promise<ActionExecutionResult> {
    // Use universal dispatcher for user interactions
    return this.dispatchAction('set-cursor', cursor, 'user-interaction');
  }

  public setScroll(scroll: string): Promise<ActionExecutionResult> {
    // Use universal dispatcher for user interactions
    return this.dispatchAction('set-scroll', scroll, 'user-interaction');
  }

  public setSpread(spread: string): Promise<ActionExecutionResult> {
    // Use universal dispatcher for user interactions
    return this.dispatchAction('set-spread', spread, 'user-interaction');
  }

  public triggerRotation(direction: 'cw' | 'ccw'): Promise<ActionExecutionResult> {
    // Use universal dispatcher for user interactions
    const action = direction === 'cw' ? 'trigger-rotate-cw' : 'trigger-rotate-ccw';
    return this.dispatchAction(action, true, 'user-interaction');
  }

  public goToPage(page: number): Promise<ActionExecutionResult> {
    // Alias for setPage for backward compatibility
    return this.setPage(page);
  }
  // #endregion

  // Action queue management methods
  public getActionStatus(actionId: string): 'pending' | 'executing' | 'completed' | 'failed' | 'not-found' {
    if (!this.actionQueueManager) {
      return 'not-found';
    }
    return this.actionQueueManager.getActionStatus(actionId);
  }

  public getQueueStatus(): { queuedActions: number; executedActions: number } {
    if (!this.actionQueueManager) {
      return {
        queuedActions: 0,
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
  private loadPdf(): void {
    if (!this.validatePdfSource()) return;
    
    this.setupExternalWindow();
    const fileUrl = this.createFileUrl();
    const viewerUrl = this.buildViewerUrl(fileUrl);
    this.navigateToViewer(viewerUrl);
  }

  private validatePdfSource(): boolean {
    return !!this._src;
  }

  private setupExternalWindow(): void {
    if (!this.externalWindow) return;
    
    if (typeof this.viewerTab === 'undefined' || this.viewerTab.closed) {
      this.viewerTab = window.open('', this.target, this.externalWindowOptions || '');
      if (this.viewerTab == null) {
        console.error("ng2-pdfjs-viewer: For 'externalWindow = true'. i.e opening in new tab to work, pop-ups should be enabled.");
        return;
      }

      if (this.showSpinner) {
        this.renderLoadingSpinner();
      }
    }
  }

  private renderLoadingSpinner(): void {
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

  private createFileUrl(): string {
    this.relaseUrl?.();
    
    if (this._src instanceof Blob) {
      const url = URL.createObjectURL(this._src);
      this.relaseUrl = () => URL.revokeObjectURL(url);
      return encodeURIComponent(url);
    } else if (this._src instanceof Uint8Array) {
      let blob = new Blob([this._src], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      this.relaseUrl = () => URL.revokeObjectURL(url);
      return encodeURIComponent(url);
    } else {
      return this._src;
    }
  }

  private buildViewerUrl(fileUrl: string): string {
    let viewerUrl = this.getBaseViewerUrl();
    viewerUrl = this.addFileParameter(viewerUrl, fileUrl);
    viewerUrl = this.addViewerIdParameter(viewerUrl);
    viewerUrl = this.addCacheBustingIfNeeded(viewerUrl);
    
    return viewerUrl;
  }

  private getBaseViewerUrl(): string {
    return this.viewerFolder 
      ? `${this.viewerFolder}/web/viewer.html`
      : `assets/pdfjs/web/viewer.html`;
  }

  private addFileParameter(viewerUrl: string, fileUrl: string): string {
    return `${viewerUrl}?file=${fileUrl}`;
  }

  private addViewerIdParameter(viewerUrl: string): string {
    return typeof this.viewerId !== 'undefined' 
      ? `${viewerUrl}&viewerId=${this.viewerId}`
      : viewerUrl;
  }

  private addCacheBustingIfNeeded(viewerUrl: string): string {
    if (this.isDevelopmentMode()) {
      const cacheBuster = Date.now();
      if (this.diagnosticLogs) {
        console.log(`🔍 PdfJsViewer: Development mode detected, using cache-busting timestamp: ${cacheBuster}`);
      }
      return `${viewerUrl}&_t=${cacheBuster}`;
    } else {
      if (this.diagnosticLogs) {
        console.log(`🔍 PdfJsViewer: Production mode detected, no cache-busting applied`);
      }
      return viewerUrl;
    }
  }

  private isDevelopmentMode(): boolean {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' || 
           window.location.port === '4200' ||
           window.location.href.includes('localhost:4200');
  }

  private navigateToViewer(viewerUrl: string): void {
    if (this.externalWindow) {
      this.viewerTab.location.href = viewerUrl;
    } else {
      this.iframe.nativeElement.contentWindow.location.replace(viewerUrl);
    }
    
    if (this.diagnosticLogs) {
      this.logViewerConfiguration(viewerUrl);
    }
  }

  private logViewerConfiguration(viewerUrl: string): void {
      console.debug(`PdfJsViewer: Minimal URL configuration:
        pdfSrc = ${this.pdfSrc}
        externalWindow = ${this.externalWindow}
        viewerFolder = ${this.viewerFolder}
        viewerId = ${this.viewerId}
      finalUrl = ${viewerUrl}
        
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
  // #endregion

  // #region Two-Way Binding Helper Methods
  private applyZoomToViewer(zoom: string): void {
    // Use universal dispatcher - it will handle readiness checking and queuing
    this.dispatchAction('set-zoom', zoom, 'property-change');
  }

  private applyRotationToViewer(rotation: number): void {
    // Use universal dispatcher - it will handle readiness checking and queuing
    this.dispatchAction('set-rotation', rotation, 'property-change');
  }

  private applyCursorToViewer(cursor: string): void {
    // Use universal dispatcher - it will handle readiness checking and queuing
    this.dispatchAction('set-cursor', cursor, 'property-change');
  }

  private applyScrollToViewer(scroll: string): void {
    // Use universal dispatcher - it will handle readiness checking and queuing
    this.dispatchAction('set-scroll', scroll, 'property-change');
  }

  private applySpreadToViewer(spread: string): void {
    // Use universal dispatcher - it will handle readiness checking and queuing
    this.dispatchAction('set-spread', spread, 'property-change');
  }

  private applyPageModeToViewer(pageMode: string): void {
    // Use universal dispatcher - it will handle readiness checking and queuing
    this.dispatchAction('update-page-mode', pageMode, 'property-change');
  }
  // #endregion

  // Universal Action Dispatcher - ALL actions go through readiness-based queuing
  private dispatchAction(action: string, payload: any, source: 'initial-load' | 'property-change' | 'user-interaction' = 'property-change'): Promise<ActionExecutionResult> {
    const requiredReadiness = this.getRequiredReadinessLevel(action);
    const actionObj: ViewerAction = {
      id: `${source}-${action}-${Date.now()}`,
      action: action,
      payload: payload
    };

    if (this.diagnosticLogs) {
      console.log(`🔍 Universal Dispatcher: Action ${action} requires readiness ${requiredReadiness}, current: ${this.postMessageReadiness}`);
    }
    
    // Check if we have sufficient readiness to execute immediately
    if (this.hasRequiredReadiness(requiredReadiness)) {
      if (this.diagnosticLogs) {
        console.log(`🔍 Universal Dispatcher: Executing ${action} immediately (readiness satisfied)`);
      }
      return this.actionQueueManager.executeAction(actionObj);
    } else {
      if (this.diagnosticLogs) {
        console.log(`🔍 Universal Dispatcher: Queueing ${action} until readiness ${requiredReadiness}`);
      }
      // Queue action to execute when readiness is achieved
      this.actionQueueManager.queueAction(actionObj, requiredReadiness);
      
      // Return a promise that resolves when the action eventually executes
      return Promise.resolve({
        actionId: actionObj.id,
        success: true,
        timestamp: Date.now()
      } as ActionExecutionResult);
    }
  }

  private getRequiredReadinessLevel(action: string): number {
    // Define readiness requirements for all actions
    const level1Actions = ['set-theme', 'set-primary-color', 'set-background-color', 'set-page-border-color', 'set-toolbar-color', 'set-text-color', 'set-border-radius', 'set-custom-css'];
    const level3Actions = ['show-download', 'show-print', 'show-fullscreen', 'show-find', 'show-bookmark', 'show-openfile', 'show-annotations', 'set-error-message', 'set-error-override', 'set-error-append', 'set-css-zoom',
      // Phase C actions (DOM visibility toggles)
      'show-toolbar-left','show-toolbar-middle','show-toolbar-right','show-secondary-toolbar-toggle','show-sidebar','show-sidebar-left','show-sidebar-right'
    ];
    const level4Actions = ['set-cursor', 'set-scroll', 'set-spread', 'set-zoom', 'update-page-mode', 'set-locale',
      // Phase D layout requires components ready to measure
      'set-toolbar-density', 'set-sidebar-width', 'set-toolbar-position', 'set-sidebar-position', 'set-responsive-breakpoint'
    ];
    const level5Actions = ['set-page', 'set-rotation', 'go-to-last-page', 'go-to-named-dest', 'trigger-download', 'trigger-print', 'trigger-rotate-cw', 'trigger-rotate-ccw'];

    if (level1Actions.includes(action)) return 1; // VIEWER_LOADED - DOM access only
    if (level3Actions.includes(action)) return 3; // EVENTBUS_READY
    if (level4Actions.includes(action)) return 4; // COMPONENTS_READY  
    if (level5Actions.includes(action)) return 5; // DOCUMENT_LOADED
    return 3; // Default to EVENTBUS_READY
  }

  private hasRequiredReadiness(requiredLevel: number): boolean {
    if (!this.isPostMessageReady) return false;
    if (requiredLevel === 5 && !this.actionQueueManager?.isDocumentLoaded) return false;
    return this.postMessageReadiness >= requiredLevel;
  }
}

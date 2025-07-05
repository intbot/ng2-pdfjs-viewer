import { Component, Input, Output, OnInit, OnDestroy, ViewChild, EventEmitter, ElementRef, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';

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

// Action Queue System Interfaces
interface ViewerAction {
  id: string;
  type: 'auto' | 'demand' | 'conditional';
  action: string;
  payload: any;
  condition?: (viewer: any) => boolean;
  delay?: number; // milliseconds
  retryCount?: number;
  retryDelay?: number;
}

interface ActionExecutionResult {
  actionId: string;
  success: boolean;
  error?: string;
  timestamp: number;
}

// Action Queue Manager
class ActionQueueManager {
  private autoActions: ViewerAction[] = [];
  private pendingActions: ViewerAction[] = [];
  private executedActions: Map<string, ActionExecutionResult> = new Map();
  private isDocumentLoaded = false;
  private isPostMessageReady = false;
  private diagnosticLogs = false;

  constructor(diagnosticLogs = false) {
    this.diagnosticLogs = diagnosticLogs;
  }

  // Set PostMessage API readiness
  setPostMessageReady(ready: boolean): void {
    this.isPostMessageReady = ready;
    if (this.diagnosticLogs) {
      console.log('🔍 ActionQueue: PostMessage API ready:', ready);
    }
  }

  // Queue auto-action for execution after document load
  queueAutoAction(action: ViewerAction): void {
    if (this.diagnosticLogs) {
      console.log('🔍 ActionQueue: Queuing auto-action:', action.id, action.action);
    }
    
    this.autoActions.push(action);
    
    // If document is already loaded and PostMessage is ready, execute immediately
    if (this.isDocumentLoaded && this.isPostMessageReady) {
      this.executeAction(action);
    }
  }

  // Queue on-demand action for immediate execution
  queueOnDemandAction(action: ViewerAction): Promise<ActionExecutionResult> {
    if (this.diagnosticLogs) {
      console.log('🔍 ActionQueue: Queuing on-demand action:', action.id, action.action);
    }
    
    this.pendingActions.push(action);
    
    // Execute immediately if PostMessage is ready
    if (this.isPostMessageReady) {
      return this.executeAction(action);
    } else {
      return Promise.reject(new Error('PostMessage API not ready'));
    }
  }

  // Called when document is loaded
  onDocumentLoaded(): void {
    if (this.diagnosticLogs) {
      console.log('🔍 ActionQueue: Document loaded, executing', this.autoActions.length, 'auto-actions');
    }
    
    this.isDocumentLoaded = true;
    
    // Execute all queued auto-actions
    this.autoActions.forEach(action => {
      this.executeAction(action);
    });
    
    this.autoActions = []; // Clear auto-actions queue
  }

  // Execute a single action
  private async executeAction(action: ViewerAction): Promise<ActionExecutionResult> {
    const result: ActionExecutionResult = {
      actionId: action.id,
      success: false,
      timestamp: Date.now()
    };

    try {
      if (this.diagnosticLogs) {
        console.log('🔍 ActionQueue: Executing action:', action.id, action.action, action.payload);
      }

      // Check condition if present
      if (action.condition && !action.condition(null)) {
        result.error = 'Condition not met';
        this.executedActions.set(action.id, result);
        return result;
      }

      // Apply delay if specified
      if (action.delay && action.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, action.delay));
      }

      // Execute the action via PostMessage
      // This will be implemented to call the component's sendControlMessage method
      const success = await this.executeActionViaPostMessage(action);
      
      result.success = success;
      
      if (!success && action.retryCount && action.retryCount > 0) {
        // Retry logic could be implemented here
        if (this.diagnosticLogs) {
          console.log('🔍 ActionQueue: Action failed, retries available:', action.retryCount);
        }
      }

    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
      if (this.diagnosticLogs) {
        console.error('🔍 ActionQueue: Action execution failed:', action.id, result.error);
      }
    }

    this.executedActions.set(action.id, result);
    return result;
  }

  // This method will be overridden by the component to actually send PostMessage
  private async executeActionViaPostMessage(action: ViewerAction): Promise<boolean> {
    // This is a placeholder - will be implemented by the component
    return false;
  }

  // Set the PostMessage executor function
  setPostMessageExecutor(executor: (action: string, payload: any) => Promise<any>): void {
    this.executeActionViaPostMessage = async (action: ViewerAction): Promise<boolean> => {
      try {
        await executor(action.action, action.payload);
        return true;
      } catch (error) {
        return false;
      }
    };
  }

  // Get action status
  getActionStatus(actionId: string): 'pending' | 'executing' | 'completed' | 'failed' | 'not-found' {
    const result = this.executedActions.get(actionId);
    if (!result) {
      return this.autoActions.some(a => a.id === actionId) || 
             this.pendingActions.some(a => a.id === actionId) ? 'pending' : 'not-found';
    }
    return result.success ? 'completed' : 'failed';
  }

  // Clear all queues
  clearQueues(): void {
    this.autoActions = [];
    this.pendingActions = [];
    this.executedActions.clear();
    if (this.diagnosticLogs) {
      console.log('🔍 ActionQueue: All queues cleared');
    }
  }

  // Get queue status
  getQueueStatus(): { autoActions: number; pendingActions: number; executedActions: number } {
    return {
      autoActions: this.autoActions.length,
      pendingActions: this.pendingActions.length,
      executedActions: this.executedActions.size
    };
  }
}

export type ChangedPage = number;
export type ChangedScale = number;
export interface ChangedRotation {
  rotation: number;
  page: number;
}

@Component({
  selector: 'ng2-pdfjs-viewer',
  standalone: false,
  template: `<iframe title="ng2-pdfjs-viewer" [hidden]="externalWindow || (!externalWindow && !pdfSrc)" #iframe width="100%" height="100%"></iframe>`
})
export class PdfJsViewerComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @ViewChild('iframe', { static: true }) iframe: ElementRef;
  static lastID = 0;
  @Input() public viewerId = `ng2-pdfjs-viewer-ID${++PdfJsViewerComponent.lastID}`;
  @Output() onBeforePrint: EventEmitter<void> = new EventEmitter();
  @Output() onAfterPrint: EventEmitter<void> = new EventEmitter();
  @Output() onDocumentLoad: EventEmitter<void> = new EventEmitter();
  @Output() onPageChange: EventEmitter<ChangedPage> = new EventEmitter();
  @Output() onScaleChange: EventEmitter<ChangedScale> = new EventEmitter();
  @Output() onRotationChange: EventEmitter<ChangedRotation> = new EventEmitter();
  @Input() public viewerFolder: string;
  @Input() public externalWindow: boolean = false;
  @Input() public target: string = '_blank';
  @Input() public showSpinner: boolean = true;
  @Input() public downloadFileName: string;
  @Input() public openFile: boolean = true;
  @Input() public annotations: boolean = false;
  @Input() public download: boolean = true;
  @Input() public startDownload: boolean;
  @Input() public viewBookmark: boolean = true;
  @Input() public print: boolean = true;
  @Input() public startPrint: boolean;
  @Input() public fullScreen: boolean = true;
  //@Input() public showFullScreen: boolean;
  @Input() public find: boolean = true;
  @Input() public zoom: string;
  @Input() public nameddest: string;
  @Input() public pagemode: string;
  @Input() public lastPage: boolean;
  @Input() public cursor: string;
  @Input() public scroll: string;
  @Input() public spread: string;
  @Input() public locale: string;
  @Input() public useOnlyCssZoom: boolean = false;
  @Input() public errorOverride: boolean = false;
  @Input() public errorAppend: boolean = true;
  @Input() public errorMessage: string;
  @Input() public diagnosticLogs: boolean = false;

  @Input() public externalWindowOptions: string;
  public viewerTab: any;
  private _src: string | Blob | Uint8Array;
  private _page: number;

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
      return this._page || 1; // Return stored value or default
    }
  }

  @Input()
  public set pdfSrc(_src: string | Blob | Uint8Array) {
    this._src = _src;
  }

  public get pdfSrc() {
    return this._src;
  }

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

  private isPostMessageReady = false;
  private pendingInitialConfig = true;
  private postMessageTimeout: any;
  private actionQueueManager: ActionQueueManager;

  ngOnInit(): void {   
    // Initialize action queue manager
    this.actionQueueManager = new ActionQueueManager(this.diagnosticLogs);
    
    // Connect action queue manager to PostMessage system
    this.actionQueueManager.setPostMessageExecutor((action, payload) => this.sendControlMessage(action, payload));
    
    // Set up PostMessage listener
    this.setupMessageListener();
    
    // Set a timeout for PostMessage API readiness
    this.postMessageTimeout = setTimeout(() => {
      if (!this.isPostMessageReady) {
        console.warn('🔍 PdfJsViewer: PostMessage API timeout, proceeding without dynamic controls');
        this.isPostMessageReady = true;
        this.pendingInitialConfig = false;
        this.actionQueueManager.setPostMessageReady(true);
      }
    }, 5000); // 5 second timeout
    
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
          if (this.diagnosticLogs) {
            console.log(`🔍 PdfJsViewer: Value changed for ${propertyName}, updating viewer`);
          }
          this.updateViewerControl(propertyName, change.currentValue);
        } else {
        console.log(`🔍 PdfJsViewer: No change detected for ${propertyName}`);
      }
    });
  }

  private messageIdCounter = 0;
  private pendingMessages = new Map<string, { resolve: Function, reject: Function, timeout: any }>();

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

      // Set up response handler
      const timeout = setTimeout(() => {
        this.pendingMessages.delete(messageId);
        reject(new Error(`Timeout waiting for response to ${action}`));
      }, 5000); // 5 second timeout

      this.pendingMessages.set(messageId, { resolve, reject, timeout });

      // Send message to iframe
      if (this.iframe && this.iframe.nativeElement && this.iframe.nativeElement.contentWindow) {
        this.iframe.nativeElement.contentWindow.postMessage(message, '*');
        if (this.diagnosticLogs) {
          console.log('🔍 PdfJsViewer: Sent control message:', action, payload);
        }
      } else {
        clearTimeout(timeout);
        this.pendingMessages.delete(messageId);
        reject(new Error('Iframe not available'));
      }
    });
  }

  private handleControlResponse(response: ControlResponse): void {
    const pendingMessage = this.pendingMessages.get(response.id);
    if (pendingMessage) {
      clearTimeout(pendingMessage.timeout);
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
        this.pendingInitialConfig = false;
        this.actionQueueManager.setPostMessageReady(true);
        
        // Clear the timeout since we got the ready notification
        if (this.postMessageTimeout) {
          clearTimeout(this.postMessageTimeout);
          this.postMessageTimeout = null;
        }
        
        // Apply any pending changes that occurred before PostMessage API was ready
        this.applyPendingChanges();
        return;
      }
    });
  }

  private mapPropertyToAction(propertyName: string): string | null {
    const actionMap: { [key: string]: string } = {
      // Button visibility controls
      'download': 'show-download',
      'print': 'show-print',
      'fullScreen': 'show-fullscreen',
      'find': 'show-find',
      'viewBookmark': 'show-bookmark',
      'annotations': 'show-annotations',
      'openFile': 'show-openfile',
      
      // Mode controls
      'zoom': 'set-zoom',
      'cursor': 'set-cursor',
      'scroll': 'set-scroll',
      'spread': 'set-spread',
      
      // Navigation controls
      'page': 'set-page',
      'nameddest': 'go-to-named-dest',
      'pagemode': 'update-page-mode',
      
      // Auto actions
      'startDownload': 'trigger-download',
      'startPrint': 'trigger-print',
      
      'lastPage': 'go-to-last-page',
      
      // Properties that don't need PostMessage (handled via query params or direct API)
      'pdfSrc': null, // Handled via URL
      'viewerId': null, // Handled via iframe ID
      'downloadFileName': null, // Handled via query params
      'locale': null, // Handled via query params
      'useOnlyCssZoom': null, // Handled via query params
      'errorOverride': null, // Handled via query params
      'errorAppend': null, // Handled via query params
      'errorMessage': null, // Handled via query params
      'diagnosticLogs': null, // Handled via component logic
      'viewerFolder': null, // Handled via component logic
      'externalWindow': null, // Handled via component logic
      'target': null, // Handled via component logic
      'showSpinner': null, // Handled via component logic
      'externalWindowOptions': null // Handled via component logic
    };
    
    return actionMap[propertyName] || null;
  }

  private updateViewerControl(propertyName: string, value: any): void {
    if (this.diagnosticLogs) {
      console.log(`🔍 PdfJsViewer: updateViewerControl called with propertyName: ${propertyName}, value:`, value);
    }
    
    const action = this.mapPropertyToAction(propertyName);
    if (action === null) {
      // Property is intentionally not mapped (handled via query params or direct API)
      if (this.diagnosticLogs) {
        console.log(`🔍 PdfJsViewer: Property ${propertyName} is handled via query parameters or direct API, skipping PostMessage`);
      }
    } else if (action) {
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
      // Property not found in action map - this should not happen with our current mapping
      if (this.diagnosticLogs) {
        console.warn(`🔍 PdfJsViewer: No action mapping found for property ${propertyName} - this property may need to be added to the action map`);
      }
    }
  }

  private pendingChanges: SimpleChanges[] = [];

  private applyPendingChanges(): void {
    console.log(`🔍 PdfJsViewer: applyPendingChanges called, pending changes count: ${this.pendingChanges.length}`);
    
    // Only apply pending changes if PostMessage API is ready
    if (!this.isPostMessageReady) {
      console.log('🔍 PdfJsViewer: PostMessage API not ready, skipping pending changes');
      return;
    }
    
    if (this.pendingChanges.length > 0) {
      console.log('🔍 PdfJsViewer: Applying pending changes:', this.pendingChanges);
      this.pendingChanges.forEach((changes, index) => {
        console.log(`🔍 PdfJsViewer: Applying pending change ${index + 1}:`, changes);
        this.applyChanges(changes);
      });
      this.pendingChanges = [];
      console.log('🔍 PdfJsViewer: Cleared pending changes');
    } else {
      console.log('🔍 PdfJsViewer: No pending changes to apply');
    }
  }

  /**
   * Waits for the PDF.js viewer to be ready, and binds the the event bus.
   */
  private bindToPdfJsEventBus() {
    document.addEventListener("webviewerloaded", () => {
      if (this.diagnosticLogs) console.debug("PdfJsViewer: webviewerloaded event received");
      if (!this.PDFViewerApplication) {
        if (this.diagnosticLogs) console.debug("PdfJsViewer: Viewer not yet (or no longer) available, events can not yet be bound.");
        return;
      }

      // https://github.com/mozilla/pdf.js/issues/9527
      this.PDFViewerApplication.initializedPromise.then(() => {
        // Configure the controls.
        const app = this.configureVisibleFeatures();
        
        // Apply any pending changes that occurred before initialization
        this.applyPendingChanges();

        const eventBus = app.eventBus;
        // Once initialized, attach the events.
        // Document Loaded.
        eventBus.on("documentloaded", () => {
          if (this.diagnosticLogs) console.debug("PdfJsViewer: The document has now been loaded!");
          this.onDocumentLoad.emit();
          
          // Execute all queued auto-actions
          this.actionQueueManager.onDocumentLoaded();
        });

        // Pages init.
        eventBus.on("pagesinit", () => {
          if (this.diagnosticLogs) console.debug("PdfJsViewer: All pages have been rendered!");
        });

        // Before print.
        eventBus.on("beforeprint", () => {
          if (this.diagnosticLogs) console.debug("PdfJsViewer: The document is about to be printed!");
          this.onBeforePrint.emit();
        });

        // After print.
        eventBus.on("afterprint", () => {
          if (this.diagnosticLogs) console.debug("PdfJsViewer: The document has been printed!");
          this.onAfterPrint.emit();
        });

        // Page change.
        eventBus.on("pagechanging", (event) => {
          if (this.diagnosticLogs) console.debug("PdfJsViewer: The page has changed:", event.pageNumber);
          this.onPageChange.emit(event.pageNumber);
        });

        // Rotation change.
        eventBus.on("rotationchanging", (event) => {
          const newRotation: ChangedRotation = {
            rotation: event.pagesRotation,
            page: event.pageNumber
          }
          if (this.diagnosticLogs) console.debug("PdfJsViewer: The rotation has changed!", event);
          this.onRotationChange.emit(newRotation);
        })

        // Scale change.
        eventBus.on("scalechanging", (event) => {
          const newScale: ChangedScale = event.scale;
          if (this.diagnosticLogs) console.debug("PdfJsViewer: The document has scale has changed!", newScale);
          this.onScaleChange.emit(newScale);
        })
      });
    });
  }

  private configureVisibleFeatures() {
    const app = this.PDFViewerApplication;
    
    // If PostMessage API is not ready yet, queue the configuration
    if (!this.isPostMessageReady) {
      if (this.diagnosticLogs) {
        console.log('🔍 PdfJsViewer: PostMessage API not ready, queuing initial configuration');
      }
      this.pendingInitialConfig = true;
      return app;
    }
    
    if (this.diagnosticLogs) {
      console.log('🔍 PdfJsViewer: Applying initial configuration via PostMessage');
    }
    
    // Use PostMessage for initial configuration
    this.updateViewerControl('openFile', this.openFile);
    this.updateViewerControl('download', this.download);
    this.updateViewerControl('print', this.print);
    this.updateViewerControl('fullScreen', this.fullScreen);
    this.updateViewerControl('find', this.find);
    this.updateViewerControl('viewBookmark', this.viewBookmark);
    this.updateViewerControl('annotations', this.annotations);
    this.updateViewerControl('cursor', this.cursor);
    this.updateViewerControl('scroll', this.scroll);
    this.updateViewerControl('spread', this.spread);
    
    // Handle navigation properties
    if (this.nameddest) {
      this.updateViewerControl('nameddest', this.nameddest);
    }
    if (this.pagemode) {
      this.updateViewerControl('pagemode', this.pagemode);
    }
    
    // Queue auto actions for execution after document load
    if (this.startDownload) {
      this.actionQueueManager.queueAutoAction({
        id: 'auto-download',
        type: 'auto',
        action: 'trigger-download',
        payload: true,
        delay: 1000 // Wait 1 second after document load
      });
    }
    if (this.startPrint) {
      this.actionQueueManager.queueAutoAction({
        id: 'auto-print',
        type: 'auto',
        action: 'trigger-print',
        payload: true,
        delay: 2000 // Wait 2 seconds after document load
      });
    }
    if (this.lastPage) {
      this.actionQueueManager.queueAutoAction({
        id: 'auto-last-page',
        type: 'auto',
        action: 'go-to-last-page',
        payload: true,
        delay: 500 // Wait 0.5 seconds after document load
      });
    }
    
    this.pendingInitialConfig = false;
    return app;
  }

  public refresh(): void { // Needs to be invoked for external window or when needs to reload pdf
    this.loadPdf();
  }

  // Public method for external control messages
  public sendViewerControlMessage(action: string, payload: any): Promise<any> {
    return this.sendControlMessage(action, payload);
  }

  // Public methods for on-demand actions
  public triggerDownload(): Promise<ActionExecutionResult> {
    return this.actionQueueManager.queueOnDemandAction({
      id: `download-${Date.now()}`,
      type: 'demand',
      action: 'trigger-download',
      payload: true
    });
  }

  public triggerPrint(): Promise<ActionExecutionResult> {
    return this.actionQueueManager.queueOnDemandAction({
      id: `print-${Date.now()}`,
      type: 'demand',
      action: 'trigger-print',
      payload: true
    });
  }

  public triggerRotation(direction: 'cw' | 'ccw'): Promise<ActionExecutionResult> {
    const action = direction === 'cw' ? 'trigger-rotate-cw' : 'trigger-rotate-ccw';
    return this.actionQueueManager.queueOnDemandAction({
      id: `rotate-${direction}-${Date.now()}`,
      type: 'demand',
      action: action,
      payload: true
    });
  }

  public goToPage(page: number): Promise<ActionExecutionResult> {
    return this.actionQueueManager.queueOnDemandAction({
      id: `page-${page}-${Date.now()}`,
      type: 'demand',
      action: 'set-page',
      payload: page
    });
  }

  public setZoom(zoom: string): Promise<ActionExecutionResult> {
    return this.actionQueueManager.queueOnDemandAction({
      id: `zoom-${zoom}-${Date.now()}`,
      type: 'demand',
      action: 'set-zoom',
      payload: zoom
    });
  }

  // Action queue management methods
  public getActionStatus(actionId: string): 'pending' | 'executing' | 'completed' | 'failed' | 'not-found' {
    return this.actionQueueManager.getActionStatus(actionId);
  }

  public getQueueStatus(): { autoActions: number; pendingActions: number; executedActions: number } {
    return this.actionQueueManager.getQueueStatus();
  }

  public clearActionQueue(): void {
    this.actionQueueManager.clearQueues();
  }

  private relaseUrl?: () => void; // Avoid memory leak with `URL.createObjectURL`
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

    viewerUrl += `?file=${fileUrl}`;

    if (typeof this.viewerId !== 'undefined') {
      viewerUrl += `&viewerId=${this.viewerId}`;
    }
    if (typeof this.onBeforePrint !== 'undefined') {
      viewerUrl += `&beforePrint=true`;
    }
    if (typeof this.onAfterPrint !== 'undefined') {
      viewerUrl += `&afterPrint=true`;
    }
    if (typeof this.onDocumentLoad !== 'undefined') {
      viewerUrl += `&pagesLoaded=true`;
    }
    if (typeof this.onPageChange !== 'undefined') {
      viewerUrl += `&pageChange=true`;
    }

    if (this.downloadFileName) {
      if(!this.downloadFileName.endsWith(".pdf")) {
        this.downloadFileName += ".pdf";
      }
      viewerUrl += `&fileName=${this.downloadFileName}`;
    }
    if (typeof this.openFile !== 'undefined') {
      viewerUrl += `&openFile=${this.openFile}`;
    }
    if (typeof this.download !== 'undefined') {
      viewerUrl += `&download=${this.download}`;
    }
    // Auto-actions are now handled by the action queue system, not URL parameters
    // if (this.startDownload) {
    //   viewerUrl += `&startDownload=${this.startDownload}`;
    // }
    if (typeof this.viewBookmark !== 'undefined') {
      viewerUrl += `&viewBookmark=${this.viewBookmark}`;
    }
    if (typeof this.print !== 'undefined') {
      viewerUrl += `&print=${this.print}`;
    }
    // Auto-actions are now handled by the action queue system, not URL parameters
    // if (this.startPrint) {
    //   viewerUrl += `&startPrint=${this.startPrint}`;
    // }
    if (typeof this.fullScreen !== 'undefined') {
      viewerUrl += `&fullScreen=${this.fullScreen}`;
    }
    // if (this.showFullScreen) {
    //   viewerUrl += `&showFullScreen=${this.showFullScreen}`;
    // }
    if (typeof this.find !== 'undefined') {
      viewerUrl += `&find=${this.find}`;
    }
    // Auto-actions are now handled by the action queue system, not URL parameters
    // if (this.lastPage) {
    //   viewerUrl += `&lastpage=${this.lastPage}`;
    // }
    if (this.cursor) {
      viewerUrl += `&cursor=${this.cursor}`;
    }
    if (this.scroll) {
      viewerUrl += `&scroll=${this.scroll}`;
    }
    if (this.spread) {
      viewerUrl += `&spread=${this.spread}`;
    }
    if (this.locale) {
      viewerUrl += `&locale=${this.locale}`;
    }
    if (this.useOnlyCssZoom) {
      viewerUrl += `&useOnlyCssZoom=${this.useOnlyCssZoom}`;
    }

    if (this._page || this.zoom || this.nameddest || this.pagemode) viewerUrl += "#"
    if (this._page) {
      viewerUrl += `&page=${this._page}`;
    }
    if (this.zoom) {
      viewerUrl += `&zoom=${this.zoom}`;
    }
    if (this.nameddest) {
      viewerUrl += `&nameddest=${this.nameddest}`;
    }
    if (this.pagemode) {
      viewerUrl += `&pagemode=${this.pagemode}`;
    }
    if (this.errorOverride || this.errorAppend) {
      viewerUrl += `&errorMessage=${this.errorMessage}`;

      if (this.errorOverride) {
        viewerUrl += `&errorOverride=${this.errorOverride}`;
      }
      if (this.errorAppend) {
        viewerUrl += `&errorAppend=${this.errorAppend}`;
      }
    }

    if (this.externalWindow) {
      this.viewerTab.location.href = viewerUrl;
    } else {
      this.iframe.nativeElement.contentWindow.location.replace(viewerUrl);
    }
    
    if (this.diagnosticLogs) {
      console.debug(`PdfJsViewer: Viewer URL configuration:
        pdfSrc = ${this.pdfSrc}
        fileUrl = ${fileUrl}
        externalWindow = ${this.externalWindow}
        downloadFileName = ${this.downloadFileName}
        viewerFolder = ${this.viewerFolder}
        openFile = ${this.openFile}
        download = ${this.download}
        viewBookmark = ${this.viewBookmark}
        print = ${this.print}
        fullScreen = ${this.fullScreen}
        find = ${this.find}
        cursor = ${this.cursor}
        scrollMode = ${this.scroll}
        spread = ${this.spread}
        page = ${this.page}
        zoom = ${this.zoom}
        nameddest = ${this.nameddest}
        pagemode = ${this.pagemode}
        errorOverride = ${this.errorOverride}
        errorAppend = ${this.errorAppend}
        errorMessage = ${this.errorMessage}
        
        Auto-actions (handled by action queue):
        startDownload = ${this.startDownload}
        startPrint = ${this.startPrint}
        lastPage = ${this.lastPage}
      `);
      }
  }

  ngOnDestroy(): void {
    // Clean up timeout
    if (this.postMessageTimeout) {
      clearTimeout(this.postMessageTimeout);
      this.postMessageTimeout = null;
    }
    
    // Clean up pending messages
    this.pendingMessages.forEach((message, id) => {
      if (message.timeout) {
        clearTimeout(message.timeout);
      }
    });
    this.pendingMessages.clear();
    
    // Clean up URL
    this.relaseUrl?.();
  }
}

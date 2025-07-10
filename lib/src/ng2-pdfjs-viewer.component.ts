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
      this.executeImmediateActions();
      if (readiness >= 4) {
        this.executeViewerReadyActions();
      }
    }
  }

  queueImmediateAction(action: ViewerAction): void {
    if (this.diagnosticLogs) {
      console.log(`🔍 ActionQueueManager: Queueing immediate action: ${action.action} = ${action.payload}`);
    }
    this.immediateActions.push(action);
    
    // Execute immediately if PostMessage API is ready
    if (this.isPostMessageReady) {
      this.executeImmediateActions();
    }
  }

  queueViewerReadyAction(action: ViewerAction): void {
    if (this.diagnosticLogs) {
      console.log(`🔍 ActionQueueManager: Queueing viewer ready action: ${action.action} = ${action.payload}`);
    }
    this.viewerReadyActions.push(action);
    
    // Execute immediately if components are already ready
    if (this.postMessageReadiness >= 4) {
      this.executeViewerReadyActions();
    }
  }

  queueDocumentLoadedAction(action: ViewerAction): void {
    if (this.diagnosticLogs) {
      console.log(`🔍 ActionQueueManager: Queueing document loaded action: ${action.action} = ${action.payload}`);
    }
    this.documentLoadedActions.push(action);
    
    // Execute immediately if document is already loaded
    if (this.isDocumentLoaded) {
      this.executeDocumentLoadedActions();
    }
  }

  queueOnDemandAction(action: ViewerAction): Promise<ActionExecutionResult> {
    if (this.diagnosticLogs) {
      console.log(`🔍 ActionQueueManager: Queueing on-demand action: ${action.action} = ${action.payload}`);
    }
    this.pendingActions.push(action);
    return this.executeAction(action);
  }

  onDocumentLoaded(): void {
    if (this.diagnosticLogs) {
      console.log('🔍 ActionQueueManager: Document loaded, executing document loaded actions');
    }
    this.isDocumentLoaded = true;
    this.executeDocumentLoadedActions();
  }

  private async executeViewerReadyActions(): Promise<void> {
    if (this.viewerReadyActions.length === 0) return;
    
    if (this.diagnosticLogs) {
      console.log(`🔍 ActionQueueManager: Executing ${this.viewerReadyActions.length} viewer ready actions`);
    }
    
    const actionsToExecute = [...this.viewerReadyActions];
    this.viewerReadyActions = [];
    
    for (const action of actionsToExecute) {
      try {
        await this.executeAction(action);
      } catch (error) {
        if (this.diagnosticLogs) {
          console.error(`🔍 ActionQueueManager: Error executing viewer ready action ${action.action}:`, error);
        }
      }
    }
  }

  private async executeDocumentLoadedActions(): Promise<void> {
    if (this.documentLoadedActions.length === 0) return;
    
    if (this.diagnosticLogs) {
      console.log(`🔍 ActionQueueManager: Executing ${this.documentLoadedActions.length} document loaded actions`);
    }
    
    const actionsToExecute = [...this.documentLoadedActions];
    this.documentLoadedActions = [];
    
    for (const action of actionsToExecute) {
      try {
        await this.executeAction(action);
      } catch (error) {
        if (this.diagnosticLogs) {
          console.error(`🔍 ActionQueueManager: Error executing document loaded action ${action.action}:`, error);
        }
      }
    }
  }

  private async executeImmediateActions(): Promise<void> {
    if (this.immediateActions.length === 0) return;
    
    if (this.diagnosticLogs) {
      console.log(`🔍 ActionQueueManager: Executing ${this.immediateActions.length} immediate actions`);
    }
    
    const actionsToExecute = [...this.immediateActions];
    this.immediateActions = [];
    
    for (const action of actionsToExecute) {
      try {
        await this.executeAction(action);
      } catch (error) {
        if (this.diagnosticLogs) {
          console.error(`🔍 ActionQueueManager: Error executing immediate action ${action.action}:`, error);
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

      // Check condition if specified
      if (action.condition && !action.condition(null)) {
        result.error = 'Condition not met';
        this.executedActions.set(action.id, result);
        return result;
      }

      // Execute the action (no delays or retries - event-driven only)
      let success = false;
      try {
        success = await this.executeActionViaPostMessage(action);
      } catch (error) {
        if (this.diagnosticLogs) {
          console.error(`🔍 ActionQueueManager: Action ${action.action} failed:`, error);
        }
      }

      if (success) {
        result.success = true;
        if (this.diagnosticLogs) {
          console.log(`🔍 ActionQueueManager: Action ${action.action} executed successfully`);
        }
      } else {
        result.error = 'Action failed';
        if (this.diagnosticLogs) {
          console.error(`🔍 ActionQueueManager: Action ${action.action} failed`);
        }
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
      // Check if action is still in queues
      const inImmediate = this.immediateActions.some(a => a.id === actionId);
      const inViewerReady = this.viewerReadyActions.some(a => a.id === actionId);
      const inDocumentLoaded = this.documentLoadedActions.some(a => a.id === actionId);
      const inPending = this.pendingActions.some(a => a.id === actionId);
      
      if (inImmediate || inViewerReady || inDocumentLoaded || inPending) {
        return 'pending';
      }
      return 'not-found';
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
  @Input() public autoDownload: boolean = false;
  @Input() public viewBookmark: boolean = true;
  @Input() public print: boolean = true;
  @Input() public autoPrint: boolean = false;
  @Input() public rotatecw: boolean = false;
  @Input() public rotateccw: boolean = false;
  @Input() public fullScreen: boolean = true;
  //@Input() public showFullScreen: boolean;
  @Input() public find: boolean = true;
  @Input() public zoom: string;
  @Input() public nameddest: string;
  @Input() public pagemode: string;
  @Input() public autoLastPage: boolean = false;
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
  private postMessageReadiness = 0; // Track readiness level from PostMessage wrapper
  private pendingInitialConfig = true;
  private initialConfigQueued = false; // Track if initial configuration has been queued
  private actionQueueManager: ActionQueueManager;

      ngOnInit(): void {   
      // 🟢 TEST LOG - Build verification (BUILD_ID: placeholder)
      console.log('🟢 ng2-pdfjs-viewer.component.ts: TEST LOG - BUILD_ID:', '2025-07-09T22-30-15-000Z');
    
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
        const autoActions = ['autoDownload', 'autoPrint', 'autoLastPage', 'rotatecw', 'rotateccw'];
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
        const immediateActions = ['openFile', 'download', 'print', 'fullScreen', 'find', 'viewBookmark', 'annotations'];
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

  private messageIdCounter = 0;
  private pendingMessages = new Map<string, { resolve: Function, reject: Function }>();

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
    });
  }

  private mapPropertyToAction(propertyName: string): string | null {
    const actionMap: { [key: string]: string } = {
      // Control visibility
      'openFile': 'show-openfile',
      'download': 'show-download',
      'print': 'show-print',
      'fullScreen': 'show-fullscreen',
      'find': 'show-find',
      'viewBookmark': 'show-bookmark',
      'annotations': 'show-annotations',
      
      // Mode controls (can be auto-actions or on-demand)
      'cursor': 'set-cursor',
      'scroll': 'set-scroll',
      'spread': 'set-spread',
      
      // Navigation controls
      'page': 'set-page',
      'zoom': 'set-zoom',
      'nameddest': 'go-to-named-dest',
      'pagemode': 'update-page-mode',
      
      // Auto actions (handled separately, not via dynamic updates)
      'autoLastPage': 'go-to-last-page',
      
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

  /**
   * Determines if a property can be used as an auto-action
   */
  private canBeAutoAction(propertyName: string): boolean {
    const autoActionProperties = [
      'autoDownload', 'autoPrint', 'autoLastPage', 'rotatecw', 'rotateccw',
      'cursor', 'scroll', 'spread', // Mode controls can now be auto-actions
      'page', 'zoom', 'nameddest', 'pagemode', 'locale' // Navigation and configuration can also be auto-actions
    ];
    return autoActionProperties.includes(propertyName);
  }

  /**
   * Determines if a property can be executed on-demand
   */
  private canBeOnDemandAction(propertyName: string): boolean {
    const onDemandProperties = [
      'cursor', 'scroll', 'spread', 'zoom', 'page', 'nameddest', 'pagemode'
    ];
    return onDemandProperties.includes(propertyName);
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

  private pendingChanges: SimpleChanges[] = [];

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
        const immediateActions = ['openFile', 'download', 'print', 'fullScreen', 'find', 'viewBookmark', 'annotations'];
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
          this.onPageChange.emit(event.pageNumber);
        };

        const rotationChangingHandler = (event: any) => {
          const newRotation: ChangedRotation = {
            rotation: event.pagesRotation,
            page: event.pageNumber
          }
          if (this.diagnosticLogs) console.debug("PdfJsViewer: The rotation has changed!", event);
          this.onRotationChange.emit(newRotation);
        };

        const scaleChangingHandler = (event: any) => {
          const newScale: ChangedScale = event.scale;
          if (this.diagnosticLogs) console.debug("PdfJsViewer: The document has scale has changed!", newScale);
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

  // Remove the old configureVisibleFeatures method since all configurations
  // are now handled via the PostMessage system and action queue manager
  // private configureVisibleFeatures() {
  //   // This method is no longer needed as all configurations are handled via PostMessage
  // }

  public refresh(): void { // Needs to be invoked for external window or when needs to reload pdf
    if (this.diagnosticLogs) {
      console.log('🔍 PdfJsViewer: Refreshing viewer - clearing action queue and reloading PDF');
    }
    
    // Clean up existing event listeners
    if ((this as any)._webviewerLoadedHandler) {
      document.removeEventListener("webviewerloaded", (this as any)._webviewerLoadedHandler);
      (this as any)._webviewerLoadedHandler = null;
    }
    
    // Clean up PDF.js event listeners
    if ((this as any)._pdfEventHandlers && this.PDFViewerApplication && this.PDFViewerApplication.eventBus) {
      const eventBus = this.PDFViewerApplication.eventBus;
      const handlers = (this as any)._pdfEventHandlers;
      
      Object.keys(handlers).forEach(eventName => {
        eventBus.off(eventName, handlers[eventName]);
      });
      
      (this as any)._pdfEventHandlers = null;
    }
    
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
        locale = ${this.locale}
        useOnlyCssZoom = ${this.useOnlyCssZoom}
        
        Auto-actions (handled by action queue):
        autoDownload = ${this.autoDownload}
        autoPrint = ${this.autoPrint}
        autoLastPage = ${this.autoLastPage}
      `);
      }
  }

  private queueAllConfigurations(): void {
    if (this.diagnosticLogs) {
      console.log('🔍 PdfJsViewer: Queueing all initial configurations');
    }

    // Queue control visibility configurations (non-auto-actions)
    this.queueConfiguration('openFile', this.openFile, 'show-openfile');
    this.queueConfiguration('download', this.download, 'show-download');
    this.queueConfiguration('print', this.print, 'show-print');
    this.queueConfiguration('fullScreen', this.fullScreen, 'show-fullscreen');
    this.queueConfiguration('find', this.find, 'show-find');
    this.queueConfiguration('viewBookmark', this.viewBookmark, 'show-bookmark');

    // Queue mode configurations (can be auto-actions or immediate)
    if (this.cursor) {
      this.queueConfiguration('cursor', this.cursor, 'set-cursor');
    }
    if (this.scroll) {
      this.queueConfiguration('scroll', this.scroll, 'set-scroll');
    }
    if (this.spread) {
      this.queueConfiguration('spread', this.spread, 'set-spread');
    }

    // Queue navigation configurations (can be auto-actions or immediate)
    if (this._page) {
      this.queueConfiguration('page', this._page, 'set-page');
    }
    if (this.zoom) {
      this.queueConfiguration('zoom', this.zoom, 'set-zoom');
    }
    if (this.nameddest) {
      this.queueConfiguration('nameddest', this.nameddest, 'go-to-named-dest');
    }
    if (this.pagemode) {
      this.queueConfiguration('pagemode', this.pagemode, 'update-page-mode');
    }

    // Queue rotation configurations (immediate actions, not auto-actions)
    if (this.rotatecw === true) {
      this.queueConfiguration('rotatecw', this.rotatecw, 'trigger-rotate-cw');
    }
    if (this.rotateccw === true) {
      this.queueConfiguration('rotateccw', this.rotateccw, 'trigger-rotate-ccw');
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

    // Queue locale and CSS zoom configurations (non-auto-actions)
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
    if (this.autoDownload === true) {
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
    if (this.autoPrint === true) {
      if (this.diagnosticLogs) {
        console.log('🔍 PdfJsViewer: Queueing auto-print for document load');
      }
      this.actionQueueManager.queueDocumentLoadedAction({
        id: 'auto-print',
        type: 'auto',
        action: 'trigger-print',
        payload: true
      });
    }
    if (this.autoLastPage === true) {
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

  ngOnDestroy(): void {
    // Clean up pending messages
    this.pendingMessages.clear();
    
    // Clean up event listeners
    if ((this as any)._webviewerLoadedHandler) {
      document.removeEventListener("webviewerloaded", (this as any)._webviewerLoadedHandler);
      (this as any)._webviewerLoadedHandler = null;
    }
    
    // Clean up PDF.js event listeners
    if ((this as any)._pdfEventHandlers && this.PDFViewerApplication && this.PDFViewerApplication.eventBus) {
      const eventBus = this.PDFViewerApplication.eventBus;
      const handlers = (this as any)._pdfEventHandlers;
      
      Object.keys(handlers).forEach(eventName => {
        eventBus.off(eventName, handlers[eventName]);
      });
      
      (this as any)._pdfEventHandlers = null;
    }
    
    // Reset state flags
    this.initialConfigQueued = false;
    
    // Clean up URL
    this.relaseUrl?.();
  }
}

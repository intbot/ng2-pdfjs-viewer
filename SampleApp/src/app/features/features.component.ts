import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ChangedScale, ChangedRotation } from 'ng2-pdfjs-viewer';
// Additional event data types will be available after library build:
// DocumentError, PagesInfo, PresentationMode, FindOperation, FindMatchesCount,
// DocumentMetadata, DocumentOutline, PageRenderInfo, AnnotationLayerRenderEvent, BookmarkClick

@Component({
  selector: 'app-features',
  standalone: false,
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss']
})
export class FeaturesComponent implements OnInit {
  @ViewChild('pdfViewer', { static: false }) public pdfViewer;

  // Template references for different spinner styles
  @ViewChild('defaultSpinnerTemplate', { static: true }) defaultSpinnerTemplate!: TemplateRef<any>;
  @ViewChild('dotsSpinnerTemplate', { static: true }) dotsSpinnerTemplate!: TemplateRef<any>;
  @ViewChild('bounceSpinnerTemplate', { static: true }) bounceSpinnerTemplate!: TemplateRef<any>;
  @ViewChild('progressSpinnerTemplate', { static: true }) progressSpinnerTemplate!: TemplateRef<any>;
  @ViewChild('corporateSpinnerTemplate', { static: true }) corporateSpinnerTemplate!: TemplateRef<any>;

  // Configuration properties - directly bound to the viewer
  public pdfSrc = '/assets/pdfjs/web/compressed.tracemonkey-pldi-09.pdf';
  public downloadFileName = 'sample-document.pdf';
  public diagnosticLogs = true; // Temporarily enabled for debugging theme issues

  // Control visibility using individual properties (traditional approach)
  public showOpenFile = true;
  public showDownload = true;
  public showPrint = true;
  public showFullScreen = true;
  public showFind = true;
  public showViewBookmark = true;
  public showAnnotations = false;

  // Phase C: Group visibility (toolbar/sidebar)
  public showToolbarLeft = true;
  public showToolbarMiddle = true;
  public showToolbarRight = true;
  public showSecondaryToolbarToggle = true;
  public showSidebar = true;
  public showSidebarLeft = true;
  public showSidebarRight = true;

  // Auto Actions
  public downloadOnLoad = false;
  public printOnLoad = false;
  public showLastPageOnLoad = false;
  public rotateCW = false;
  public rotateCCW = false;

  // Two-way binding properties
  // Separated zoom demo - no two-way binding
  public currentZoom = 'auto';        // What we send TO the PDF viewer
  public detectedZoom = 'auto';       // What we receive FROM the PDF viewer  
  public lastZoomSource = 'initial';  // Track the source of zoom changes
  public cursor = 'select';
  public scroll = 'vertical';
  public spread = 'none';
  public pageMode = 'none';
  public rotation = 0;

  // Navigation
  public page = 1;
  public namedDest: string | undefined;

  // Configuration options
  public locale = 'en-US';
  public useOnlyCssZoom = false;
  public showSpinner = true;

  // Error handling
  public errorOverride = false;
  public errorAppend = true;
  public errorMessage = 'Custom error message for demonstration';

  // Theme & Visual Customization (Phase 1)
  public theme: 'light' | 'dark' | 'auto' = 'light';
  public primaryColor = '#007acc';
  public backgroundColor = '';
  public pageBorderColor = '';
  public toolbarColor = '';
  public textColor = '';
  public borderRadius = '4px';
  public customCSS = '';

  // Spinner demo (Phase 2)
  public useCustomSpinnerTpl = false;
  public selectedSpinnerTemplate = 'default'; // New: template selection
  public spinnerCssClass = 'demo-spinner-overlay';

  // Status bar / layout helpers
  public loading = false;
  public sidenavOpened = false; // reserved for future sidenav step

  // Phase D: Layout customization (demo bindings)
  public toolbarDensity: 'default' | 'compact' | 'comfortable' = 'default';
  public sidebarWidth = '';
  public toolbarPosition: 'top' | 'bottom' = 'top';
  public sidebarPosition: 'left' | 'right' = 'left';
  public responsiveBreakpoint = '';

  // Event feed model
  public eventFeed: Array<{ time: string; type: string; data?: any }> = [];
  public feedPaused = false;
  public feedFilter: Set<string> = new Set();

  private pushEventToFeed(type: string, data?: any) {
    if (this.feedPaused) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour12: false });
    // basic filter: if filters set, only include selected types
    if (this.feedFilter.size > 0 && !this.feedFilter.has(type)) return;
    this.eventFeed.unshift({ time, type, data });
    if (this.eventFeed.length > 200) this.eventFeed.pop();
  }

  // Event tracking for demonstration
  public eventCounts = {
    documentLoad: 0,
    pageChange: 0,
    scaleChange: 0,
    rotationChange: 0,
    beforePrint: 0,
    afterPrint: 0,
    // New high-value events (13 total)
    documentError: 0,
    documentInit: 0,
    pagesInit: 0,
    presentationModeChanged: 0,
    openFile: 0,
    find: 0,
    updateFindMatchesCount: 0,
    metadataLoaded: 0,
    outlineLoaded: 0,
    pageRendered: 0,
    annotationLayerRendered: 0,
    bookmarkClick: 0,
    idle: 0
  };

  // Blinking animation tracking
  public blinkingEvents = {
    documentLoad: false,
    pageChange: false,
    scaleChange: false,
    rotationChange: false,
    beforePrint: false,
    afterPrint: false,
    // New high-value events (13 total)
    documentError: false,
    documentInit: false,
    pagesInit: false,
    presentationModeChanged: false,
    openFile: false,
    find: false,
    updateFindMatchesCount: false,
    metadataLoaded: false,
    outlineLoaded: false,
    pageRendered: false,
    annotationLayerRendered: false,
    bookmarkClick: false,
    idle: false
  };

  // Current state display
  public currentPage = 1;
  public currentScale = 1;
  public currentRotation = 0;
  public totalPages = 0;

  constructor() { }

  ngOnInit() {
    console.log('🎬 Features Demo: Component initialized');
    
    // Initialize detected zoom display
    this.detectedZoom = this.formatZoomDisplay(1.0); // Default to 100%
    this.lastZoomSource = 'initial';
  }

  // Get the selected spinner template reference
  getSelectedSpinnerTemplate(): TemplateRef<any> | null {
    switch (this.selectedSpinnerTemplate) {
      case 'dots': return this.dotsSpinnerTemplate;
      case 'bounce': return this.bounceSpinnerTemplate;
      case 'progress': return this.progressSpinnerTemplate;
      case 'corporate': return this.corporateSpinnerTemplate;
      default: return this.defaultSpinnerTemplate;
    }
  }

  // Zoom demo methods (Angular → PDF direction)
  setZoom(zoomValue: string) {
    console.log('🎬 Features Demo: Setting zoom via Angular button to:', zoomValue);
    this.currentZoom = zoomValue;
    this.lastZoomSource = 'Angular button click';
  }

  // Format zoom value for display (PDF → Angular direction)  
  formatZoomDisplay(scale: number | string): string {
    if (typeof scale === 'number') {
      return `${Math.round(scale * 100)}%`;
    }
    return scale?.toString() || 'auto';
  }

  // Event handlers - clean and simple with blinking animation
  public onDocumentLoad() {
    this.eventCounts.documentLoad++;
    this.triggerBlink('documentLoad');
    if (this.pdfViewer?.PDFViewerApplication) {
      this.totalPages = this.pdfViewer.PDFViewerApplication.pagesCount || 0;
    }
    console.log('🎬 Features Demo: Document loaded, total pages:', this.totalPages);
    this.pushEventToFeed('documentLoad');
  }

  public onPageChange(pageNumber: number) {
    this.eventCounts.pageChange++;
    this.triggerBlink('pageChange');
    this.currentPage = pageNumber;
    this.page = pageNumber; // Fix: Update the property bound to the viewer
    console.log('🎬 Features Demo: Page changed to:', pageNumber);
    this.pushEventToFeed('pageChange', { pageNumber });
  }

  public onScaleChange(scale: ChangedScale) {
    this.eventCounts.scaleChange++;
    this.triggerBlink('scaleChange');
    this.currentScale = scale;
    
    // Update detected zoom display (PDF → Angular direction)
    this.detectedZoom = this.formatZoomDisplay(scale);
    this.lastZoomSource = 'PDF viewer user action';
    
    console.log('🎬 Features Demo: Scale changed to:', scale, 'Formatted:', this.detectedZoom);
    this.pushEventToFeed('scaleChange', { scale });
  }

  public onRotationChange(rotation: ChangedRotation) {
    this.eventCounts.rotationChange++;
    this.triggerBlink('rotationChange');
    this.currentRotation = rotation.rotation;
    // Update the rotation property since we now use one-way binding
    this.rotation = rotation.rotation;
    console.log('🎬 Features Demo: Rotation changed via PDF viewer interaction:', rotation.rotation);
    this.pushEventToFeed('rotationChange', rotation);
  }

  public onBeforePrint() {
    this.eventCounts.beforePrint++;
    this.triggerBlink('beforePrint');
    console.log('🎬 Features Demo: Before print event');
    this.pushEventToFeed('beforePrint');
  }

  public onAfterPrint() {
    this.eventCounts.afterPrint++;
    this.triggerBlink('afterPrint');
    console.log('🎬 Features Demo: After print event');
    this.pushEventToFeed('afterPrint');
  }

  // New High-Value Event Handlers (13 total)
  public onDocumentError(error: any) {
    this.eventCounts.documentError++;
    this.triggerBlink('documentError');
    console.log('🎬 Features Demo: Document error:', error);
    this.pushEventToFeed('documentError', error);
  }

  public onDocumentInit() {
    this.eventCounts.documentInit++;
    this.triggerBlink('documentInit');
    console.log('🎬 Features Demo: Document init event');
    this.pushEventToFeed('documentInit');
  }

  public onPagesInit(pagesInfo: any) {
    this.eventCounts.pagesInit++;
    this.triggerBlink('pagesInit');
    console.log('🎬 Features Demo: Pages init event:', pagesInfo);
    this.pushEventToFeed('pagesInit', pagesInfo);
  }

  public onPresentationModeChanged(mode: any) {
    this.eventCounts.presentationModeChanged++;
    this.triggerBlink('presentationModeChanged');
    console.log('🎬 Features Demo: Presentation mode changed:', mode);
    this.pushEventToFeed('presentationModeChanged', mode);
  }

  public onOpenFile() {
    this.eventCounts.openFile++;
    this.triggerBlink('openFile');
    console.log('🎬 Features Demo: Open file event');
    this.pushEventToFeed('openFile');
  }

  public onFind(findData: any) {
    this.eventCounts.find++;
    this.triggerBlink('find');
    console.log('🎬 Features Demo: Find operation:', findData);
    this.pushEventToFeed('find', findData);
  }

  public onUpdateFindMatchesCount(matchData: any) {
    this.eventCounts.updateFindMatchesCount++;
    this.triggerBlink('updateFindMatchesCount');
    console.log('🎬 Features Demo: Find matches count updated:', matchData);
    this.pushEventToFeed('updateFindMatchesCount', matchData);
  }

  public onMetadataLoaded(metadata: any) {
    this.eventCounts.metadataLoaded++;
    this.triggerBlink('metadataLoaded');
    console.log('🎬 Features Demo: Metadata loaded:', metadata);
    this.pushEventToFeed('metadataLoaded', metadata);
  }

  public onOutlineLoaded(outline: any) {
    this.eventCounts.outlineLoaded++;
    this.triggerBlink('outlineLoaded');
    console.log('🎬 Features Demo: Outline loaded:', outline);
    this.pushEventToFeed('outlineLoaded', outline);
  }

  public onPageRendered(pageInfo: any) {
    this.eventCounts.pageRendered++;
    this.triggerBlink('pageRendered');
    console.log('🎬 Features Demo: Page rendered:', pageInfo);
    this.pushEventToFeed('pageRendered', pageInfo);
  }

  public onAnnotationLayerRendered(annotationInfo: any) {
    this.eventCounts.annotationLayerRendered++;
    this.triggerBlink('annotationLayerRendered');
    console.log('🎬 Features Demo: Annotation layer rendered:', annotationInfo);
    this.pushEventToFeed('annotationLayerRendered', annotationInfo);
  }

  public onBookmarkClick(bookmarkData: any) {
    this.eventCounts.bookmarkClick++;
    this.triggerBlink('bookmarkClick');
    console.log('🎬 Features Demo: Bookmark clicked:', bookmarkData);
    this.pushEventToFeed('bookmarkClick', bookmarkData);
  }

  public onIdle() {
    this.eventCounts.idle++;
    this.triggerBlink('idle');
    console.log('🎬 Features Demo: User idle event');
    this.pushEventToFeed('idle');
  }

  // Trigger blinking animation for event counters
  private triggerBlink(eventType: keyof typeof this.blinkingEvents) {
    this.blinkingEvents[eventType] = true;
    setTimeout(() => {
      this.blinkingEvents[eventType] = false;
    }, 1000); // Blink for 1 second
  }

  // Simple action methods using the library's public API
  public async triggerDownload() {
    try {
      const result = await this.pdfViewer.triggerDownload();
      console.log('🎬 Features Demo: Download triggered:', result);
      } catch (error) {
      console.error('🎬 Features Demo: Download failed:', error);
    }
  }

  public async triggerPrint() {
      try {
      const result = await this.pdfViewer.triggerPrint();
      console.log('🎬 Features Demo: Print triggered:', result);
      } catch (error) {
      console.error('🎬 Features Demo: Print failed:', error);
    }
  }

  public async goToPage(pageNumber: number) {
      try {
      const result = await this.pdfViewer.goToPage(pageNumber);
      console.log('🎬 Features Demo: Navigated to page:', pageNumber, result);
      } catch (error) {
      console.error('🎬 Features Demo: Navigation failed:', error);
    }
  }

  public async rotateClockwise() {
      try {
      const result = await this.pdfViewer.triggerRotation('cw');
      console.log('🎬 Features Demo: Rotated clockwise:', result);
      } catch (error) {
      console.error('🎬 Features Demo: Rotation failed:', error);
    }
  }

  public async rotateCounterClockwise() {
      try {
      const result = await this.pdfViewer.triggerRotation('ccw');
      console.log('🎬 Features Demo: Rotated counter-clockwise:', result);
      } catch (error) {
      console.error('🎬 Features Demo: Rotation failed:', error);
      }
    }

  // Convenience setter demonstrations
  public useTraditionalApproach = true;

  public get controlVisibilityConfig() {
    return {
      download: this.showDownload,
      print: this.showPrint,
      find: this.showFind,
      fullScreen: this.showFullScreen,
      openFile: this.showOpenFile,
      viewBookmark: this.showViewBookmark,
      annotations: this.showAnnotations
    };
  }

  public get autoActionsConfig() {
    return {
      downloadOnLoad: this.downloadOnLoad,
      printOnLoad: this.printOnLoad,
      showLastPageOnLoad: this.showLastPageOnLoad
    };
  }

  public get viewerConfig() {
    return {
      diagnosticLogs: this.diagnosticLogs,
      useOnlyCssZoom: this.useOnlyCssZoom,
      locale: this.locale
    };
  }

  public get errorConfig() {
    return {
      override: this.errorOverride,
      append: this.errorAppend,
      message: this.errorMessage
    };
  }

  public get themeConfig() {
    return {
      theme: this.theme,
      primaryColor: this.primaryColor,
      backgroundColor: this.backgroundColor,
      pageBorderColor: this.pageBorderColor,
      toolbarColor: this.toolbarColor,
      textColor: this.textColor,
      borderRadius: this.borderRadius,
      customCSS: this.customCSS
    };
  }

  // Simple reload using library refresh method
  public reloadViewer() {
    console.log('🎬 Features Demo: *** reloadViewer() method called ***');
    if (this.pdfViewer) {
      console.log('🎬 Features Demo: pdfViewer exists, calling refresh()');
      this.pdfViewer.refresh();
      console.log('🎬 Features Demo: refresh() method called');
    } else {
      console.log('🎬 Features Demo: ERROR - pdfViewer is null/undefined');
    }
  }

  // Reset event counters for demo purposes
  public resetEventCounts() {
    this.eventCounts = {
      documentLoad: 0,
      pageChange: 0,
      scaleChange: 0,
      rotationChange: 0,
      beforePrint: 0,
      afterPrint: 0,
      // New high-value events (13 total)
      documentError: 0,
      documentInit: 0,
      pagesInit: 0,
      presentationModeChanged: 0,
      openFile: 0,
      find: 0,
      updateFindMatchesCount: 0,
      metadataLoaded: 0,
      outlineLoaded: 0,
      pageRendered: 0,
      annotationLayerRendered: 0,
      bookmarkClick: 0,
      idle: 0
    };
    this.blinkingEvents = {
      documentLoad: false,
      pageChange: false,
      scaleChange: false,
      rotationChange: false,
      beforePrint: false,
      afterPrint: false,
      // New high-value events (13 total)
      documentError: false,
      documentInit: false,
      pagesInit: false,
      presentationModeChanged: false,
      openFile: false,
      find: false,
      updateFindMatchesCount: false,
      metadataLoaded: false,
      outlineLoaded: false,
      pageRendered: false,
      annotationLayerRendered: false,
      bookmarkClick: false,
      idle: false
    };
    console.log('🎬 Features Demo: Event counts reset');
  }

  // Auto-actions only execute on component creation, not property changes.
  // Use trackBy key to force component recreation for testing.
  public viewerTrackingKey = Date.now();
  public trackByKey = (index: number, item: any): any => item;

  // Reload viewer to test auto actions - forces complete component destruction and recreation
  public testAutoActions() {
    console.log('🎬 Features Demo: *** BUTTON CLICKED - testAutoActions called ***');
    console.log('🎬 Features Demo: Reloading viewer to test auto actions');
    
    // Reset event counters to better show auto action effects
    this.resetEventCounts();
    
    // Log current auto actions state before reload
    console.log('🎬 Features Demo: Current auto actions enabled:');
    console.log('  - downloadOnLoad:', this.downloadOnLoad);
    console.log('  - printOnLoad:', this.printOnLoad);
    console.log('  - showLastPageOnLoad:', this.showLastPageOnLoad);
    console.log('  - rotateCW:', this.rotateCW);
    console.log('  - rotateCCW:', this.rotateCCW);
    
    // Force complete component recreation by changing the tracking key
    const previousKey = this.viewerTrackingKey;
    this.viewerTrackingKey = Date.now();
    console.log(`🎬 Features Demo: Component tracking key changed from ${previousKey} to ${this.viewerTrackingKey} - component will be recreated`);
  }

  // Reload viewer to test loading spinner - forces complete component destruction and recreation
  public testLoadingSpinner() {
    console.log('🎬 Features Demo: *** BUTTON CLICKED - testLoadingSpinner called ***');
    console.log('🎬 Features Demo: Reloading viewer to test loading spinner');
    
    // Log current spinner settings before reload
    console.log('🎬 Features Demo: Current spinner settings:');
    console.log('  - showSpinner:', this.showSpinner);
    console.log('  - useCustomSpinnerTpl:', this.useCustomSpinnerTpl);
    console.log('  - selectedSpinnerTemplate:', this.selectedSpinnerTemplate);
    console.log('  - spinnerCssClass:', this.spinnerCssClass);
    
    // Force complete component recreation by changing the tracking key
    const previousKey = this.viewerTrackingKey;
    this.viewerTrackingKey = Date.now();
    console.log(`🎬 Features Demo: Component tracking key changed from ${previousKey} to ${this.viewerTrackingKey} - component will be recreated`);
  }

  // Test error handling
  public testError() {
    console.log('🎬 Features Demo: Testing error handling');
    this.pdfSrc = 'invalid-url.pdf';
  }

  public restoreValidPdf() {
    console.log('🎬 Features Demo: Restoring valid PDF');
    this.pdfSrc = '/assets/pdfjs/web/compressed.tracemonkey-pldi-09.pdf';
  }
} 